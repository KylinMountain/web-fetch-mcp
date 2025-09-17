export function getResponseText(response: any): string {
  return response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}