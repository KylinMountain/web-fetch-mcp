# Web Fetch MCP 服务器

[English](README.md) | [中文](README-zh.md)

一个模型上下文协议 (MCP) 服务器，提供网页内容获取、总结、比较和提取功能。该服务器将原始的 gemini-cli web-fetch 工具转换为独立的 MCP 兼容服务器。

## 功能特性

- **summarize_web**: 总结一个或多个 URL 的内容（最多 20 个）
- **compare_web**: 比较多个 URL 的内容
- **extract_web**: 根据自然语言提示从网页内容中提取特定信息
- 每次请求最多处理 20 个 URL
- 将 HTML 转换为干净的文本
- 支持 GitHub 原始内容转换
- 私有 IP 保护（阻止 localhost/私有网络）
- 可配置的超时和内容限制

## 安装

```bash
# 克隆仓库
git clone <repository-url>
cd web-fetch-mcp-server

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装（可选）
npm install -g .
```

## 配置

服务器包含一个 `mcp.json` 配置文件，定义了 MCP 服务器元数据和工具规范：

```json
{
  "name": "web-fetch-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for web content fetching, summarizing, comparing, and extracting information",
  "command": "node",
  "args": ["dist/index.js"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 启动服务器

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm run build
npm start
```

### 直接执行
```bash
node dist/index.js
```

## 工具使用示例

### 1. summarize_web
总结 URL 内容：

```json
{
  "tool": "summarize_web",
  "arguments": {
    "prompt": "Summarize the main points from https://example.com/article and https://another.com/data"
  }
}
```

### 2. compare_web
比较多个 URL 的内容：

```json
{
  "tool": "compare_web",
  "arguments": {
    "prompt": "Compare the features described on https://product1.com and https://product2.com"
  }
}
```

### 3. extract_web
从网页内容中提取特定信息：

```json
{
  "tool": "extract_web",
  "arguments": {
    "prompt": "Extract all email addresses and contact information from https://company.com/contact"
  }
}
```

## 与 Claude Code 集成

要在 Claude Code 中使用此服务器，请将其添加到您的 MCP 配置中：

```json
{
  "mcpServers": {
    "web-fetch": {
      "command": "node",
      "args": ["/path/to/web-fetch-mcp-server/dist/index.js"]
    }
  }
}
```

## API 参考

### 工具参数

所有工具都接受单个参数：

- **prompt** (字符串, 必需): 包含以下内容的自然语言提示：
  - 一个或多个 URL（最多 20 个）
  - 处理指令（总结、比较、提取）

### 响应格式

所有工具都返回包含以下内容的文本响应：

- 基于工具目的处理的内容
- 源 URL 和处理元数据
- 获取失败的错误消息

### 错误处理

服务器处理各种错误情况：

- **无效 URL**: 返回描述性错误消息
- **网络超时**: 每个 URL 10 秒超时
- **私有 IP**: 阻止 localhost 和私有网络地址
- **内容限制**: 每个 URL 最多 100,000 个字符
- **GitHub URL**: 自动将 `/blob/` URL 转换为原始内容

## 开发

### 项目结构
```
src/
├── index.ts              # 主 MCP 服务器入口点
├── web-fetch-service.ts  # 核心网页获取和处理逻辑
├── gemini-service.ts     # Gemini API 集成的内容处理
└── utils/
    ├── errors.ts         # 错误处理工具
    └── fetch.ts          # HTTP 获取和 IP 验证工具
```

### 构建
```bash
npm run build    # 将 TypeScript 编译为 JavaScript
npm run clean    # 删除构建产物
```

### 测试
```bash
npm run dev      # 在开发模式下运行，支持热重载
```

## 限制

- **无 LLM 集成**: 此实现使用基本的文本处理而不是实际的 LLM 调用。对于生产使用，请与 OpenAI、Anthropic 或 Google Gemini 等 LLM 服务集成。
- **私有网络**: 私有 IP 地址（localhost、10.x.x.x、172.16-31.x.x、192.168.x.x）出于安全原因被阻止。
- **内容限制**: 每个 URL 最多 100,000 个字符，以防止内存问题。
- **速率限制**: 无内置速率限制 - 如果需要，请为您的用例实现。

