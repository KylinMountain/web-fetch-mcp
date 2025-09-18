# Web Fetch MCP 服务器

[English](README.md) | [中文](README-zh.md)

[![npm version](https://badge.fury.io/js/web-fetch-mcp.svg)](https://badge.fury.io/js/web-fetch-mcp)

一个模型上下文协议 (MCP) 服务器，提供网页内容获取、总结、比较和提取功能。

## 功能特性

- **三个核心工具**: 提供 `summarize_web`、`compare_web` 和 `extract_web`，用于多种网络内容处理场景。
- **支持多个 URL**: 单次请求可处理多达 20 个 URL。
- **内容转换**: 将 HTML 转换为干净、可读的文本，并自动将 GitHub 的 `/blob/` 链接解析为其原始内容链接。
- **安全可靠**: 通过阻止对私有 IP 地址的请求来防范服务器端请求伪造 (SSRF) 攻击。
- **可配置**: 允许设置超时和内容长度限制以管理性能。

## 安装

通过 npm 全局安装服务器：

```bash
npm install -g web-fetch-mcp
```

## MCP Agent 配置

要将此服务器与支持模型上下文协议 (MCP) 的 AI Agent 一起使用，请将以下配置添加到您的 Agent 设置中。配置完成后，您的 Agent 便可调用此服务提供的工具。

**重要提示：** 您必须提供一个有效的 Gemini API 密钥，服务器才能正常工作。

如果已全局安装：

```json
{
  "mcpServers": {
    "web-fetch-mcp": {
      "type": "stdio",
      "command": "web-fetch-mcp",
      "env": {
        "GEMINI_API_KEY": "你的_GEMINI_API_KEY"
      }
    }
  }
}
```
> 备注：如果有网络访问问题，如无法连接到Gemini，可以配置环境变量`HTTPS_PROXY`和`HTTP_PROXY`. 默认使用`gemini-2.5-flash`模型，与Gemini-CLI一致。

如果您是从本地克隆运行：

```json
{
  "mcpServers": {
    "web-fetch-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/web-fetch-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "你的_GEMINI_API_KEY"
      }
    }
  }
}
```

## 工具参考

该服务提供以下工具：

- `summarize_web`: 总结一个或多个 URL 的内容。
- `compare_web`: 比较多个 URL 的内容。
- `extract_web`: 根据自然语言提示从网页内容中提取特定信息。

### 工具调用示例

要使用工具，您的 Agent 应发出一个 `callTool` 请求，指明工具名称和 `prompt`：

```json
{
  "tool": "summarize_web",
  "arguments": {
    "prompt": "请总结 https://example.com/article 的要点"
  }
}
```

## 开发者

如果您希望为该服务器的开发做出贡献：

1.  **克隆仓库：**
    ```bash
    git clone https://github.com/your-username/web-fetch-mcp.git
    cd web-fetch-mcp
    ```
2.  **安装依赖：**
    ```bash
    npm install
    ```
3.  **以开发模式运行：**
    ```bash
    npm run dev
    ```
4.  **为生产环境构建：**
    ```bash
    npm run build
    ```
