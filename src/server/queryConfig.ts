// Query safety configuration
export const QUERY_LIMITS = {
  MAX_ROWS: 1000,           // Maximum rows to return
  TIMEOUT_MS: 30000,        // 30 second timeout
  MAX_QUERY_LENGTH: 10000,  // Maximum query length
};

// Dangerous patterns that should be blocked or limited
export const DANGEROUS_PATTERNS = [
  /SELECT\s+\*\s+FROM\s+\w+\s*(?:;|\s*$)/i,  // SELECT * without WHERE/LIMIT
  /DELETE\s+FROM/i,                           // DELETE statements
  /DROP\s+/i,                                 // DROP statements
  /CREATE\s+/i,                               // CREATE statements
  /ALTER\s+/i,                                // ALTER statements
  /INSERT\s+/i,                               // INSERT statements
  /UPDATE\s+/i,                               // UPDATE statements
  /TRUNCATE\s+/i,                             // TRUNCATE statements
];

// Environment-based overrides
export const getQueryLimits = () => {
  return {
    MAX_ROWS: parseInt(process.env.MCP_MAX_ROWS || String(QUERY_LIMITS.MAX_ROWS)),
    TIMEOUT_MS: parseInt(process.env.MCP_TIMEOUT_MS || String(QUERY_LIMITS.TIMEOUT_MS)),
    MAX_QUERY_LENGTH: parseInt(process.env.MCP_MAX_QUERY_LENGTH || String(QUERY_LIMITS.MAX_QUERY_LENGTH)),
  };
}; 