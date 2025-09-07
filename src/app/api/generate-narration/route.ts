// app/api/generate-narration/route.ts
import { NextRequest, NextResponse } from 'next/server';

export interface NarrationRequest {
  text: string;
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      text,
      voiceId,
      speed = 1.0,
      stability,
      similarityBoost,
      style,
      modelId = 'eleven_multilingual_v2',
      voiceType = 'narrative',
      language = 'en',
    }: NarrationRequest = await request.json();

    // Validation
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text is required for narration',
        },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text too long. Maximum 5000 characters allowed.',
        },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'ElevenLabs API key not configured',
        },
        { status: 500 }
      );
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

    // Make request to ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
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
        voiceId: finalVoiceId,
      });

      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid API key or insufficient credits',
          },
          { status: 401 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request parameters',
            details: errorText,
          },
          { status: 400 }
        );
      }

      throw new Error(`ElevenLabs API failed: ${response.status} ${errorText}`);
    }

    // Process audio response
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);
    const audioBase64 = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Calculate estimated duration (rough formula based on character count and speed)
    const estimatedDuration = calculateAudioDuration(optimizedText, speed);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      duration: estimatedDuration * 1000, // Convert to milliseconds
      characterCount: optimizedText.length,
      estimatedTokens: Math.ceil(optimizedText.length / 4), // Rough token estimate
      voiceUsed: `${voiceConfig.description} (${finalVoiceId})`,
    } as NarrationResponse);
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Narration generation error:', {
      error: error.message,
      processingTime,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate narration',
        details: error.message,
      } as NarrationResponse,
      { status: 500 }
    );
  }
}

/**
 * Optimize text for better speech synthesis
 */
function optimizeTextForSpeech(text: string): string {
  return (
    text
      // Replace common abbreviations
      .replace(/\bDr\./g, 'Doctor')
      .replace(/\bMr\./g, 'Mister')
      .replace(/\bMrs\./g, 'Missus')
      .replace(/\bMs\./g, 'Miss')
      .replace(/\betc\./g, 'et cetera')
      .replace(/\be\.g\./g, 'for example')
      .replace(/\bi\.e\./g, 'that is')

      // Handle numbers and dates
      .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, '$2/$1/$3') // MM/DD/YYYY to DD/MM/YYYY for clarity
      .replace(/\$(\d+)/g, '$1 dollars')
      .replace(/(\d+)%/g, '$1 percent')

      // Improve punctuation for speech
      .replace(/\.\.\./g, '... pause ...')
      .replace(/--/g, ' - ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  );
}

/**
 * Calculate estimated audio duration based on text length and speed
 */
function calculateAudioDuration(text: string, speed: number = 1.0): number {
  // Average speaking rate is ~150 words per minute
  // Adjust for speed multiplier
  const wordsPerMinute = 150 * speed;
  const wordCount = text.split(/\s+/).length;
  const durationMinutes = wordCount / wordsPerMinute;
  return Math.ceil(durationMinutes * 60); // Return seconds, rounded up
}

/**
 * GET endpoint to retrieve available voices and their configurations
 */
export async function GET(request: NextRequest) {
  try {
    // Return available voice presets and their descriptions
    const voiceInfo = Object.entries(VOICE_PRESETS).map(([type, config]) => ({
      type,
      voiceId: config.voiceId,
      description: config.description,
      settings: {
        stability: config.stability,
        similarity_boost: config.similarity_boost,
        style: config.style,
      },
    }));

    return NextResponse.json({
      success: true,
      availableVoices: voiceInfo,
      supportedLanguages: [
        'en',
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'pl',
        'tr',
        'ru',
        'nl',
        'cs',
        'ar',
        'zh',
        'ja',
        'hi',
        'ko',
      ],
      maxCharacters: 5000,
      supportedModels: ['eleven_multilingual_v2', 'eleven_monolingual_v1', 'eleven_multilingual_v1'],
    });
  } catch (error: any) {
    console.error('Error retrieving voice info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve voice information',
      },
      { status: 500 }
    );
  }
}

/**
 * Utility function to split long text into chunks for processing
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
