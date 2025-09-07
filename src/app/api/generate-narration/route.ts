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
  voiceType?: 'narrative' | 'character' | 'dramatic' | 'casual' | 'child' | 'elderly';
  language?: string;
  enableSsml?: boolean;
  outputFormat?: 'mp3' | 'wav' | 'pcm';
  optimizeForStreaming?: boolean;
  enhanceText?: boolean;
}

export interface NarrationResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  characterCount?: number;
  estimatedTokens?: number;
  voiceUsed?: string;
  processingTime?: number;
  audioFormat?: string;
  optimizedText?: string;
  error?: string;
  details?: string;
  chunks?: number;
}

// Enhanced voice configurations with more options
const VOICE_PRESETS = {
  narrative: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - clear narrative voice
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true,
    description: 'Professional narrator voice - ideal for storytelling and narration',
    category: 'professional',
  },
  character: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - expressive character voice
    stability: 0.4,
    similarity_boost: 0.7,
    style: 0.6,
    use_speaker_boost: true,
    description: 'Expressive character voice - perfect for dialogue and character speech',
    category: 'expressive',
  },
  dramatic: {
    voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - dramatic storytelling
    stability: 0.6,
    similarity_boost: 0.9,
    style: 0.8,
    use_speaker_boost: true,
    description: 'Dramatic storytelling voice - excellent for intense scenes and emotion',
    category: 'dramatic',
  },
  casual: {
    voiceId: 'VR6AewLTigWG4xSOukaG', // Josh - casual friendly voice
    stability: 0.5,
    similarity_boost: 0.6,
    style: 0.3,
    use_speaker_boost: false,
    description: 'Casual friendly voice - great for conversational content',
    category: 'casual',
  },
  child: {
    voiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - young voice
    stability: 0.3,
    similarity_boost: 0.7,
    style: 0.4,
    use_speaker_boost: false,
    description: 'Young voice - suitable for children content and playful narration',
    category: 'character',
  },
  elderly: {
    voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli - mature voice
    stability: 0.8,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true,
    description: 'Mature voice - perfect for wise characters and formal content',
    category: 'character',
  },
};

// Configuration constants
const CONFIG = {
  MAX_CHARACTERS: 5000,
  MAX_CHUNK_SIZE: 4500,
  DEFAULT_SPEED: 1.0,
  MIN_SPEED: 0.25,
  MAX_SPEED: 4.0,
  TIMEOUT_MS: 30000, // 30 seconds timeout
  SUPPORTED_FORMATS: ['mp3', 'wav', 'pcm'] as const,
  DEFAULT_MODEL: 'eleven_multilingual_v2',
} as const;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      text,
      voiceId,
      speed = CONFIG.DEFAULT_SPEED,
      stability,
      similarityBoost,
      style,
      modelId = CONFIG.DEFAULT_MODEL,
      voiceType = 'narrative',
      language = 'en',
      enableSsml = false,
      outputFormat = 'mp3',
      optimizeForStreaming = false,
      enhanceText = true,
    }: NarrationRequest = await request.json();

    // Enhanced validation
    const validationError = validateRequest({
      text,
      speed,
      outputFormat,
      voiceType,
    });

    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
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

    // Prepare voice settings with enhanced configuration
    const voiceSettings = {
      stability: Math.max(0, Math.min(1, stability ?? voiceConfig.stability)),
      similarity_boost: Math.max(0, Math.min(1, similarityBoost ?? voiceConfig.similarity_boost)),
      style: Math.max(0, Math.min(1, style ?? voiceConfig.style)),
      use_speaker_boost: voiceConfig.use_speaker_boost,
    };

    // Optimize text for speech if enabled
    const processedText = enhanceText ? optimizeTextForSpeech(text, enableSsml) : text;

    // Handle long text by splitting into chunks if necessary
    const textChunks =
      processedText.length > CONFIG.MAX_CHUNK_SIZE
        ? splitTextIntoChunks(processedText, CONFIG.MAX_CHUNK_SIZE)
        : [processedText];

    let finalAudioUrl: string;
    let totalDuration = 0;

    if (textChunks.length > 1) {
      // Process multiple chunks and combine
      const audioChunks: Buffer[] = [];

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        const chunkAudio = await generateSingleAudio({
          text: chunk,
          voiceId: finalVoiceId,
          voiceSettings,
          modelId,
          language,
          outputFormat,
          optimizeForStreaming,
        });

        audioChunks.push(chunkAudio);

        // Add small delay between chunks to avoid rate limiting
        if (i < textChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Combine audio chunks (simple concatenation for MP3)
      const combinedBuffer = Buffer.concat(audioChunks);
      finalAudioUrl = `data:audio/${outputFormat};base64,${combinedBuffer.toString('base64')}`;
      totalDuration = calculateAudioDuration(processedText, speed);
    } else {
      // Single chunk processing
      const audioBuffer = await generateSingleAudio({
        text: processedText,
        voiceId: finalVoiceId,
        voiceSettings,
        modelId,
        language,
        outputFormat,
        optimizeForStreaming,
      });

      finalAudioUrl = `data:audio/${outputFormat};base64,${audioBuffer.toString('base64')}`;
      totalDuration = calculateAudioDuration(processedText, speed);
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      audioUrl: finalAudioUrl,
      duration: Math.ceil(totalDuration * 1000), // Convert to milliseconds
      characterCount: processedText.length,
      estimatedTokens: Math.ceil(processedText.length / 4),
      voiceUsed: `${voiceConfig.description} (${finalVoiceId})`,
      processingTime,
      audioFormat: outputFormat,
      optimizedText: enhanceText ? processedText : undefined,
      chunks: textChunks.length,
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
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        processingTime,
      } as NarrationResponse,
      { status: 500 }
    );
  }
}

