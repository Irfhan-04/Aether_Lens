import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon, LoaderIcon, TrashIcon, EditIcon } from './ui/Icons';

interface GalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
  onEdit: (img: GeneratedImage) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onDelete, onEdit }) => {
  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `aether-lens-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 bg-zinc-900/30">
        <p className="text-lg">No images generated yet.</p>
        <p className="text-sm">Enter a prompt to begin creation.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((img) => {
        if (img.status === 'loading') {
          return (
             <div key={img.id} className="relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-xl">
                <div className="relative w-full bg-zinc-800 flex flex-col items-center justify-center" style={{
                   aspectRatio: img.aspectRatio.replace(':', '/')
                }}>
                  <div className="w-3/4 max-w-[200px] flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      <span>{img.statusMessage || 'Generating'}</span>
                      <span>{img.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${img.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-zinc-800 bg-zinc-900 space-y-2">
                    <div className="h-3 bg-zinc-800 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
                </div>
            </div>
          );
        }

        return (
          <div key={img.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-800 transition-all hover:border-indigo-500/50">
            {/* Aspect Ratio Container */}
            <div className={`relative w-full bg-zinc-950`} style={{
               aspectRatio: img.aspectRatio.replace(':', '/')
            }}>
              <img 
                src={img.url} 
                alt={img.prompt} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-medium line-clamp-2 mb-3 text-shadow-sm">
                  {img.prompt}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(img.url, img.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white py-2 px-2 rounded-lg text-xs font-semibold transition-colors border border-white/10"
                    title="Download Image"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    Save
                  </button>
                   <button
                    onClick={() => onEdit(img)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md hover:bg-indigo-500/20 text-white hover:text-indigo-200 py-2 px-2 rounded-lg text-xs font-semibold transition-colors border border-white/10"
                    title="Edit Image"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(img.id)}
                    className="flex items-center justify-center px-3 bg-white/10 backdrop-blur-md hover:bg-red-500/20 text-white hover:text-red-200 rounded-lg border border-white/10 transition-colors"
                    title="Delete Image"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile/Static Footer for Metadata */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900 block lg:hidden">
               <p className="text-xs text-zinc-400 truncate">{img.prompt}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};