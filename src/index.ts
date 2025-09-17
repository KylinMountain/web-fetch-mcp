#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { WebFetchService } from './web-fetch-service.js';

class WebFetchMCPServer {
  private server: Server;
  private webFetchService: WebFetchService;

  constructor() {
    this.server = new Server(
      {
        name: 'web-fetch-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.webFetchService = new WebFetchService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'summarize_web',
            description: 'Summarize content from one or more URLs',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Natural language prompt containing URLs (up to 20) and summarization instructions',
                },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'compare_web',
            description: 'Compare content from multiple URLs',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Natural language prompt containing URLs (up to 20) and comparison instructions',
                },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'extract_web',
            description: 'Extract specific information from web content based on natural language prompts',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'Natural language prompt containing URLs (up to 20) and extraction instructions',
                },
              },
              required: ['prompt'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!args || typeof args !== 'object' || !('prompt' in args)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: prompt'
          );
        }

        const prompt = String(args.prompt);

        if (!prompt.trim()) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Prompt cannot be empty'
          );
        }

        let result: string;

        switch (name) {
          case 'summarize_web':
            result = await this.webFetchService.summarizeWeb(prompt);
            break;
          case 'compare_web':
            result = await this.webFetchService.compareWeb(prompt);
            break;
          case 'extract_web':
            result = await this.webFetchService.extractWeb(prompt);
            break;
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Web Fetch MCP Server running on stdio');
  }
}

async function main() {
  const server = new WebFetchMCPServer();
  await server.run();
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});