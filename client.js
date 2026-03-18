import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});

const client = new Client(
  {
    name: "demo-client",
    version: "1.0.0"
  },
  {
    capabilities: {}
  }
);

await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log("Available tools:", tools);

// Call the addNumbers tool
const result = await client.callTool({
  name: "addNumbers",
  arguments: { a: 3, b: 4 }
});

console.log("Tool result:", result);

process.exit(0);
