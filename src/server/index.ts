// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listTools } from "./listTools";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleQuery } from "./queryHandler";
import { listAvailableTables, readTableSchema } from "./resources";

const server = new Server({
  name: "my_pg_mcp", version: "0.1.0"
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// Tools
server.setRequestHandler(ListToolsRequestSchema, listTools);
server.setRequestHandler(CallToolRequestSchema, handleQuery);

// Resources
server.setRequestHandler(ListResourcesRequestSchema, listAvailableTables);
server.setRequestHandler(ReadResourceRequestSchema, readTableSchema);

async function main() {
  try {
    console.error("Starting MCP server...");
    const transport = new StdioServerTransport();
    console.error("Transport created");
    await server.connect(transport);
    console.error("Server connected");
    // MCP servers should be silent - no logging to avoid protocol interference
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});