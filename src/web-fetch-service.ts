import { convert } from 'html-to-text';
import { fetchWithTimeout } from './utils/fetch.js';
import { getErrorMessage } from './utils/errors.js';
import { GeminiService } from './gemini-service.js';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

const URL_FETCH_TIMEOUT_MS = 10000;
const MAX_CONTENT_LENGTH = 100000;

// Helper function to extract URLs from a string
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

export class WebFetchService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();

    // Get proxy from environment variables (common practice)
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxy) {
      console.error(`Using proxy: ${proxy}`);
      setGlobalDispatcher(new ProxyAgent(proxy));
    }
  }

  private async fetchUrlContent(url: string): Promise<string> {
    try {
      // Convert GitHub blob URL to raw URL
      if (url.includes('github.com') && url.includes('/blob/')) {
        url = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      }

      const response = await fetchWithTimeout(url, URL_FETCH_TIMEOUT_MS);
      if (!response.ok) {
        throw new Error(
          `Request failed with status code ${response.status} ${response.statusText}`
        );
      }

      const html = await response.text();
      const textContent = convert(html, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
        ],
      }).substring(0, MAX_CONTENT_LENGTH);

      return textContent;
    } catch (error) {
      throw new Error(`Failed to fetch URL ${url}: ${getErrorMessage(error)}`);
    }
  }

  private async summarizeWebFallback(prompt: string, url: string): Promise<string> {
    try {
      const content = await this.fetchUrlContent(url);
      // Now, use the REAL GeminiService to generate the summary
      const summary = await this.geminiService.generateSummary(content, url);
      return `[${url}] (Fallback)
${summary}`;
    } catch (error) {
      const errorMessage = `Error processing ${url} in fallback: ${getErrorMessage(error)}`;
      return `[${url}] - Error: ${errorMessage}`;
    }
  }

  async summarizeWeb(prompt: string): Promise<string> {
    const urls = extractUrls(prompt);
    if (urls.length === 0) {
      throw new Error('No URLs found in prompt');
    }
    const url = urls[0];

    // Plan A: Try to use Gemini's urlContext
    try {
      const result = await this.geminiService.generateContentWithUrlContext(prompt);
      const response = result.response;

      const responseText = response.text();
      // Cast to any to access properties not in the official type definitions
      const urlContextMeta = (response.candidates?.[0] as any)?.urlContextMetadata;

      let processingError = false;
      if (urlContextMeta?.urlMetadata && urlContextMeta.urlMetadata.length > 0) {
        const allStatuses = urlContextMeta.urlMetadata.map(
          (m: any) => m.urlRetrievalStatus,
        );
        if (allStatuses.every((s: any) => s !== 'URL_RETRIEVAL_STATUS_SUCCESS')) {
          console.error('Gemini native fetch failed for all URLs, switching to fallback.');
          processingError = true;
        }
      } else if (!responseText.trim()) {
        console.error('Gemini native fetch returned no content, switching to fallback.');
        processingError = true;
      }

      if (processingError) {
        return this.summarizeWebFallback(prompt, url);
      }
      
      // If Plan A is successful, return the result.
      // The response from urlContext is already a summary.
      return `[${url}]
${responseText}`;

    } catch (error) {
      console.error(`Error in Plan A (Gemini urlContext): ${getErrorMessage(error)}. Switching to fallback.`);
      // If any error occurs in Plan A, switch to Plan B
      return this.summarizeWebFallback(prompt, url);
    }
  }

  private async compareWebFallback(prompt: string): Promise<string> {
    const urls = extractUrls(prompt);
    const contents: Array<{url: string, content: string}> = [];
    const errors: string[] = [];

    for (const url of urls) {
      try {
        const content = await this.fetchUrlContent(url);
        contents.push({ url, content });
      } catch (error) {
        errors.push(`Failed to fetch ${url}: ${getErrorMessage(error)}`);
      }
    }

    if (contents.length < 2) {
      return `Could not fetch enough content for comparison in fallback. Errors:\n${errors.join('\n')}`;
    }
    
    const comparison = await this.geminiService.generateComparison(contents);
    
    let finalResult = 'Web Content Comparison (Fallback):\n\n' + comparison;
    if (errors.length > 0) {
      finalResult += `\n\nErrors during fetch:\n${errors.join('\n')}`;
    }
    return finalResult;
  }

  async compareWeb(prompt: string): Promise<string> {
    const urls = extractUrls(prompt);
    if (urls.length < 2) {
      throw new Error('At least 2 URLs required for comparison');
    }

    // Plan A: Try to use Gemini's urlContext
    try {
      const result = await this.geminiService.generateContentWithUrlContext(prompt);
      const response = result.response;

      const responseText = response.text();
      // Cast to any to access properties not in the official type definitions
      const urlContextMeta = (response.candidates?.[0] as any)?.urlContextMetadata;

      let processingError = false;
      if (urlContextMeta?.urlMetadata && urlContextMeta.urlMetadata.length > 0) {
        const successfulFetches = urlContextMeta.urlMetadata.filter(
          (m: any) => m.urlRetrievalStatus === 'URL_RETRIEVAL_STATUS_SUCCESS'
        ).length;
        if (successfulFetches < 2) {
          console.error(`Gemini native fetch succeeded for only ${successfulFetches} URLs, but need at least 2. Switching to fallback.`);
          processingError = true;
        }
      } else if (!responseText.trim()) {
        console.error('Gemini native fetch returned no content, switching to fallback.');
        processingError = true;
      }

      if (processingError) {
        return this.compareWebFallback(prompt);
      }
      
      return `Web Content Comparison:\n\n${responseText}`;

    } catch (error) {
      console.error(`Error in Plan A (Gemini urlContext): ${getErrorMessage(error)}. Switching to fallback.`);
      return this.compareWebFallback(prompt);
    }
  }

  private async extractWebFallback(prompt: string, url: string): Promise<string> {
    const extractionInstruction = prompt.replace(url, '').trim();
    try {
      const content = await this.fetchUrlContent(url);
      const extraction = await this.geminiService.extractInformation(content, url, extractionInstruction);
      return `[${url}] (Fallback)
${extraction}`;
    } catch (error) {
      return `[${url}] - Error: ${getErrorMessage(error)}`;
    }
  }

  async extractWeb(prompt: string): Promise<string> {
    const urls = extractUrls(prompt);
    if (urls.length === 0) {
      throw new Error('No URLs found in prompt');
    }
    const url = urls[0];

    // Plan A: Try to use Gemini's urlContext
    try {
      const result = await this.geminiService.generateContentWithUrlContext(prompt);
      const response = result.response;

      const responseText = response.text();
      // Cast to any to access properties not in the official type definitions
      const urlContextMeta = (response.candidates?.[0] as any)?.urlContextMetadata;

      let processingError = false;
      if (urlContextMeta?.urlMetadata && urlContextMeta.urlMetadata.length > 0) {
        const allStatuses = urlContextMeta.urlMetadata.map(
          (m: any) => m.urlRetrievalStatus,
        );
        if (allStatuses.every((s: any) => s !== 'URL_RETRIEVAL_STATUS_SUCCESS')) {
          console.error('Gemini native fetch failed for all URLs, switching to fallback.');
          processingError = true;
        }
      } else if (!responseText.trim()) {
        console.error('Gemini native fetch returned no content, switching to fallback.');
        processingError = true;
      }

      if (processingError) {
        return this.extractWebFallback(prompt, url);
      }
      
      return `[${url}]
${responseText}`;

    } catch (error) {
      console.error(`Error in Plan A (Gemini urlContext): ${getErrorMessage(error)}. Switching to fallback.`);
      return this.extractWebFallback(prompt, url);
    }
  }
}