## 安全考虑

- 私有 IP 地址被阻止以防止访问内部服务
- URL 在获取前经过验证
- 内容长度有限以防止 DoS 攻击
- GitHub URL 自动转换为原始内容 URL

## 许可证

Apache-2.0 许可证

## 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 如适用，添加测试
5. 提交拉取请求

## 故障排除

### 常见问题

1. **构建错误**: 确保安装了 Node.js 18+
2. **权限错误**: 检查文件权限并尝试 `chmod +x dist/index.js`
3. **网络超时**: 检查互联网连接和防火墙设置
4. **MCP 连接问题**: 验证 MCP 配置中的服务器路径

### 调试模式

设置 `DEBUG` 环境变量以进行详细日志记录：
```bash
DEBUG=* node dist/index.js
```

## Claude Code 使用示例

### 🚀 基本使用方法

#### 1. 总结网页内容
```
请使用 web-fetch 的 summarize_web 工具总结这个网页的主要内容：
https://example.com/article-about-artificial-intelligence
```

#### 2. 比较多个网页
```
请使用 web-fetch 的 compare_web 工具比较这两个产品的特性：
https://product1.com/features 和 https://product2.com/features
```

#### 3. 提取特定信息
```
请使用 web-fetch 的 extract_web 工具从以下网页提取所有邮箱地址和联系信息：
https://company.com/contact-us
```

### 📋 高级使用场景

#### 多 URL 总结
```
请总结以下 3 个关于机器学习的网页，并提取关键概念：
https://site1.com/ml-intro
https://site2.com/ml-algorithms
https://site3.com/ml-applications
```

#### 技术文档比较
```
请比较这些 API 文档，找出功能差异：
https://api1.com/docs 和 https://api2.com/docs
重点关注认证方式、端点覆盖范围和价格信息。
```

#### 内容提取和分析
```
请从以下网页提取标题、作者、发布日期和主要内容摘要：
https://blog.example.com/tech-article
```

### 🔧 实用技巧

#### 自然语言提示
工具支持自然语言，可以这样提问：
```
"总结这个关于气候变化的研究报告，重点关注解决方案部分：
https://research-climate-report.com"
```

#### 批量处理
一次最多可以处理 20 个 URL：
```
"请总结这些新闻网站的主要内容：
https://news1.com/article1
https://news2.com/article2
https://news3.com/article3"
```

#### 指定格式
可以要求特定的输出格式：
```
"提取 https://example.com/data 中的表格数据，
并以项目符号列表的形式呈现"
```

### 🎯 最佳实践

#### 1. 明确的指示
```
✅ 好："总结 https://example.com/article，重点关注技术细节"
❌ 差："处理这个网页"
```

#### 2. 提供上下文
```
✅ 好："比较这两个框架的优缺点，我是前端开发者"
❌ 差："比较这两个网站"
```

#### 3. 具体的要求
```
✅ 好："提取价格、功能、支持选项"
❌ 差："提取信息"
```

### ⚠️ 注意事项

#### 限制
- 最多 20 个 URL 同时处理
- 不支持私有 IP 地址（localhost 等）
- 内容长度限制 100,000 字符

#### 错误处理
- 如果某个 URL 失败，会显示错误信息
- 其他 URL 继续处理
- 有回退机制处理失败情况

#### 性能
- 每个 URL 10 秒超时
- 建议分批处理大量 URL
- 网络问题会自动重试

### 🎉 成功指标

#### 预期响应格式
```
[https://example.com]
这里是 Gemini API 生成的内容摘要...

Sources:
[1] 页面标题 (https://example.com)
```

#### 错误响应
```
[https://broken-link.com] - Error: 具体错误信息
```

### 🔍 故障排除

如果工具不工作：
1. 检查 Claude Code 是否正确加载了 MCP 服务器
2. 确认配置文件路径正确
3. 验证服务器正在运行
4. 检查网络连接

可以在 Claude Code 中询问：
```
What MCP servers are currently available?
```

来确认 web-fetch 服务器已正确加载。

---

## 英文文档 | English Documentation

有关英文文档和使用示例，请参阅：[README.md](README.md)