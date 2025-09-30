// app/api/generate-comic/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ComicRequest {
  storyIdea: string;
  geminiApiKey: string; // ✅ ADDED: User provides API key
  characterName?: string;
  artStyle?: string;
  mood?: string;
  panels?: number;
  characterTraits?: string[];
}

interface ComicPanel {
  id: number;
  imageDescription: string;
  dialogue: string[];
  narration: string;
  characterEmotions: string;
  sceneAction: string;
  visualElements: string[];
  continuityNotes: string;
  imageUrl?: string | null;
}

interface ComicStory {
  title: string;
  characterProfile: {
    name: string;
    appearance: string;
    personality: string;
    backstory: string;
    motivation: string;
  };
  storyArc: string;
  panels: ComicPanel[];
}

const CONFIG = {
  MAX_RETRIES: 5,
  BASE_DELAY: 3000,
  EXPONENTIAL_BACKOFF: true,
  MAX_DELAY: 30000,
  MAX_PANELS: 6,
  MIN_PANELS: 2,
  GEMINI_MODELS: {
    TEXT: 'gemini-2.5-flash',
    IMAGE: 'gemini-2.5-flash-image-preview',
  },
  PANEL_GENERATION_DELAY: 5000,
} as const;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      storyIdea,
      geminiApiKey, // ✅ Get API key from request
      characterName = 'Hero',
      artStyle = 'modern comic book',
      mood = 'adventurous',
      panels = 4,
      characterTraits = [],
    }: ComicRequest = await request.json();
    if (!storyIdea?.trim()) {
      return NextResponse.json({ success: false, error: 'Story idea is required' }, { status: 400 });
    }
    // ✅ ADDED: Validate API key
    if (!geminiApiKey?.trim()) {
      return NextResponse.json({ success: false, error: 'Gemini API key is required' }, { status: 400 });
    }

    if (panels < CONFIG.MIN_PANELS || panels > CONFIG.MAX_PANELS) {
      return NextResponse.json(
        { success: false, error: `Panel count must be between ${CONFIG.MIN_PANELS} and ${CONFIG.MAX_PANELS}` },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting comic generation for "${storyIdea}"`);

    // Step 1: Generate story structure
    const storyStructure = await withExponentialBackoff(
      () =>
        generateStoryStructure(
          {
            storyIdea,
            characterName,
            artStyle,
            mood,
            panels,
            characterTraits,
          },
          geminiApiKey // ✅ Pass API key
        ),
      'story structure'
    );

    // Step 2: Generate panels with Nano Banana images
    const comicPanels = await generatePanelsWithNanoBanana(storyStructure, panels, geminiApiKey); // ✅ Pass API key

    const comic: ComicStory = {
      title: storyStructure.title,
      characterProfile: storyStructure.character,
      storyArc: storyStructure.arc,
      panels: comicPanels,
    };

    const generationTime = Date.now() - startTime;
    console.log(`✅ Comic generation completed in ${generationTime}ms`);

    return NextResponse.json({
      success: true,
      comic,
      generationTime,
      metadata: {
        panelsGenerated: comicPanels.length,
        imagesGenerated: comicPanels.filter((p) => p.imageUrl && !p.imageUrl.includes('placeholder')).length,
        model: 'Nano Banana (Gemini 2.5 Flash Image Preview)',
      },
    });
  } catch (error: any) {
    console.error('❌ Comic generation error:', error);

    if (error.message.includes('429')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API rate limit exceeded. Please wait and try again.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate comic',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

async function withExponentialBackoff<T>(fn: () => Promise<T>, operationName: string = 'API call'): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`📞 Attempting ${operationName} (${attempt}/${CONFIG.MAX_RETRIES})`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ ${operationName} attempt ${attempt}/${CONFIG.MAX_RETRIES} failed`);

      if (attempt < CONFIG.MAX_RETRIES) {
        let delay = CONFIG.BASE_DELAY * Math.pow(2, attempt - 1);
        if (CONFIG.EXPONENTIAL_BACKOFF) {
          delay = Math.min(delay + Math.random() * 1000, CONFIG.MAX_DELAY);
        }

        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

// ✅ FIXED: Added apiKey parameter
async function generateStoryStructure(input: Required<Omit<ComicRequest, 'geminiApiKey'>>, apiKey: string) {
  const prompt = `Create a detailed comic book story structure with consistent character development.

STORY CONCEPT: ${input.storyIdea}
CHARACTER NAME: ${input.characterName}
ART STYLE: ${input.artStyle}
MOOD: ${input.mood}
NUMBER OF PANELS: ${input.panels}
CHARACTER TRAITS: ${input.characterTraits.join(', ') || 'determined, resourceful'}

IMPORTANT: Respond with ONLY valid JSON.
{
  "title": "Creative title for the comic",
  "character": {
    "name": "${input.characterName}",
    "appearance": "DETAILED physical description for consistent AI image generation",
    "personality": "Key personality traits",
    "backstory": "Brief background",
    "motivation": "Story motivation"
  },
  "arc": "Overall story progression",
  "panelOutlines": [
    ${Array.from(
      { length: input.panels },
      (_, i) => `{
      "panelNumber": ${i + 1},
      "purpose": "Story beat for panel ${i + 1}",
      "keyAction": "Specific visual action",
      "characterState": "Character's emotional state",
      "settingDescription": "DETAILED scene description",
      "transitionTo": "Connection to next panel"
    }`
    ).join(',')}
  ]
}`;

  const response = await callGemini(prompt, apiKey, 0.8); // ✅ Pass apiKey
  const cleanedResponse = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleanedResponse);

    if (!parsed.title || !parsed.character || !parsed.panelOutlines || parsed.panelOutlines.length !== input.panels) {
      throw new Error('Invalid story structure format');
    }

    console.log(`✅ Story structure generated: "${parsed.title}"`);
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse story structure:', error);
    return createFallbackStructure(input);
  }
}

