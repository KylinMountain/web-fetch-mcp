const URL_FETCH_TIMEOUT_MS = 10000;

export async function fetchWithTimeout(url: string, timeoutMs: number = URL_FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MCP Web Fetch Server/1.0.0',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isPrivateIp(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check for localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    // Check for private IP ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);

    if (match) {
      const [, a, b, c, d] = match.map(Number);

      // Check if it's a valid IP
      if (a > 255 || b > 255 || c > 255 || d > 255) {
        return false;
      }

      // Private IP ranges:
      // 10.0.0.0 - 10.255.255.255
      if (a === 10) return true;

      // 172.16.0.0 - 172.31.255.255
      if (a === 172 && b >= 16 && b <= 31) return true;

      // 192.168.0.0 - 192.168.255.255
      if (a === 192 && b === 168) return true;

      // 169.254.0.0 - 169.254.255.255 (link-local)
      if (a === 169 && b === 254) return true;
    }

    return false;
  } catch {
    // If URL parsing fails, assume it's not a private IP
    return false;
  }
}