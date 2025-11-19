export enum AspectRatio {
  Square = '1:1',
  Portrait = '3:4',
  Landscape = '4:3',
  Wide = '16:9',
  Tall = '9:16',
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  guidanceScale?: number;
  aspectRatio: AspectRatio;
  timestamp: number;
  stylePreset?: string;
  status?: 'loading' | 'completed';
  progress?: number;
  statusMessage?: string;
}

export enum StylePreset {
  None = 'None',
  Photorealistic = 'Photorealistic',
  Cinematic = 'Cinematic',
  Anime = 'Anime',
  DigitalArt = 'Digital Art',
  OilPainting = 'Oil Painting',
  Cyberpunk = 'Cyberpunk',
  Sketch = 'Sketch',
  Fantasy = 'Fantasy',
  ThreeDModel = '3D Model',
}

export interface GenerationConfig {
  prompt: string;
  guidanceScale: number;
  aspectRatio: AspectRatio;
  numberOfImages: number;
  stylePreset: StylePreset;
}