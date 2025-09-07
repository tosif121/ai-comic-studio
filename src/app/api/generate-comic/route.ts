// app/api/generate-comic/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ComicRequest {
  storyIdea: string;
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

// ✅ UPDATED: Configuration for Nano Banana
const CONFIG = {
  MAX_RETRIES: 5,
  BASE_DELAY: 3000,
  EXPONENTIAL_BACKOFF: true,
  MAX_DELAY: 30000,
  MAX_PANELS: 6,
  MIN_PANELS: 2,
  GEMINI_MODELS: {
    TEXT: 'gemini-1.5-flash',
    IMAGE: 'gemini-2.5-flash-image-preview', // ✅ NANO BANANA MODEL
  },
  PANEL_GENERATION_DELAY: 5000,
} as const;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const {
      storyIdea,
      characterName = 'Hero',
      artStyle = 'modern comic book',
      mood = 'adventurous',
      panels = 4,
      characterTraits = [],
    }: ComicRequest = await request.json();

    if (!storyIdea?.trim()) {
      return NextResponse.json({ success: false, error: 'Story idea is required' }, { status: 400 });
    }

    if (panels < CONFIG.MIN_PANELS || panels > CONFIG.MAX_PANELS) {
      return NextResponse.json(
        { success: false, error: `Panel count must be between ${CONFIG.MIN_PANELS} and ${CONFIG.MAX_PANELS}` },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting comic generation with Nano Banana for "${storyIdea}"`);

    // Step 1: Generate story structure
    const storyStructure = await withExponentialBackoff(
      () =>
        generateStoryStructure({
          storyIdea,
          characterName,
          artStyle,
          mood,
          panels,
          characterTraits,
        }),
      'story structure'
    );

    // Step 2: Generate panels with Nano Banana images
    const comicPanels = await generatePanelsWithNanoBanana(storyStructure, panels);

    const comic: ComicStory = {
      title: storyStructure.title,
      characterProfile: storyStructure.character,
      storyArc: storyStructure.arc,
      panels: comicPanels,
    };

    const generationTime = Date.now() - startTime;
    console.log(`✅ Comic generation completed with Nano Banana in ${generationTime}ms`);

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
          error: 'API rate limit exceeded. Please wait a moment and try again.',
          details: 'Too many requests - please try again in a few minutes.',
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

// ✅ IMPROVED: Exponential backoff
async function withExponentialBackoff<T>(fn: () => Promise<T>, operationName: string = 'API call'): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`📞 Attempting ${operationName} (${attempt}/${CONFIG.MAX_RETRIES})`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ ${operationName} attempt ${attempt}/${CONFIG.MAX_RETRIES} failed:`, error.message);

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

  // Remove markdown code blocks - handle both ```json and ``` variants
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find the first '{' and last '}' to extract the JSON object
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

async function generateStoryStructure(input: Required<ComicRequest>) {
  const prompt = `Create a detailed comic book story structure with consistent character development.

STORY CONCEPT: ${input.storyIdea}
CHARACTER NAME: ${input.characterName}
ART STYLE: ${input.artStyle}
MOOD: ${input.mood}
NUMBER OF PANELS: ${input.panels}
CHARACTER TRAITS: ${input.characterTraits.join(', ') || 'determined, resourceful'}

IMPORTANT: This will be used with Nano Banana for image generation. Respond with ONLY valid JSON.
Generate a JSON response with this exact structure:
{
  "title": "Creative title for the comic",
  "character": {
    "name": "${input.characterName}",
    "appearance": "DETAILED physical description for consistent AI image generation - include clothing, hair, facial features, body type, distinctive marks",
    "personality": "Key personality traits and mannerisms",
    "backstory": "Brief background that motivates their actions",
    "motivation": "What drives them in this specific story"
  },
  "arc": "Overall story progression and character development",
  "panelOutlines": [
    ${Array.from(
      { length: input.panels },
      (_, i) => `{
      "panelNumber": ${i + 1},
      "purpose": "Story beat for panel ${i + 1}",
      "keyAction": "Specific visual action happening in this panel",
      "characterState": "Character's emotional/physical state for image generation",
      "settingDescription": "DETAILED scene description for Nano Banana image generation",
      "transitionTo": "How this connects to next panel"
    }`
    ).join(',')}
  ]
}`;

  const response = await callGemini(prompt, 0.8);
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

// ✅ NEW: Generate panels with actual Nano Banana image generation
async function generatePanelsWithNanoBanana(storyStructure: any, panelCount: number) {
  const panels: ComicPanel[] = [];

  console.log(`🎨 Starting Nano Banana panel generation for ${panelCount} panels`);

  for (let i = 0; i < panelCount; i++) {
    const panelOutline = storyStructure.panelOutlines[i];
    console.log(`🍌 Generating panel ${i + 1}/${panelCount} with Nano Banana...`);

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

REQUIREMENTS: Create content for 45-60 second narration. Respond with ONLY valid JSON.
{
  "imageDescription": "DETAILED comic panel description for Nano Banana: Character (${
    storyStructure.character.appearance
  }) doing ${panelOutline?.keyAction} in ${
          panelOutline?.settingDescription
        }. Include pose, expression, background details, lighting, comic book art style",
  "dialogue": ["Character speech - 2-3 lines for natural conversation flow"],
  "narration": "Rich narrative text of 2-3 sentences describing the scene for engaging 45-60 second voiceover",
  "characterEmotions": "Detailed emotional state and facial expressions",
  "sceneAction": "Comprehensive action description with visual details",
  "visualElements": ["Specific lighting", "Background details", "Character positioning", "Comic style elements"],
  "continuityNotes": "Notes for maintaining character consistency across panels"
}`;

        const response = await callGemini(panelPrompt, 0.7);
        const cleaned = cleanJsonResponse(response);
        return JSON.parse(cleaned);
      }, `panel ${i + 1} content`);

      // ✅ NANO BANANA: Generate actual image with Gemini 2.5 Flash Image Preview
      let imageUrl = null;
      try {
        console.log(`🍌 Generating Nano Banana image for panel ${i + 1}...`);

        const imagePrompt = `Generate a high-quality comic book panel illustration:

CHARACTER: ${storyStructure.character.name}
APPEARANCE: ${storyStructure.character.appearance}
SCENE: ${panelData.imageDescription}
SETTING: ${panelOutline?.settingDescription}
ACTION: ${panelOutline?.keyAction}
MOOD: ${storyStructure.character.personality}
STYLE: ${storyStructure.title} - professional comic book art style

VISUAL REQUIREMENTS:
- Comic book panel layout with clear composition
- Consistent character design matching: ${storyStructure.character.appearance}
- Dynamic ${panelOutline?.keyAction} action
- ${panelData.visualElements?.join(', ')} visual elements
- Panel ${i + 1} of ${panelCount} in sequence

Create a detailed, high-quality comic panel that maintains character consistency and tells the story effectively.`;

        const imageResponse = await callNanoBanana(imagePrompt, 0.7);
        const imageData = extractImageFromNanoBananaResponse(imageResponse);

        if (imageData) {
          imageUrl = `data:image/png;base64,${imageData}`;
          console.log(`✅ Nano Banana image generated for panel ${i + 1}`);
        } else {
          console.warn(`⚠️ Nano Banana image generation failed for panel ${i + 1}, using placeholder`);
          imageUrl = `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${i + 1}+-+${encodeURIComponent(
            panelOutline?.purpose || 'Nano Banana'
          )}`;
        }
      } catch (imageError) {
        console.warn(`❌ Nano Banana image generation failed for panel ${i + 1}:`, imageError);
        imageUrl = `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${i + 1}+-+Nano+Banana`;
      }

      panels.push({
        id: i + 1,
        imageDescription: panelData.imageDescription || `Panel ${i + 1} visual description`,
        dialogue: Array.isArray(panelData.dialogue) ? panelData.dialogue : [panelData.dialogue || ''],
        narration: panelData.narration || `Panel ${i + 1} narration for 45-60 second voiceover`,
        characterEmotions: panelData.characterEmotions || 'determined',
        sceneAction: panelData.sceneAction || 'story progression',
        visualElements: Array.isArray(panelData.visualElements) ? panelData.visualElements : [],
        continuityNotes: panelData.continuityNotes || 'Character consistency maintained',
        imageUrl: imageUrl,
      });

      console.log(`✅ Panel ${i + 1} generated successfully with Nano Banana`);

      // Wait between panels to respect rate limits
      if (i < panelCount - 1) {
        console.log(`⏳ Waiting ${CONFIG.PANEL_GENERATION_DELAY}ms before next Nano Banana generation...`);
        await new Promise((resolve) => setTimeout(resolve, CONFIG.PANEL_GENERATION_DELAY));
      }
    } catch (error) {
      console.error(`❌ Error generating panel ${i + 1}:`, error);
      panels.push(createFallbackPanel(i + 1, panelOutline, storyStructure));
    }
  }

  console.log(`✅ All ${panels.length} panels generated with Nano Banana`);
  return panels;
}

// ✅ NANO BANANA: Dedicated function for Gemini 2.5 Flash Image Preview
async function callNanoBanana(prompt: string, temperature: number = 0.7): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODELS.IMAGE}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
          responseModalities: ['TEXT', 'IMAGE'], // ✅ REQUIRED for Nano Banana
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
    console.error(`Nano Banana API error: ${response.status} - ${response.statusText}`, errorText);
    throw new Error(`Nano Banana API error: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();
  return JSON.stringify(result);
}

// ✅ NANO BANANA: Extract image data from Nano Banana response
function extractImageFromNanoBananaResponse(responseStr: string): string | null {
  try {
    const response = JSON.parse(responseStr);
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      // Check for inline data (base64 image)
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

async function callGemini(prompt: string, temperature: number = 0.7): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODELS.TEXT}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    console.error(`Gemini API error: ${response.status} - ${response.statusText}`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('Invalid Gemini response structure:', result);
    throw new Error('No content generated by Gemini');
  }

  return result.candidates[0].content.parts[0].text;
}

function createFallbackStructure(input: Required<ComicRequest>) {
  console.log('⚠️ Using fallback story structure');
  const panelOutlines = [];

  for (let i = 0; i < input.panels; i++) {
    const storyProgress = i / Math.max(input.panels - 1, 1);
    let purpose, keyAction, characterState;

    if (storyProgress <= 0.25) {
      purpose = 'Setup/Introduction';
      keyAction = `Introduce ${input.characterName} and establish the world of ${input.storyIdea}`;
      characterState = 'curious and ready for adventure';
    } else if (storyProgress <= 0.75) {
      purpose = 'Rising Action/Challenge';
      keyAction = `${input.characterName} faces obstacles related to ${input.storyIdea}`;
      characterState = 'determined but challenged';
    } else {
      purpose = 'Climax/Resolution';
      keyAction = `${input.characterName} overcomes challenges and achieves their goal`;
      characterState = 'triumphant and transformed';
    }

    panelOutlines.push({
      panelNumber: i + 1,
      purpose,
      keyAction,
      characterState,
      settingDescription: `A ${input.mood} setting appropriate for ${input.storyIdea} with detailed visual elements for Nano Banana generation`,
      transitionTo: i < input.panels - 1 ? 'Builds toward next panel' : 'Story concludes',
    });
  }

  return {
    title: `${input.characterName} and the ${input.storyIdea
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')}`,
    character: {
      name: input.characterName,
      appearance: `${input.characterName} has distinctive features for consistent Nano Banana generation: specific hair color and style, facial features, clothing style, body type, and unique characteristics that remain constant across all panels`,
      personality:
        input.characterTraits.length > 0 ? input.characterTraits.join(', ') : 'brave, determined, resourceful',
      backstory: `A hero ready for the ${input.storyIdea} adventure`,
      motivation: `To successfully complete their quest`,
    },
    arc: `A ${input.mood} journey of growth and triumph`,
    panelOutlines,
  };
}

function createFallbackPanel(panelId: number, outline: any, storyStructure: any): ComicPanel {
  console.log(`⚠️ Using fallback for panel ${panelId}`);
  return {
    id: panelId,
    imageDescription: `Panel ${panelId}: ${storyStructure.character.name} (detailed appearance: ${
      storyStructure.character.appearance
    }) ${outline?.keyAction || 'continues the adventure'} in ${
      outline?.settingDescription || 'an engaging scene for Nano Banana generation'
    }`,
    dialogue: [`"${outline?.keyAction || `This is panel ${panelId} of our Nano Banana comic story`}."`],
    narration:
      outline?.keyAction ||
      `The adventure continues as our hero faces new challenges in this exciting panel of the story, providing rich content for 45-60 seconds of engaging narration.`,
    characterEmotions: outline?.characterState || 'determined and focused',
    sceneAction: outline?.keyAction || 'story progression with character development',
    visualElements: [
      'consistent character design',
      'engaging composition',
      'dramatic lighting',
      'Nano Banana comic style',
    ],
    continuityNotes: `Maintains ${storyStructure.character.name}'s consistent appearance for Nano Banana: ${storyStructure.character.appearance}`,
    imageUrl: `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${panelId}+-+Nano+Banana`,
  };
}
