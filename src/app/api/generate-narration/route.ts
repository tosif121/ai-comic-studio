// utils/narrationClient.ts
// Client-side narration generation - users provide their own API keys

export interface NarrationRequest {
  text: string;
  apiKey: string; // User provides their own key
  voiceId?: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  modelId?: string;
  voiceType?: 'narrative' | 'character' | 'dramatic' | 'casual';
  language?: string;
}

export interface NarrationResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  characterCount?: number;
  estimatedTokens?: number;
  voiceUsed?: string;
  error?: string;
  details?: string;
}

// Voice configurations for different narration types
const VOICE_PRESETS = {
  narrative: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - clear narrative voice
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.2,
    description: 'Professional narrator voice',
  },
  character: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - expressive character voice
    stability: 0.4,
    similarity_boost: 0.7,
    style: 0.6,
    description: 'Expressive character voice',
  },
  dramatic: {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - dramatic storytelling
    stability: 0.6,
    similarity_boost: 0.9,
    style: 0.8,
    description: 'Dramatic storytelling voice',
  },
  casual: {
    voiceId: 'VR6AewLTigWG4xSOukaG', // Josh - casual friendly voice
    stability: 0.5,
    similarity_boost: 0.6,
    style: 0.3,
    description: 'Casual friendly voice',
  },
};

/**
 * Generate narration directly from the client using user's API key
 */
export async function generateNarration({
  text,
  apiKey,
  voiceId,
  speed = 1.0,
  stability,
  similarityBoost,
  style,
  modelId = 'eleven_multilingual_v2',
  voiceType = 'narrative',
  language = 'en',
}: NarrationRequest): Promise<NarrationResponse> {
  const startTime = Date.now();

  try {
    // Validation
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text is required for narration',
      };
    }

    if (text.length > 5000) {
      return {
        success: false,
        error: 'Text too long. Maximum 5000 characters allowed.',
      };
    }

    if (!apiKey || apiKey.trim().length === 0) {
      return {
        success: false,
        error: 'ElevenLabs API key is required',
      };
    }

    // Get voice configuration
    const voiceConfig = VOICE_PRESETS[voiceType] || VOICE_PRESETS.narrative;
    const finalVoiceId = voiceId || voiceConfig.voiceId;

    // Prepare voice settings with fallbacks
    const voiceSettings = {
      stability: stability ?? voiceConfig.stability,
      similarity_boost: similarityBoost ?? voiceConfig.similarity_boost,
      style: style ?? voiceConfig.style,
      use_speaker_boost: true,
    };

    // Optimize text for speech
    const optimizedText = optimizeTextForSpeech(text);

    // Make request to ElevenLabs directly from client
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: optimizedText,
        model_id: modelId,
        voice_settings: voiceSettings,
        ...(language !== 'en' && { language_code: language }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      // Handle specific error cases
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid API key or insufficient credits',
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: 'Invalid request parameters',
          details: errorText,
        };
      }

      return {
        success: false,
        error: `ElevenLabs API failed: ${response.status}`,
        details: errorText,
      };
    }

    // Process audio response
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Calculate estimated duration
    const estimatedDuration = calculateAudioDuration(optimizedText, speed);

    return {
      success: true,
      audioUrl,
      duration: estimatedDuration * 1000, // Convert to milliseconds
      characterCount: optimizedText.length,
      estimatedTokens: Math.ceil(optimizedText.length / 4),
      voiceUsed: `${voiceConfig.description} (${finalVoiceId})`,
    };
  } catch (error: any) {
    console.error('Narration generation error:', error);
    return {
      success: false,
      error: 'Failed to generate narration',
      details: error.message,
    };
  }
}

/**
 * Optimize text for better speech synthesis
 */
function optimizeTextForSpeech(text: string): string {
  return text
    .replace(/\bDr\./g, 'Doctor')
    .replace(/\bMr\./g, 'Mister')
    .replace(/\bMrs\./g, 'Missus')
    .replace(/\bMs\./g, 'Miss')
    .replace(/\betc\./g, 'et cetera')
    .replace(/\be\.g\./g, 'for example')
    .replace(/\bi\.e\./g, 'that is')
    .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, '$2/$1/$3')
    .replace(/\$(\d+)/g, '$1 dollars')
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/\.\.\./g, '... pause ...')
    .replace(/--/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate estimated audio duration
 */
function calculateAudioDuration(text: string, speed: number = 1.0): number {
  const wordsPerMinute = 150 * speed;
  const wordCount = text.split(/\s+/).length;
  const durationMinutes = wordCount / wordsPerMinute;
  return Math.ceil(durationMinutes * 60);
}

/**
 * Get available voice presets
 */
export function getVoicePresets() {
  return Object.entries(VOICE_PRESETS).map(([type, config]) => ({
    type,
    voiceId: config.voiceId,
    description: config.description,
    settings: {
      stability: config.stability,
      similarity_boost: config.similarity_boost,
      style: config.style,
    },
  }));
}

/**
 * Split long text into chunks for processing
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = 4500): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;

    if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk + '.');
      currentChunk = trimmedSentence;
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }

  return chunks;
}

/**
 * Fetch available voices from ElevenLabs API
 */
export async function fetchAvailableVoices(apiKey: string) {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return {
      success: true,
      voices: data.voices,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