// ✅ FIXED: Added apiKey parameter
async function generatePanelsWithNanoBanana(storyStructure: any, panelCount: number, apiKey: string) {
  const panels: ComicPanel[] = [];

  console.log(`🎨 Starting panel generation for ${panelCount} panels`);

  for (let i = 0; i < panelCount; i++) {
    const panelOutline = storyStructure.panelOutlines[i];
    console.log(`🍌 Generating panel ${i + 1}/${panelCount}...`);

    try {
      // Generate panel content
      const panelData = await withExponentialBackoff(async () => {
        const panelPrompt = `Create detailed comic panel content for panel ${i + 1} of ${panelCount}.

STORY CONTEXT:
- Title: ${storyStructure.title}
- Character: ${storyStructure.character.name}
- Appearance: ${storyStructure.character.appearance}
- Current State: ${panelOutline?.characterState || 'determined'}
- Action: ${panelOutline?.keyAction || 'story progression'}
- Setting: ${panelOutline?.settingDescription || 'story scene'}

Respond with ONLY valid JSON:
{
  "imageDescription": "DETAILED comic panel description",
  "dialogue": ["Character speech - 2-3 lines"],
  "narration": "Rich narrative text of 2-3 sentences",
  "characterEmotions": "Emotional state",
  "sceneAction": "Action description",
  "visualElements": ["lighting", "background", "positioning"],
  "continuityNotes": "Character consistency notes"
}`;

        const response = await callGemini(panelPrompt, apiKey, 0.7); // ✅ Pass apiKey
        const cleaned = cleanJsonResponse(response);
        return JSON.parse(cleaned);
      }, `panel ${i + 1} content`);

      // Generate image with Nano Banana
      let imageUrl = null;
      try {
        console.log(`🍌 Generating image for panel ${i + 1}...`);

        const imagePrompt = `Generate a high-quality comic book panel illustration:

CHARACTER: ${storyStructure.character.name}
APPEARANCE: ${storyStructure.character.appearance}
SCENE: ${panelData.imageDescription}
ACTION: ${panelOutline?.keyAction}
STYLE: professional comic book art

Create a detailed comic panel that maintains character consistency.`;

        const imageResponse = await callNanoBanana(imagePrompt, apiKey, 0.7); // ✅ Pass apiKey
        const imageData = extractImageFromNanoBananaResponse(imageResponse);

        if (imageData) {
          imageUrl = `data:image/png;base64,${imageData}`;
          console.log(`✅ Image generated for panel ${i + 1}`);
        } else {
          console.warn(`⚠️ Image generation failed for panel ${i + 1}`);
          imageUrl = `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${i + 1}`;
        }
      } catch (imageError) {
        console.warn(`❌ Image error for panel ${i + 1}:`, imageError);
        imageUrl = `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${i + 1}`;
      }

      panels.push({
        id: i + 1,
        imageDescription: panelData.imageDescription || `Panel ${i + 1} description`,
        dialogue: Array.isArray(panelData.dialogue) ? panelData.dialogue : [panelData.dialogue || ''],
        narration: panelData.narration || `Panel ${i + 1} narration`,
        characterEmotions: panelData.characterEmotions || 'determined',
        sceneAction: panelData.sceneAction || 'story progression',
        visualElements: Array.isArray(panelData.visualElements) ? panelData.visualElements : [],
        continuityNotes: panelData.continuityNotes || 'Character consistency',
        imageUrl: imageUrl,
      });

      console.log(`✅ Panel ${i + 1} generated successfully`);

      if (i < panelCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, CONFIG.PANEL_GENERATION_DELAY));
      }
    } catch (error) {
      console.error(`❌ Error generating panel ${i + 1}:`, error);
      panels.push(createFallbackPanel(i + 1, panelOutline, storyStructure));
    }
  }

  return panels;
}

