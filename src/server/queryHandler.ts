import { pool } from "./database";
import { CallToolRequest } from "@modelcontextprotocol/sdk/types";
import { DANGEROUS_PATTERNS, getQueryLimits } from "./queryConfig";

const analyzeQuery = (sql: string): { isAllowed: boolean; reason?: string; needsLimit: boolean } => {
  const limits = getQueryLimits();

  // Check query length
  if (sql.length > limits.MAX_QUERY_LENGTH) {
    return { isAllowed: false, reason: "Query too long", needsLimit: false };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sql)) {
      // Special handling for SELECT * - allow but force limit
      if (pattern.source.includes('SELECT.*\\*')) {
        return { isAllowed: true, needsLimit: true, reason: "SELECT * detected - will add LIMIT" };
      }
      return { isAllowed: false, reason: `Dangerous pattern detected: ${pattern.source}`, needsLimit: false };
    }
  }

  // Check if query already has LIMIT
  const hasLimit = /LIMIT\s+\d+/i.test(sql);
  const needsLimit = !hasLimit && /SELECT/i.test(sql);

  return { isAllowed: true, needsLimit };
};

const addLimitToQuery = (sql: string): string => {
  const limits = getQueryLimits();

  // If query already has LIMIT, respect it but cap at MAX_ROWS
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    const requestedLimit = parseInt(limitMatch[1]);
    if (requestedLimit > limits.MAX_ROWS) {
      return sql.replace(/LIMIT\s+\d+/i, `LIMIT ${limits.MAX_ROWS}`);
    }
    return sql;
  }

  // Add LIMIT to SELECT queries that don't have one
  if (/SELECT/i.test(sql)) {
    // Handle queries that end with semicolon
    if (sql.trim().endsWith(';')) {
      return sql.trim().slice(0, -1) + ` LIMIT ${limits.MAX_ROWS};`;
    }
    return sql.trim() + ` LIMIT ${limits.MAX_ROWS}`;
  }

  return sql;
};

export const handleQuery = async (request: CallToolRequest) => {
  if (request.params.name !== "query-database" || !request.params.arguments?.sql) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const originalSql = request.params.arguments.sql as string;
  const limits = getQueryLimits();

  // Analyze the query for safety
  const analysis = analyzeQuery(originalSql);

  if (!analysis.isAllowed) {
    return {
      content: [{
        type: "text",
        text: `Query blocked for safety: ${analysis.reason}`
      }],
      isError: true,
    };
  }

  // Apply row limiting if needed
  const sql = analysis.needsLimit ? addLimitToQuery(originalSql) : originalSql;

  // Log if we modified the query
  if (sql !== originalSql) {
    console.log(`Query modified for safety: ${originalSql} -> ${sql}`);
  }

  const client = await pool.connect();
  try {
    // Start a read-only transaction
    await client.query("BEGIN TRANSACTION READ ONLY");

    // Set query timeout
    await client.query(`SET statement_timeout = ${limits.TIMEOUT_MS}`);

    // Execute the query
    const result = await client.query(sql);

    // Check if we hit the row limit and warn the user
    const hitLimit = result.rows.length === limits.MAX_ROWS;
    const responseText = hitLimit
      ? `${JSON.stringify(result.rows, null, 2)}\n\n⚠️  Results limited to ${limits.MAX_ROWS} rows. Use LIMIT clause for different limits.`
      : JSON.stringify(result.rows, null, 2);

    return {
      content: [{
        type: "text",
        text: responseText
      }],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error executing query: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true,
    };
  } finally {
    // Always rollback and release the client
    await client.query("ROLLBACK");
    client.release();
  }
}; 