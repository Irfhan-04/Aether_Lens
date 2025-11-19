import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, AspectRatio, StylePreset } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const styleModifiers: Record<StylePreset, string> = {
  [StylePreset.None]: "",
  [StylePreset.Photorealistic]: ", photorealistic, 8k, highly detailed, realistic lighting, professional photography, sharp focus",
  [StylePreset.Cinematic]: ", cinematic lighting, movie scene, dramatic atmosphere, shallow depth of field, 4k, anamorphic lens",
  [StylePreset.Anime]: ", anime style, vibrant colors, studio ghibli style, cel shaded, highly detailed, distinct character design",
  [StylePreset.DigitalArt]: ", digital art, trending on artstation, concept art, smooth, sharp focus, illustration, highly polished",
  [StylePreset.OilPainting]: ", oil painting, textured brushstrokes, canvas texture, classical art style, impasto",
  [StylePreset.Cyberpunk]: ", cyberpunk, neon lights, futuristic, high contrast, night city, sci-fi, glowing accents",
  [StylePreset.Sketch]: ", sketch, pencil drawing, monochrome, rough lines, charcoal style, hand drawn",
  [StylePreset.Fantasy]: ", fantasy art, magical, ethereal, detailed background, epic composition, mythic",
  [StylePreset.ThreeDModel]: ", 3d render, blender, octane render, claymation, iso, cute, smooth textures",
};

/**
 * Enhances a simple prompt using a text model to add detail and artistic flair.
 */
export const enhancePrompt = async (originalPrompt: string, style: StylePreset): Promise<string> => {
  if (!originalPrompt) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following image generation prompt to be more descriptive, high-quality, and suitable for an AI image generator. 
      Target Style: ${style}. 
      Keep it under 50 words. 
      Original Prompt: "${originalPrompt}"`,
    });
    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return originalPrompt;
  }
};

/**
 * Generates a list of related keywords or phrases to help the user expand their prompt.
 */
export const getPromptSuggestions = async (originalPrompt: string): Promise<string[]> => {
  if (!originalPrompt || originalPrompt.length < 3) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following image generation prompt and suggest 5-7 relevant, single-word or short-phrase keywords that could enhance it (e.g. lighting, style, mood, details). Return ONLY the keywords separated by commas. Do not include numbering or bullet points.
      Prompt: "${originalPrompt}"`,
    });
    
    const text = response.text?.trim() || "";
    // Split by comma, clean up whitespace, and filter empty strings
    return text.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 30) // Basic length check to avoid hallucinated sentences
      .slice(0, 8); // Limit to 8 suggestions max
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
};

/**
 * Generates images using the Imagen model.
 * Accepts an onProgress callback to update status during the generation process.
 */
export const generateImages = async (
  prompt: string,
  aspectRatio: AspectRatio,
  numberOfImages: number,
  stylePreset: StylePreset,
  guidanceScale: number,
  onProgress?: (progress: number, message: string) => void
): Promise<GeneratedImage[]> => {
  
  // Append style keywords to the prompt if a preset is selected
  let finalPrompt = prompt;
  const modifier = styleModifiers[stylePreset];
  
  if (modifier) {
    finalPrompt = `${prompt}${modifier}`;
  } else if (stylePreset !== StylePreset.None) {
    // Fallback if specific modifier missing
    finalPrompt = `${prompt}, ${stylePreset} style, high quality, detailed`;
  }

  const loadingMessages = [
    "Initializing AI model...",
    "Interpreting prompt...",
    "Denoising latent space...",
    "Enhancing details...",
    "Applying style filters...",
    "Final polishing..."
  ];

  // Simulate progress since API doesn't stream it for images
  let currentProgress = 0;
  
  if (onProgress) onProgress(0, loadingMessages[0]);

  const progressInterval = setInterval(() => {
    if (currentProgress < 90) {
      // Increment progress randomly to feel organic
      const increment = Math.floor(Math.random() * 10) + 2;
      currentProgress = Math.min(currentProgress + increment, 90);
      
      // Pick message based on progress thresholds
      let msgIndex = 0;
      if (currentProgress > 15) msgIndex = 1;
      if (currentProgress > 30) msgIndex = 2;
      if (currentProgress > 50) msgIndex = 3;
      if (currentProgress > 70) msgIndex = 4;
      if (currentProgress > 85) msgIndex = 5;

      if (onProgress) onProgress(currentProgress, loadingMessages[msgIndex]);
    }
  }, 500);

  try {
    const config: any = {
      numberOfImages: numberOfImages,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
      guidanceScale: guidanceScale,
    };

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: config,
    });

    // Generation complete
    clearInterval(progressInterval);
    if (onProgress) onProgress(100, "Completed");

    const images: GeneratedImage[] = [];
    
    if (response.generatedImages) {
        for (const imgData of response.generatedImages) {
            if (imgData.image && imgData.image.imageBytes) {
                const base64ImageBytes = imgData.image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                
                images.push({
                    id: crypto.randomUUID(),
                    url: imageUrl,
                    prompt: finalPrompt,
                    guidanceScale: guidanceScale,
                    aspectRatio: aspectRatio,
                    timestamp: Date.now(),
                    stylePreset: stylePreset,
                    status: 'completed',
                    progress: 100,
                    statusMessage: "Completed"
                });
            }
        }
    }
    
    return images;

  } catch (error) {
    clearInterval(progressInterval);
    console.error("Error generating images:", error);
    throw error;
  }
};