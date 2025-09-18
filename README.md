# Web Fetch MCP Server
[English](README.md) | [中文](README-zh.md)
[![npm version](https://badge.fury.io/js/web-fetch-mcp.svg)](https://badge.fury.io/js/web-fetch-mcp)

A Model Context Protocol (MCP) server that provides web content fetching, summarization, comparison, and extraction capabilities.

## Features

- **Three Core Tools**: Provides `summarize_web`, `compare_web`, and `extract_web` for versatile web content processing.
- **Handles Multiple URLs**: Process up to 20 URLs in a single request.
- **Content Transformation**: Converts HTML to clean, readable text and automatically resolves GitHub `/blob/` URLs to their raw content equivalent.
- **Safe & Secure**: Protects against Server-Side Request Forgery (SSRF) by blocking requests to private IP addresses.
- **Configurable**: Allows setting timeouts and content length limits to manage performance.

## Installation

Install the server globally from npm:

```bash
npm install -g web-fetch-mcp
```

## MCP Agent Configuration

To use this server with an AI agent that supports the Model Context Protocol, add the following configuration to your agent's settings. Once configured, your agent can call the tools provided by this service.

**Important:** You must provide a valid Gemini API key for the server to work.

If you installed the package globally:

```json
{
  "mcpServers": {
    "web-fetch-mcp": {
      "type": "stdio",
      "command": "web-fetch-mcp",
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

Note: If you encounter network access issues (e.g., unable to connect to Gemini), you can configure the environment variables HTTPS_PROXY and HTTP_PROXY. By default, the gemini-2.5-flash model is used, consistent with Gemini-CLI.

If you are running from a local clone:

```json
{
  "mcpServers": {
    "web-fetch-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/web-fetch-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

## Tool Reference

The service provides the following tools:

- `summarize_web`: Summarizes content from one or more URLs.
- `compare_web`: Compares content across multiple URLs.
- `extract_web`: Extracts specific information from web content using natural language prompts.

### Example Tool Call

To use a tool, your agent should make a `callTool` request specifying the tool name and a `prompt`:

```json
{
  "tool": "summarize_web",
  "arguments": {
    "prompt": "Summarize the main points from https://example.com/article"
  }
}
```

## For Developers

If you wish to contribute to the development of this server:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/web-fetch-mcp.git
    cd web-fetch-mcp
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode:**
    ```bash
    npm run dev
    ```
4.  **Build for production:**
    ```bash
    npm run build
    ```
