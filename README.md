# Web Fetch MCP Server

[English](README.md) | [中文](README-zh.md)

A Model Context Protocol (MCP) server that provides web content fetching, summarization, comparison, and extraction capabilities. This server transforms the original gemini-cli web-fetch tool into a standalone MCP-compliant server.

## Features

- **summarize_web**: Summarize content from one or more URLs (up to 20)
- **compare_web**: Compare content across multiple URLs
- **extract_web**: Extract specific information from web content using natural language prompts
- Handles up to 20 URLs per request
- Converts HTML to clean text
- Supports GitHub raw content conversion
- Private IP protection (blocks localhost/private networks)
- Configurable timeouts and content limits

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-fetch-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm install -g .
```

## Configuration

The server includes a `mcp.json` configuration file that defines the MCP server metadata and tool specifications:

```json
{
  "name": "web-fetch-mcp",
  "version": "1.0.0",
  "description": "MCP server for web content fetching, summarizing, comparing, and extracting information",
  "command": "node",
  "args": ["dist/index.js"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Starting the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Direct Execution
```bash
node dist/index.js
```

## Tool Usage Examples

### 1. summarize_web
Summarize content from URLs:

```json
{
  "tool": "summarize_web",
  "arguments": {
    "prompt": "Summarize the main points from https://example.com/article and https://another.com/data"
  }
}
```

### 2. compare_web
Compare content across multiple URLs:

```json
{
  "tool": "compare_web",
  "arguments": {
    "prompt": "Compare the features described on https://product1.com and https://product2.com"
  }
}
```

### 3. extract_web
Extract specific information from web content:

```json
{
  "tool": "extract_web",
  "arguments": {
    "prompt": "Extract all email addresses and contact information from https://company.com/contact"
  }
}
```

## Integration with Claude Code

To use this server with Claude Code, add it to your MCP configuration:

```json
{
  "mcpServers": {
    "web-fetch": {
      "command": "node",
      "args": ["/path/to/web-fetch-mcp/dist/index.js"]
    }
  }
}
```

## API Reference

### Tool Parameters

All tools accept a single parameter:

- **prompt** (string, required): Natural language prompt containing:
  - One or more URLs (up to 20)
  - Instructions for processing (summarize, compare, extract)

### Response Format

All tools return a text response containing:

- Processed content based on the tool's purpose
- Source URLs and processing metadata
- Error messages for failed fetches

### Error Handling

The server handles various error conditions:

- **Invalid URLs**: Returns descriptive error messages
- **Network timeouts**: 10-second timeout per URL
- **Private IPs**: Blocks localhost and private network addresses
- **Content limits**: Maximum 100,000 characters per URL
- **GitHub URLs**: Automatically converts `/blob/` URLs to raw content

## Development

### Project Structure
```
src/
├── index.ts              # Main MCP server entry point
├── web-fetch-service.ts  # Core web fetching and processing logic
├── gemini-service.ts     # Gemini API integration for content processing
└── utils/
    ├── errors.ts         # Error handling utilities
    └── fetch.ts          # HTTP fetching and IP validation utilities
```

### Building
```bash
npm run build    # Compiles TypeScript to JavaScript
npm run clean    # Removes build artifacts
```

### Testing
```bash
npm run dev      # Run in development mode with hot reload
```

## Limitations

- **No LLM Integration**: This implementation uses basic text processing instead of actual LLM calls. For production use, integrate with an LLM service like OpenAI, Anthropic, or Google Gemini.
- **Private Networks**: Private IP addresses (localhost, 10.x.x.x, 172.16-31.x.x, 192.168.x.x) are blocked for security.
- **Content Limits**: Maximum 100,000 characters per URL to prevent memory issues.
- **Rate Limiting**: No built-in rate limiting - implement if needed for your use case.

## Security Considerations

- Private IP addresses are blocked to prevent access to internal services
- URLs are validated before fetching
- Content length is limited to prevent DoS attacks
- GitHub URLs are automatically converted to raw content URLs

## License

Apache-2.0 License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure you have Node.js 18+ installed
2. **Permission Errors**: Check file permissions and try `chmod +x dist/index.js`
3. **Network Timeouts**: Check your internet connection and firewall settings
4. **MCP Connection Issues**: Verify the server path in your MCP configuration

### Debug Mode

Set the `DEBUG` environment variable for verbose logging:
```bash
DEBUG=* node dist/index.js
```

## Claude Code Usage Examples

### Basic Usage

#### 1. Summarize Web Content
```
Please use the web-fetch summarize_web tool to summarize the main content of this webpage:
https://example.com/article-about-artificial-intelligence
```

#### 2. Compare Multiple Webpages
```
Please use the web-fetch compare_web tool to compare the features of these two products:
https://product1.com/features and https://product2.com/features
```

#### 3. Extract Specific Information
```
Please use the web-fetch extract_web tool to extract all email addresses and contact information from the following webpage:
https://company.com/contact-us
```

### Advanced Usage Scenarios

#### Multi-URL Summary
```
Please summarize the following 3 webpages about machine learning and extract key concepts:
https://site1.com/ml-intro
https://site2.com/ml-algorithms
https://site3.com/ml-applications
```

#### Technical Documentation Comparison
```
Please compare these API documentation to find functional differences:
https://api1.com/docs and https://api2.com/docs
Focus on authentication methods, endpoint coverage, and pricing information.
```

#### Content Extraction and Analysis
```
Please extract title, author, publication date, and main content summary from the following webpage:
https://blog.example.com/tech-article
```

### Practical Tips

#### Natural Language Prompts
The tools support natural language, so you can ask like this:
```
"Summarize this climate change research report, focusing on the solutions section:
https://research-climate-report.com"
```

#### Batch Processing
You can process up to 20 URLs at once:
```
"Please summarize the main content of these news websites:
https://news1.com/article1
https://news2.com/article2
https://news3.com/article3"
```

#### Specifying Format
You can request specific output formats:
```
"Extract the table data from https://example.com/data
and present it in bullet point list format"
```

### Best Practices

#### 1. Clear Instructions
```
✅ Good: "Summarize https://example.com/article, focusing on technical details"
❌ Bad: "Process this webpage"
```

#### 2. Provide Context
```
✅ Good: "Compare the pros and cons of these two frameworks, I'm a frontend developer"
❌ Bad: "Compare these two websites"
```

#### 3. Specific Requirements
```
✅ Good: "Extract price, features, support options"
❌ Bad: "Extract information"
```

### Notes

#### Limitations
- Maximum 20 URLs processed simultaneously
- Private IP addresses (localhost, etc.) not supported
- Content length limit: 100,000 characters

#### Error Handling
- If a URL fails, error message will be displayed
- Other URLs continue to be processed
- Fallback mechanisms handle failure cases

#### Performance
- 10-second timeout per URL
- Recommend batch processing for large numbers of URLs
- Network issues automatically retry

### Success Indicators

#### Expected Response Format
```
[https://example.com]
Here is the content summary generated by Gemini API...

Sources:
[1] Page Title (https://example.com)
```

#### Error Response
```
[https://broken-link.com] - Error: Specific error message
```

### Troubleshooting

If the tool doesn't work:
1. Check if Claude Code correctly loaded the MCP server
2. Confirm configuration file path is correct
3. Verify server is running
4. Check network connection

You can ask in Claude Code:
```
What MCP servers are currently available?
```

To confirm the web-fetch server is correctly loaded.

---

## Chinese Documentation | 中文文档

For Chinese documentation and usage examples, please see: [README-zh.md](README-zh.md)