async function generateSingleAudio({
  text,
  voiceId,
  voiceSettings,
  modelId,
  language,
  outputFormat,
  optimizeForStreaming,
}: {
  text: string;
  voiceId: string;
  voiceSettings: any;
  modelId: string;
  language: string;
  outputFormat: string;
  optimizeForStreaming: boolean;
}): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    // Determine the correct endpoint and headers based on format
    const endpoint =
      outputFormat === 'pcm'
        ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`
        : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    };

    // Set appropriate Accept header based on format
    switch (outputFormat) {
      case 'mp3':
        headers.Accept = 'audio/mpeg';
        break;
      case 'wav':
        headers.Accept = 'audio/wav';
        break;
      case 'pcm':
        headers.Accept = 'audio/pcm';
        break;
      default:
        headers.Accept = 'audio/mpeg';
    }

    const requestBody: any = {
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    };

    // Add language code for non-English content
    if (language !== 'en') {
      requestBody.language_code = language;
    }

    // Add streaming optimization if requested
    if (optimizeForStreaming) {
      requestBody.optimize_streaming_latency = 1;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        voiceId,
      });

      if (response.status === 401) {
        throw new Error('Invalid API key or insufficient credits');
      }
      if (response.status === 400) {
        throw new Error(`Invalid request parameters: ${errorText}`);
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      throw new Error(`ElevenLabs API failed: ${response.status} ${errorText}`);
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return Buffer.from(audioArrayBuffer);
  } finally {
    clearTimeout(timeoutId);
  }
}

function validateRequest({
  text,
  speed,
  outputFormat,
  voiceType,
}: {
  text: string;
  speed: number;
  outputFormat: string;
  voiceType: string;
}): NarrationResponse | null {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Text is required for narration',
    };
  }

  if (text.length > CONFIG.MAX_CHARACTERS) {
    return {
      success: false,
      error: `Text too long. Maximum ${CONFIG.MAX_CHARACTERS} characters allowed.`,
    };
  }

  if (speed < CONFIG.MIN_SPEED || speed > CONFIG.MAX_SPEED) {
    return {
      success: false,
      error: `Speed must be between ${CONFIG.MIN_SPEED} and ${CONFIG.MAX_SPEED}`,
    };
  }

  if (!CONFIG.SUPPORTED_FORMATS.includes(outputFormat as any)) {
    return {
      success: false,
      error: `Unsupported output format. Supported formats: ${CONFIG.SUPPORTED_FORMATS.join(', ')}`,
    };
  }

  if (!VOICE_PRESETS[voiceType as keyof typeof VOICE_PRESETS]) {
    return {
      success: false,
      error: `Unsupported voice type. Available types: ${Object.keys(VOICE_PRESETS).join(', ')}`,
    };
  }

  return null;
}

/**
 * Enhanced text optimization for better speech synthesis
 */
function optimizeTextForSpeech(text: string, enableSsml: boolean = false): string {
  let optimized = text
    // Replace common abbreviations
    .replace(/\bDr\./g, 'Doctor')
    .replace(/\bMr\./g, 'Mister')
    .replace(/\bMrs\./g, 'Missus')
    .replace(/\bMs\./g, 'Miss')
    .replace(/\bProf\./g, 'Professor')
    .replace(/\betc\./g, 'et cetera')
    .replace(/\be\.g\./g, 'for example')
    .replace(/\bi\.e\./g, 'that is')
    .replace(/\bvs\./g, 'versus')
    .replace(/\bInc\./g, 'Incorporated')
    .replace(/\bCorp\./g, 'Corporation')
    .replace(/\bLLC\./g, 'Limited Liability Company')

    // Handle numbers and currency
    .replace(/\$(\d+,?\d*)/g, '$1 dollars')
    .replace(/€(\d+,?\d*)/g, '$1 euros')
    .replace(/£(\d+,?\d*)/g, '$1 pounds')
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/(\d+)°C/g, '$1 degrees Celsius')
    .replace(/(\d+)°F/g, '$1 degrees Fahrenheit')

    // Handle dates and times
    .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, '$2/$1/$3')
    .replace(/\b(\d{1,2}):(\d{2})\s?(AM|PM)\b/gi, '$1 $3 $2')

    // Improve punctuation for speech
    .replace(/\.\.\./g, enableSsml ? '<break time="1s"/>' : '... pause ...')
    .replace(/--/g, ' - ')
    .replace(/([.!?])\s*\n\s*/g, '$1 ') // Handle line breaks after sentences
    .replace(/\n\s*\n/g, enableSsml ? '<break time="0.5s"/>' : '. ') // Paragraph breaks

    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Add SSML enhancements if enabled
  if (enableSsml) {
    optimized = `<speak>${optimized}</speak>`;
  }

  return optimized;
}

/**
 * Enhanced audio duration calculation
 */
function calculateAudioDuration(text: string, speed: number = 1.0): number {
  // More accurate calculation considering punctuation and pauses
  const wordCount = text.split(/\s+/).length;
  const punctuationPauses = (text.match(/[.!?]/g) || []).length * 0.5; // 0.5 seconds per major punctuation
  const commaPauses = (text.match(/[,;:]/g) || []).length * 0.25; // 0.25 seconds per minor punctuation

  // Base speaking rate: 150 words per minute, adjusted for speed
  const adjustedWordsPerMinute = 150 * speed;
  const baseDuration = (wordCount / adjustedWordsPerMinute) * 60;

  return baseDuration + punctuationPauses + commaPauses;
}

/**
 * Enhanced text chunking with sentence boundary awareness
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = CONFIG.MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + trimmedSentence;

      if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add paragraph break marker if we're continuing to next paragraph
    if (currentChunk && paragraphs.indexOf(paragraph) < paragraphs.length - 1) {
      currentChunk += '\n\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * GET endpoint with enhanced voice information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCustomVoices = searchParams.get('includeCustomVoices') === 'true';

    // Return available voice presets and their detailed configurations
    const voiceInfo = Object.entries(VOICE_PRESETS).map(([type, config]) => ({
      type,
      voiceId: config.voiceId,
      description: config.description,
      category: config.category,
      settings: {
        stability: config.stability,
        similarity_boost: config.similarity_boost,
        style: config.style,
        use_speaker_boost: config.use_speaker_boost,
      },
      recommendedFor: getRecommendedUseCases(type as keyof typeof VOICE_PRESETS),
    }));

    let customVoices: any[] = [];

    // Optionally fetch custom voices from ElevenLabs API
    if (includeCustomVoices && process.env.ELEVENLABS_API_KEY) {
      try {
        const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
        });

        if (voicesResponse.ok) {
          const voicesData = await voicesResponse.json();
          customVoices =
            voicesData.voices?.map((voice: any) => ({
              voiceId: voice.voice_id,
              name: voice.name,
              category: voice.category || 'custom',
              language: voice.language,
              description: `Custom voice: ${voice.name}`,
            })) || [];
        }
      } catch (error) {
        console.warn('Failed to fetch custom voices:', error);
      }
    }

    return NextResponse.json({
      success: true,
      presetVoices: voiceInfo,
      customVoices,
      configuration: {
        maxCharacters: CONFIG.MAX_CHARACTERS,
        maxChunkSize: CONFIG.MAX_CHUNK_SIZE,
        supportedFormats: CONFIG.SUPPORTED_FORMATS,
        speedRange: {
          min: CONFIG.MIN_SPEED,
          max: CONFIG.MAX_SPEED,
          default: CONFIG.DEFAULT_SPEED,
        },
        timeout: CONFIG.TIMEOUT_MS,
      },
      supportedLanguages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'pl', name: 'Polish' },
        { code: 'tr', name: 'Turkish' },
        { code: 'ru', name: 'Russian' },
        { code: 'nl', name: 'Dutch' },
        { code: 'cs', name: 'Czech' },
        { code: 'ar', name: 'Arabic' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ko', name: 'Korean' },
      ],
      supportedModels: [
        {
          id: 'eleven_multilingual_v2',
          name: 'Multilingual V2',
          description: 'Best for multiple languages with high quality',
        },
        {
          id: 'eleven_monolingual_v1',
          name: 'Monolingual V1',
          description: 'Optimized for English only',
        },
        {
          id: 'eleven_multilingual_v1',
          name: 'Multilingual V1',
          description: 'Legacy multilingual model',
        },
      ],
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

function getRecommendedUseCases(voiceType: keyof typeof VOICE_PRESETS): string[] {
  const useCases = {
    narrative: ['Audiobooks', 'Storytelling', 'News reading', 'Educational content'],
    character: ['Dialogue', 'Character voices', 'Interactive content', 'Gaming'],
    dramatic: ['Theatrical content', 'Emotional scenes', 'Presentations', 'Poetry'],
    casual: ['Conversational content', 'Friendly explanations', 'Social media', 'Tutorials'],
    child: ['Children content', 'Playful narration', 'Educational for kids', 'Animation'],
    elderly: ['Formal content', 'Wise characters', 'Historical narration', 'Documentary'],
  };

  return useCases[voiceType] || [];
}
