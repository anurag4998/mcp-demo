import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "terminal-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register the addNumbers tool
/*
    Purpose: Discovers what tools are available on the server                                                                                                                                                                                                                                                                                                                                                                                                                                    
    When used: Before calling any tool, the client needs to know what tools exist and their signatures
     Request:
    // Client sends
    {
        method: "tools/list",
        params: {}  // No parameters needed
    }
      Response:
  // Server responds with tool definitions
  {
    tools: [
      {
        name: "addNumbers",
        description: "Adds two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" }
          },
          required: ["a", "b"]
        }
      },
      // ... more tools
    ]
  }
*/

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "addNumbers",
        description: "Adds two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" },
          },
          required: ["a", "b"],
        },
      },
    ],
  };
});

/*
    
  CallToolRequestSchema
  Purpose: Executes a specific tool with arguments
  When used: After discovering tools, the client calls one with actual data
  */

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "addNumbers") {
    const result = args.a + args.b;
    return {
      content: [
        {
          type: "text",
          text: `Result is ${result}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
