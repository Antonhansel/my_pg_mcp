import { ReadResourceRequest } from "@modelcontextprotocol/sdk/types";
import { pool } from "./database";

export const listAvailableTables = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    return {
      resources: result.rows.map((row) => ({
        name: `${row.table_name} schema`,
        uri: row.table_name,
      })),
    };
  } finally {
    client.release();
  }
};

export const readTableSchema = async (request: ReadResourceRequest) => {
  const tableName = request.params.uri;
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
      [tableName],
    );

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(result.rows, null, 2),
        },
      ],
    };
  } finally {
    client.release();
  }
};
