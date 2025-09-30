// utils/apiKeys.ts
export function getGeminiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('GEMINI_API_KEY') || '';
  }
  return '';
}

export function getElevenLabsKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ELEVENLABS_API_KEY') || '';
  }
  return '';
}

export function setGeminiKey(key: string) {
  if (typeof window !== 'undefined') localStorage.setItem('GEMINI_API_KEY', key);
}

export function setElevenLabsKey(key: string) {
  if (typeof window !== 'undefined') localStorage.setItem('ELEVENLABS_API_KEY', key);
}
