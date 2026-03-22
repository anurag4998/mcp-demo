import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * In-memory datastore
 */
let books = [];
let idCounter = 1;

const server = new Server(
  {
    name: "bookstore-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * LIST TOOLS
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "createBook",
        description: "Create a new book",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            price: { type: "number" },
          },
          required: ["title", "author"],
        },
      },
      {
        name: "getBooks",
        description: "Get all books",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "getBookById",
        description: "Get a book by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
      },
      {
        name: "updateBook",
        description: "Update a book",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number" },
            title: { type: "string" },
            author: { type: "string" },
            price: { type: "number" },
          },
          required: ["id"],
        },
      },
      {
        name: "deleteBook",
        description: "Delete a book",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
      },
    ],
  };
});

/**
 * CALL TOOL HANDLER
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  /**
   * CREATE BOOK
   */
  if (name === "createBook") {
    const { title, author, price } = args;

    const newBook = {
      id: idCounter++,
      title,
      author,
      price: price || 0,
    };

    books.push(newBook);

    return {
      content: [
        {
          type: "text",
          text: `Book created: ${JSON.stringify(newBook)}`,
        },
      ],
    };
  }

  /**
   * GET ALL BOOKS
   */
  if (name === "getBooks") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(books),
        },
      ],
    };
  }

  /**
   * GET BOOK BY ID
   */
  if (name === "getBookById") {
    const book = books.find((b) => b.id === args.id);

    if (!book) {
      throw new Error("Book not found");
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(book),
        },
      ],
    };
  }

  /**
   * UPDATE BOOK
   */
  if (name === "updateBook") {
    const book = books.find((b) => b.id === args.id);

    if (!book) {
      throw new Error("Book not found");
    }

    if (args.title !== undefined) book.title = args.title;
    if (args.author !== undefined) book.author = args.author;
    if (args.price !== undefined) book.price = args.price;

    return {
      content: [
        {
          type: "text",
          text: `Updated book: ${JSON.stringify(book)}`,
        },
      ],
    };
  }

  /**
   * DELETE BOOK
   */
  if (name === "deleteBook") {
    const index = books.findIndex((b) => b.id === args.id);

    if (index === -1) {
      throw new Error("Book not found");
    }

    const deleted = books.splice(index, 1)[0];

    return {
      content: [
        {
          type: "text",
          text: `Deleted book: ${JSON.stringify(deleted)}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * START SERVER
 */
const transport = new StdioServerTransport();
await server.connect(transport);