// ✅ FIXED: Changed signature to accept apiKey as string parameter
async function callNanoBanana(prompt: string, apiKey: string, temperature: number = 0.7): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODELS.IMAGE}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
          responseModalities: ['TEXT', 'IMAGE'],
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nano Banana API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return JSON.stringify(result);
}

function extractImageFromNanoBananaResponse(responseStr: string): string | null {
  try {
    const response = JSON.parse(responseStr);
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        console.log('✅ Found Nano Banana image data');
        return part.inlineData.data;
      }
    }

    console.warn('⚠️ No image data found in Nano Banana response');
    return null;
  } catch (error) {
    console.error('❌ Failed to extract image from Nano Banana response:', error);
    return null;
  }
}

// ✅ FIXED: Changed signature to accept apiKey as string parameter
async function callGemini(prompt: string, apiKey: string, temperature: number = 0.7): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODELS.TEXT}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('No content generated by Gemini');
  }

  return result.candidates[0].content.parts[0].text;
}

function createFallbackStructure(input: Required<Omit<ComicRequest, 'geminiApiKey'>>) {
  console.log('⚠️ Using fallback story structure');
  const panelOutlines = [];

  for (let i = 0; i < input.panels; i++) {
    const storyProgress = i / Math.max(input.panels - 1, 1);
    let purpose, keyAction, characterState;

    if (storyProgress <= 0.25) {
      purpose = 'Setup/Introduction';
      keyAction = `Introduce ${input.characterName} and establish the world`;
      characterState = 'curious and ready';
    } else if (storyProgress <= 0.75) {
      purpose = 'Rising Action';
      keyAction = `${input.characterName} faces obstacles`;
      characterState = 'determined';
    } else {
      purpose = 'Resolution';
      keyAction = `${input.characterName} overcomes challenges`;
      characterState = 'triumphant';
    }

    panelOutlines.push({
      panelNumber: i + 1,
      purpose,
      keyAction,
      characterState,
      settingDescription: `A ${input.mood} setting for ${input.storyIdea}`,
      transitionTo: i < input.panels - 1 ? 'Builds to next panel' : 'Concludes',
    });
  }

  return {
    title: `${input.characterName}'s Adventure`,
    character: {
      name: input.characterName,
      appearance: 'Distinctive character design for consistency',
      personality: input.characterTraits.join(', ') || 'brave, determined',
      backstory: 'Ready for adventure',
      motivation: 'Complete the quest',
    },
    arc: `A ${input.mood} journey`,
    panelOutlines,
  };
}

function createFallbackPanel(panelId: number, outline: any, storyStructure: any): ComicPanel {
  return {
    id: panelId,
    imageDescription: `Panel ${panelId}: ${storyStructure.character.name} continues the adventure`,
    dialogue: [`"This is panel ${panelId} of our story."`],
    narration: 'The adventure continues with exciting developments.',
    characterEmotions: 'determined',
    sceneAction: 'story progression',
    visualElements: ['consistent design', 'engaging composition'],
    continuityNotes: 'Character consistency maintained',
    imageUrl: `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${panelId}`,
  };
}
