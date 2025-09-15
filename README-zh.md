# MCP Web Fetch Tool

基于Google Gemini API的MCP网页内容抓取工具，支持从URL中提取和处理内容。

## 功能特性

- 🌐 支持HTTP/HTTPS URL处理
- 🔍 使用Google Gemini API的URL上下文功能
- 📄 HTML到文本的智能转换
- 🔗 自动GitHub blob URL转换为raw URL
- 🏠 支持私有IP和本地网络地址
- 📚 自动引用标记和源列表格式化
- 🔄 智能备用策略（直接抓取）
- 🌐 代理支持

## 环境要求

- Node.js 18+
- TypeScript 5.0+

## 安装配置

### 1. 克隆并安装依赖

```bash
git clone <repository-url>
cd mcp-web-fetch-tool
npm install
```

### 2. 环境变量配置

创建 `.env` 文件：

```bash
# 必需：Google Gemini API密钥
GOOGLE_API_KEY=your_google_api_key_here

# 可选：代理配置
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=https://proxy.company.com:8080
```

### 3. 获取Google API密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录您的Google账户
3. 创建新的API密钥
4. 将密钥设置为环境变量

### 4. 构建项目

```bash
npm run build
```

## 使用方法

### 作为MCP服务器运行

```bash
npm start
```

### 开发模式

```bash
npm run dev
```

### Claude Desktop配置

在Claude Desktop的 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "web-fetch": {
      "command": "node",
      "args": ["/path/to/your/mcp-web-fetch-tool/dist/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key_here"
      }
    }
  }
}
```

### 在Claude中使用

工具会自动在Claude中可用，您可以这样使用：

```
请使用web_fetch工具来总结这篇文章：https://example.com/article 并提取关键要点
```

或者：

```
从 https://github.com/user/repo/blob/main/README.md 获取内容并解释其中的安装步骤
```

## 工具参数

### web_fetch

- **prompt** (必需): 包含URL和处理指令的综合提示
  - 支持最多20个URL
  - 必须包含至少一个HTTP/HTTPS URL
  - 可以包含具体的处理指令（如总结、提取数据等）

### 示例用法

```typescript
// 基本用法
{
  "name": "web_fetch",
  "arguments": {
    "prompt": "Summarize the content from https://example.com/news-article"
  }
}

// 多URL处理
{
  "name": "web_fetch",
  "arguments": {
    "prompt": "Compare the information from https://site1.com/data and https://site2.com/data, focusing on pricing differences"
  }
}

// GitHub文件处理
{
  "name": "web_fetch",
  "arguments": {
    "prompt": "Explain the installation process from https://github.com/user/project/blob/main/INSTALL.md"
  }
}
```

## 技术架构

### 双重处理策略

1. **主要策略**: 使用Google Gemini的URL上下文功能
   - 直接由AI处理URL内容
   - 支持智能引用和源标记
   - 更准确的内容理解

2. **备用策略**: 直接HTTP抓取
   - 当主要策略失败时自动切换
   - 使用html-to-text进行内容清理
   - 适用于私有IP和特殊情况

### 特殊功能

- **GitHub URL转换**: 自动将blob URL转换为raw URL
- **私有IP检测**: 自动识别并处理本地/私有网络地址
- **超时控制**: 10秒HTTP请求超时
- **内容限制**: 最大100KB内容处理
- **代理支持**: 支持HTTP/HTTPS代理配置

## 错误处理

工具包含完善的错误处理机制：

- URL格式验证
- 网络请求超时
- HTTP状态码检查
- API调用失败处理
- 自动降级到备用策略

## 限制说明

- 每个请求最多处理20个URL
- 单个页面内容限制100KB
- 需要有效的Google API密钥
- 某些需要认证的页面可能无法访问
- JavaScript动态内容可能不完全支持

## 故障排除

### 常见问题

**Q: npx运行失败？**
```bash
# 确保Node.js版本 >= 18
node --version

# 清理npm缓存
npm cache clean --force
```

**Q: API密钥无效？**
- 检查密钥是否正确设置
- 确认API密钥有效且有足够配额
- 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 检查

**Q: 代理网络问题？**
```bash
# 设置代理
export HTTP_PROXY=http://proxy:8080
export HTTPS_PROXY=https://proxy:8080
npx mcp-web-fetch-tool
```

**Q: Claude Desktop配置不生效？**
- 检查JSON格式是否正确
- 重启Claude Desktop
- 查看Claude Desktop日志

## 开发者信息

### 发布新版本

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布到npm
npm run publish:script
```

### 测试本地构建

```bash
# 构建
npm run build

# 测试可执行文件
node dist/index.js
```

## 许可证

Apache-2.0

## 贡献

欢迎提交Issue和Pull Request！

## 支持

如有问题，请查看：
1. [Google Gemini API文档](https://ai.google.dev/docs)
2. [MCP协议规范](https://spec.modelcontextprotocol.io/)
3. 项目Issues页面
