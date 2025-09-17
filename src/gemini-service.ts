import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { getErrorMessage } from './utils/errors.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini 2.5 Flash model, which is the latest and cost-effective model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateContentWithUrlContext(prompt: string): Promise<GenerateContentResult> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ urlContext: {} }],
      });
      return result;
    } catch (error) {
      throw new Error(`Gemini API (urlContext) call failed: ${getErrorMessage(error)}`);
    }
  }

  async generateSummary(content: string, url: string): Promise<string> {
    try {
      const prompt = `Please provide a concise and accurate summary in English of the following content, highlighting the main points and key information:

Content source: ${url}

Content:
${content.substring(0, 15000)}

Please provide:
1. Main summary (2-3 paragraphs)
2. Key points (bullet points)
3. Content type classification (news, technical documentation, blog, etc.)`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API summary generation failed: ${getErrorMessage(error)}`);
    }
  }

  async generateComparison(contents: Array<{url: string, content: string}>): Promise<string> {
    try {
      const contentSections = contents.map((item, index) =>
        `Content ${index + 1} (Source: ${item.url}):
${item.content.substring(0, 8000)}`
      ).join('\n\n---\n\n');

      const prompt = `Please compare the following web content and provide a detailed analysis report in English:

${contentSections}

Please provide:
1. Similarities and differences analysis
2. Unique viewpoints from each content
3. Comprehensive conclusion and recommendations
4. Content quality assessment`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API comparison analysis failed: ${getErrorMessage(error)}`);
    }
  }

  async extractInformation(content: string, url: string, extractionPrompt: string): Promise<string> {
    try {
      const prompt = `Extract relevant information from the web content based on the following extraction requirements:

Extraction requirements: ${extractionPrompt}
Content source: ${url}

Web content:
${content.substring(0, 15000)}

Please:
1. Precisely extract the requested information
2. If no relevant information exists, clearly state so
3. Organize results in the requested format
4. Provide contextual explanation of the extracted results`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API information extraction failed: ${getErrorMessage(error)}`);
    }
  }
}