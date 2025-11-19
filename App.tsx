import React, { useState, useCallback } from 'react';
import { AspectRatio, GeneratedImage, StylePreset } from './types';
import { generateImages, enhancePrompt, getPromptSuggestions } from './services/geminiService';
import { Gallery } from './components/Gallery';
import { ImageEditor } from './components/ImageEditor';
import { WandIcon, SparklesIcon, LoaderIcon, ImageIcon, TrashIcon, LightbulbIcon } from './components/ui/Icons';

const styleDescriptions: Record<StylePreset, string> = {
  [StylePreset.None]: "Raw generation without specific stylistic adjustments.",
  [StylePreset.Photorealistic]: "Highly detailed, life-like images resembling professional photography.",
  [StylePreset.Cinematic]: "Dramatic lighting, depth of field, and movie-scene aesthetics.",
  [StylePreset.Anime]: "Vibrant colors and distinct character designs typical of Japanese animation.",
  [StylePreset.DigitalArt]: "Polished, modern digital illustration style often used in concept art.",
  [StylePreset.OilPainting]: "Textured brushstrokes and blending resembling traditional oil canvas work.",
  [StylePreset.Cyberpunk]: "High-contrast, neon-lit futuristic urban environments and tech.",
  [StylePreset.Sketch]: "Monochrome or rough pencil/charcoal drawing style.",
  [StylePreset.Fantasy]: "Magical atmospheres, mythical creatures, and ethereal landscapes.",
  [StylePreset.ThreeDModel]: "Clean, rendered 3D look like Pixar or Claymation.",
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [stylePreset, setStylePreset] = useState<StylePreset>(StylePreset.None);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Editing State
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt, stylePreset);
      setPrompt(enhanced);
    } catch (err) {
      console.error(err);
      // Fail silently for enhancement, just keep user prompt
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!prompt) return;
    setIsSuggesting(true);
    try {
      const newSuggestions = await getPromptSuggestions(prompt);
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    setPrompt(prev => {
      const trimmed = prev.trim();
      if (trimmed.length === 0) return suggestion;
      if (trimmed.endsWith(',')) return `${trimmed} ${suggestion}`;
      return `${trimmed}, ${suggestion}`;
    });
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleEditImage = (img: GeneratedImage) => {
    setEditingImage(img);
  };

  const handleSaveEditedImage = (newUrl: string) => {
    if (editingImage) {
      setImages(prev => prev.map(img => 
        img.id === editingImage.id 
          ? { ...img, url: newUrl, timestamp: Date.now() } 
          : img
      ));
      setEditingImage(null);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setError(null);

    // Create placeholders for loading state
    const placeholderIds = Array.from({ length: numberOfImages }, () => crypto.randomUUID() as string);
    const placeholders: GeneratedImage[] = placeholderIds.map(id => ({
      id,
      url: '',
      prompt,
      guidanceScale,
      aspectRatio,
      timestamp: Date.now(),
      stylePreset,
      status: 'loading',
      progress: 0,
      statusMessage: 'Initializing...'
    }));

    // Prepend placeholders to show loading skeleton immediately
    setImages((prev) => [...placeholders, ...prev]);

    try {
      const newImages = await generateImages(
        prompt, 
        aspectRatio, 
        numberOfImages, 
        stylePreset,
        guidanceScale,
        (progress, message) => {
          // Update progress for the current placeholders
          setImages((prev) => prev.map(img => 
            placeholderIds.includes(img.id) 
              ? { ...img, progress, statusMessage: message } 
              : img
          ));
        }
      );
      
      // Replace placeholders with actual generated images
      setImages((prev) => {
        const filtered = prev.filter(img => !placeholderIds.includes(img.id));
        return [...newImages, ...filtered];
      });
    } catch (err: any) {
      // Remove placeholders on error
      setImages((prev) => prev.filter(img => !placeholderIds.includes(img.id)));
      
      console.error("Generation failed:", err);

      let errorMessage = "Failed to generate image. Please check the API key or try a different prompt.";
      
      let errString = '';
      try {
        errString = JSON.stringify(err);
      } catch (e) {
        // ignore circular ref errors
      }

      // Robust check for 429/Quota Limit errors
      // API often nests the error like { error: { code: 429, ... } }
      const isQuotaError = 
        err?.status === 429 || 
        err?.code === 429 ||
        err?.error?.code === 429 || 
        err?.error?.status === 'RESOURCE_EXHAUSTED' ||
        (err?.message && (err.message.includes('429') || err.message.includes('quota'))) ||
        errString.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        errorMessage = "⚠️ Quota Exceeded: You have reached the free tier limit for the API. Please wait a minute before trying again.";
      } else if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <WandIcon className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">AetherLens</span>
          </div>
          <div className="text-xs text-zinc-500 hidden sm:block">
            Powered by Gemini Imagen 3
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Controls Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 sticky top-24">
            
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Prompt</label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your imagination..."
                  className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-zinc-600"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleGetSuggestions}
                    disabled={isSuggesting || !prompt || prompt.length < 3}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Get Creative Suggestions"
                  >
                    {isSuggesting ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <LightbulbIcon className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Enhance Prompt with AI"
                  >
                    {isEnhancing ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Suggestions Chips */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addSuggestion(s)}
                      className="text-xs bg-zinc-800/50 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-zinc-700 hover:border-indigo-500/50 px-2.5 py-1 rounded-full transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Style Preset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Style</label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              >
                {Object.values(StylePreset).map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 transition-all">
                <p className="text-xs text-zinc-400">
                  <span className="text-indigo-400 font-medium">Effect: </span>
                  {styleDescriptions[stylePreset]}
                </p>
              </div>
            </div>

            {/* Guidance Scale Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1 flex justify-between">
                <span>Prompt Strength</span>
                <span className="text-zinc-500 font-mono">{guidanceScale}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(AspectRatio).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

             {/* Number of Images */}
             <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Count: {numberOfImages}</label>
              <input 
                type="range" 
                min="1" 
                max="4" 
                step="1"
                value={numberOfImages}
                onChange={(e) => setNumberOfImages(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-zinc-600 px-1">
                <span>1</span>
                <span>4</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating || !prompt}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Generate Art
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs mt-4">
                {error}
              </div>
            )}
          </form>
        </aside>

        {/* Gallery Area */}
        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Gallery</h2>
            <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500">{images.length} creations</span>
                {images.length > 0 && (
                    <button
                        onClick={() => setImages([])}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                    >
                        <TrashIcon className="w-3 h-3" />
                        Clear All
                    </button>
                )}
            </div>
          </div>

          <Gallery images={images} onDelete={handleDeleteImage} onEdit={handleEditImage} />
        </section>
      </main>

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor 
          imageUrl={editingImage.url} 
          isOpen={!!editingImage} 
          onClose={() => setEditingImage(null)}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  );
};

export default App;