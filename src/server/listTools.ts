export const listTools = async () => {
  return {
    tools: [
      {
        name: "query-database",
        description: "Run a read-only SQL query against the database",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string" },
          },
        },
      },
    ],
  };
};