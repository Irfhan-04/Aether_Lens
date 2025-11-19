import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CheckIcon, XIcon, RotateIcon, CropIcon, SlidersIcon, WandIcon, UndoIcon, RedoIcon } from './ui/Icons';

interface ImageEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

type EditorTab = 'adjust' | 'filter' | 'crop';

interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  cropRatio: 'original' | '1:1' | '4:3' | '16:9';
  filterPreset: string;
}

const initialState: EditorState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
  cropRatio: 'original',
  filterPreset: 'none'
};

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('adjust');
  
  // History State
  const [history, setHistory] = useState<EditorState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Current Working State (can drift from history during drag operations)
  const [currentState, setCurrentState] = useState<EditorState>(initialState);

  // Load image
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => setImage(img);
    }
  }, [imageUrl]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setHistory([initialState]);
      setHistoryIndex(0);
      setCurrentState(initialState);
    }
  }, [isOpen]);

  // Sync currentState when navigating history
  useEffect(() => {
    setCurrentState(history[historyIndex]);
  }, [history, historyIndex]);

  // Helper to add a new state to history
  const pushToHistory = (newState: EditorState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Immediate update for UI responsiveness (sliders)
  const updateCurrentState = (partial: Partial<EditorState>) => {
    setCurrentState(prev => ({ ...prev, ...partial }));
  };

  // Commit changes to history (on mouse up / click)
  const commitChange = (partial: Partial<EditorState> = {}) => {
    const newState = { ...currentState, ...partial };
    setCurrentState(newState);
    pushToHistory(newState);
  };

  // Draw loop
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { brightness, contrast, saturation, rotation, cropRatio, filterPreset } = currentState;

    // 1. Calculate Dimensions based on Crop Ratio
    let srcW = image.naturalWidth;
    let srcH = image.naturalHeight;
    let cropW = srcW;
    let cropH = srcH;
    let cropX = 0;
    let cropY = 0;

    if (cropRatio !== 'original') {
      const [rw, rh] = cropRatio.split(':').map(Number);
      const targetRatio = rw / rh;
      const srcRatio = srcW / srcH;

      if (srcRatio > targetRatio) {
        // Image is wider than target, crop width
        cropW = srcH * targetRatio;
        cropX = (srcW - cropW) / 2;
      } else {
        // Image is taller, crop height
        cropH = srcW / targetRatio;
        cropY = (srcH - cropH) / 2;
      }
    }

    // 2. Set Canvas Size (considering rotation)
    // For simplicity, we keep canvas bounding box fixed to the crop size, 
    // but swap width/height if rotated 90 or 270
    const isRotated = rotation % 180 !== 0;
    canvas.width = isRotated ? cropH : cropW;
    canvas.height = isRotated ? cropW : cropH;

    // 3. Apply Filters & Adjustments
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    switch (filterPreset) {
      case 'grayscale':
        filterString += ' grayscale(100%)';
        break;
      case 'sepia':
        filterString += ' sepia(100%)';
        break;
      case 'invert':
        filterString += ' invert(100%)';
        break;
      case 'warm':
        filterString += ' sepia(30%) saturate(140%)';
        break;
      case 'cool':
        filterString += ' hue-rotate(180deg) opacity(90%)';
        break;
      case 'vintage':
        filterString += ' sepia(40%) saturate(150%) contrast(90%) brightness(110%)';
        break;
      case 'bw-film':
        filterString += ' grayscale(100%) contrast(120%) brightness(90%)';
        break;
      case 'neo-noir':
        filterString += ' contrast(140%) brightness(80%) saturate(80%)';
        break;
      case 'polaroid':
        filterString += ' contrast(80%) brightness(120%) saturate(120%) sepia(20%)';
        break;
      case 'dramatic':
        filterString += ' contrast(150%) brightness(90%)';
        break;
    }

    ctx.filter = filterString;

    // 4. Draw Logic with Rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw image centered relative to the translated context
    const drawW = cropW;
    const drawH = cropH;
    
    ctx.drawImage(
      image,
      cropX, cropY, cropW, cropH, // Source crop
      -drawW / 2, -drawH / 2, drawW, drawH // Destination (centered)
    );
    
    ctx.restore();

  }, [image, currentState, isOpen]);

  const handleSave = () => {
    if (canvasRef.current) {
      const newUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
      onSave(newUrl);
      onClose();
    }
  };

  // Helper to get preview style for buttons
  const getPreviewStyle = (filter: string) => {
    switch(filter) {
      case 'grayscale': return 'grayscale';
      case 'sepia': return 'sepia';
      case 'invert': return 'invert';
      case 'warm': return 'sepia saturate-200';
      case 'cool': return 'hue-rotate-180 opacity-80';
      case 'vintage': return 'sepia-50 contrast-75 brightness-110';
      case 'bw-film': return 'grayscale contrast-125 brightness-90';
      case 'neo-noir': return 'contrast-150 brightness-75';
      case 'polaroid': return 'brightness-125 contrast-75 sepia-25';
      case 'dramatic': return 'contrast-150 brightness-90';
      default: return '';
    }
  };

  const filters = [
    'none', 'grayscale', 'sepia', 'invert', 
    'warm', 'cool', 'vintage', 'bw-film', 
    'neo-noir', 'polaroid', 'dramatic'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <WandIcon className="w-5 h-5 text-indigo-500" />
            Edit Image
          </h3>
          <div className="flex gap-2 items-center">
             {/* Undo / Redo Controls */}
            <div className="flex gap-1 mr-4 border-r border-zinc-800 pr-4">
              <button 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Undo"
              >
                <UndoIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Redo"
              >
                <RedoIcon className="w-5 h-5" />
              </button>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
              <XIcon className="w-5 h-5" />
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <CheckIcon className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-zinc-900/50 flex items-center justify-center p-8 overflow-hidden">
           <div className="relative shadow-2xl border border-zinc-800/50">
              <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain block" />
           </div>
        </div>

        {/* Controls Area */}
        <div className="h-64 bg-zinc-900 border-t border-zinc-800 flex flex-col">
          
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button 
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'adjust' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <SlidersIcon className="w-4 h-4" /> Adjust
            </button>
            <button 
              onClick={() => setActiveTab('filter')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'filter' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <WandIcon className="w-4 h-4" /> Filters
            </button>
            <button 
              onClick={() => setActiveTab('crop')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'crop' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <CropIcon className="w-4 h-4" /> Crop & Rotate
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {activeTab === 'adjust' && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Brightness</span>
                    <span>{currentState.brightness}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" 
                    value={currentState.brightness} 
                    onChange={(e) => updateCurrentState({ brightness: Number(e.target.value) })}
                    onMouseUp={() => commitChange()}
                    onTouchEnd={() => commitChange()}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Contrast</span>
                    <span>{currentState.contrast}%</span>
                  </div>
                  <input 
                    type="range" min="50" max="150" 
                    value={currentState.contrast} 
                    onChange={(e) => updateCurrentState({ contrast: Number(e.target.value) })}
                    onMouseUp={() => commitChange()}
                    onTouchEnd={() => commitChange()}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Saturation</span>
                    <span>{currentState.saturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="200" 
                    value={currentState.saturation} 
                    onChange={(e) => updateCurrentState({ saturation: Number(e.target.value) })}
                    onMouseUp={() => commitChange()}
                    onTouchEnd={() => commitChange()}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'filter' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mx-auto">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => commitChange({ filterPreset: filter })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      currentState.filterPreset === filter 
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 shadow-inner ${getPreviewStyle(filter)}`}></div>
                    <span className="text-xs capitalize font-medium whitespace-nowrap">{filter.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'crop' && (
              <div className="flex flex-col items-center gap-6">
                 <div className="flex gap-4">
                    <button 
                       onClick={() => commitChange({ rotation: currentState.rotation + 90 })}
                       className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm font-medium transition-colors border border-zinc-700"
                    >
                      <RotateIcon className="w-4 h-4" />
                      Rotate 90°
                    </button>
                 </div>
                 <div className="flex gap-2">
                    {['original', '1:1', '4:3', '16:9'].map((ratio) => (
                       <button
                          key={ratio}
                          onClick={() => commitChange({ cropRatio: ratio as any })}
                          className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                            currentState.cropRatio === ratio
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                          }`}
                       >
                          {ratio === 'original' ? 'Original' : ratio}
                       </button>
                    ))}
                 </div>
                 <p className="text-xs text-zinc-500">Crops are centered automatically.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
