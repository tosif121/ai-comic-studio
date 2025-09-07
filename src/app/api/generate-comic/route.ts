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

    // Step 1: Generate story structure
    console.log('Generating story structure...');
    const storyStructure = await generateStoryStructure({
      storyIdea,
      characterName,
      artStyle,
      mood,
      panels,
      characterTraits,
    });

    // Step 2: Generate panels with images
    console.log('Generating comic panels...');
    const comicPanels = await generatePanelsWithImages(storyStructure, panels);

    const comic: ComicStory = {
      title: storyStructure.title,
      characterProfile: storyStructure.character,
      storyArc: storyStructure.arc,
      panels: comicPanels,
    };

    return NextResponse.json({
      success: true,
      comic,
      generationTime: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Comic generation error:', error);
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

async function generateStoryStructure(input: Required<ComicRequest>) {
  const prompt = `Create a detailed comic book story structure with consistent character development.

STORY CONCEPT: ${input.storyIdea}
CHARACTER NAME: ${input.characterName}
ART STYLE: ${input.artStyle}
MOOD: ${input.mood}
NUMBER OF PANELS: ${input.panels}
CHARACTER TRAITS: ${input.characterTraits.join(', ') || 'determined, resourceful'}

Generate a JSON response with this exact structure:

{
  "title": "Creative title for the comic",
  "character": {
    "name": "${input.characterName}",
    "appearance": "Detailed physical description including clothing, hair, distinctive features",
    "personality": "Key personality traits and mannerisms",
    "backstory": "Brief background that motivates their actions",
    "motivation": "What drives them in this specific story"
  },
  "arc": "Overall story progression and character development",
  "panelOutlines": [
    {
      "panelNumber": 1,
      "purpose": "Story beat (setup/inciting incident/rising action/climax/resolution)",
      "keyAction": "What happens in this panel",
      "characterState": "Character's emotional/physical state",
      "settingDescription": "Where this takes place",
      "transitionTo": "How this connects to next panel"
    }
  ]
}`;

  try {
    const response = await callGemini(prompt, 0.8);
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/``````$/, '');
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse story structure:', error);
    return createFallbackStructure(input);
  }
}

async function generatePanelsWithImages(storyStructure: any, panelCount: number) {
  const panels: ComicPanel[] = [];

  for (let i = 0; i < panelCount; i++) {
    const panelOutline = storyStructure.panelOutlines[i];

    try {
      // Generate panel text content
      const panelPrompt = `Create detailed comic panel content for panel ${i + 1} of ${panelCount}.

STORY CONTEXT:
- Title: ${storyStructure.title}
- Character: ${storyStructure.character.name}
- Appearance: ${storyStructure.character.appearance}
- Current State: ${panelOutline?.characterState || 'determined'}
- Action: ${panelOutline?.keyAction || 'story progression'}
- Setting: ${panelOutline?.settingDescription || 'story scene'}

Generate JSON response:
{
  "imageDescription": "Detailed visual description maintaining character consistency",
  "dialogue": ["Character speech - max 3 lines"],
  "narration": "Brief narrative text",
  "characterEmotions": "Character's emotional state",
  "sceneAction": "What's happening in this moment",
  "visualElements": ["Key visual details", "composition notes"],
  "continuityNotes": "Character consistency notes"
}`;

      const panelResponse = await callGemini(panelPrompt, 0.7);
      let panelData;

      try {
        let jsonStr = panelResponse.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/``````$/, '');
        }
        panelData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error(`Failed to parse panel ${i + 1}:`, parseError);
        panelData = createFallbackPanel(i + 1, panelOutline, storyStructure);
      }

      // Try to generate image (may not work without proper image model)
      let imageUrl = null;
      try {
        const imagePrompt = `Generate a detailed comic panel image: ${panelData.imageDescription}

Character: ${storyStructure.character.name} - ${storyStructure.character.appearance}
Style: ${storyStructure.title} comic book panel
Setting: ${panelOutline?.settingDescription}
Action: ${panelOutline?.keyAction}

Create a detailed visual representation in ${panelData.imageDescription}`;

        const imageResponse = await callGeminiForImage(imagePrompt, 0.7);

        // Try to extract base64 image data
        const imageData = extractImageFromResponse(imageResponse);
        if (imageData) {
          imageUrl = `data:image/png;base64,${imageData}`;
        }
      } catch (imageError) {
        console.warn(`Image generation failed for panel ${i + 1}:`, imageError);
        // Use placeholder
        imageUrl = `https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Panel+${i + 1}`;
      }

      panels.push({
        id: i + 1,
        imageDescription: panelData.imageDescription,
        dialogue: panelData.dialogue || [],
        narration: panelData.narration || '',
        characterEmotions: panelData.characterEmotions || '',
        sceneAction: panelData.sceneAction || '',
        visualElements: panelData.visualElements || [],
        continuityNotes: panelData.continuityNotes || '',
        imageUrl: imageUrl,
      });

      // Rate limiting between panels
      if (i < panelCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error generating panel ${i + 1}:`, error);
      panels.push(createFallbackPanel(i + 1, panelOutline, storyStructure));
    }
  }

  return panels;
}

async function callGemini(prompt: string, temperature: number = 0.7): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('No content generated by Gemini');
  }

  return result.candidates[0].content.parts[0].text;
}

async function callGeminiForImage(prompt: string, temperature: number = 0.7): Promise<string> {
  // Try with image generation model
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    throw new Error(`Gemini Image API error: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.candidates?.[0]?.content?.parts) {
    throw new Error('No content generated by Gemini Image API');
  }

  // Return the full result for image extraction
  return JSON.stringify(result);
}

function extractImageFromResponse(responseStr: string): string | null {
  try {
    const response = JSON.parse(responseStr);
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  } catch (error) {
    console.error('Failed to extract image from response:', error);
  }

  return null;
}

function createFallbackStructure(input: Required<ComicRequest>) {
  const panelOutlines = [];

  for (let i = 0; i < input.panels; i++) {
    const storyProgress = i / (input.panels - 1);

    let purpose, keyAction, characterState;

    if (storyProgress < 0.3) {
      purpose = 'Setup/Introduction';
      keyAction = `Introduce ${input.characterName} and the world of ${input.storyIdea}`;
      characterState = 'curious, unaware of coming adventure';
    } else if (storyProgress < 0.7) {
      purpose = 'Rising Action';
      keyAction = `${input.characterName} encounters challenges from ${input.storyIdea}`;
      characterState = 'determined, facing obstacles';
    } else {
      purpose = 'Climax/Resolution';
      keyAction = `${input.characterName} overcomes challenges and finds resolution`;
      characterState = 'triumphant, transformed';
    }

    panelOutlines.push({
      panelNumber: i + 1,
      purpose,
      keyAction,
      characterState,
      settingDescription: `Setting for ${input.storyIdea}`,
      transitionTo: i < input.panels - 1 ? 'Continues to next panel' : 'Story concludes',
    });
  }

  return {
    title: `${input.characterName}'s ${input.mood} Adventure`,
    character: {
      name: input.characterName,
      appearance: `${input.characterName} has distinctive features that remain consistent across all panels`,
      personality: `Brave and ${input.characterTraits.join(', ') || 'determined'}`,
      backstory: 'A hero ready for adventure',
      motivation: `To succeed in ${input.storyIdea}`,
    },
    arc: `A ${input.mood} journey where ${input.characterName} grows through challenges`,
    panelOutlines,
  };
}

function createFallbackPanel(panelId: number, outline: any, storyStructure: any): ComicPanel {
  return {
    id: panelId,
    imageDescription: `Panel ${panelId}: ${storyStructure.character.name} in ${
      outline?.settingDescription || 'the scene'
    }`,
    dialogue: [`Panel ${panelId} dialogue here`],
    narration: outline?.keyAction || `Panel ${panelId} narration`,
    characterEmotions: outline?.characterState || 'determined',
    sceneAction: outline?.keyAction || 'story progression',
    visualElements: ['consistent character design', 'engaging composition'],
    continuityNotes: 'Maintains character consistency',
  };
}
