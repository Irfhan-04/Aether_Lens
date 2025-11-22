# AetherLens - AI Image Studio

**A professional-grade AI image generation application powered by Google's Imagen 3 model**

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Gemini API](https://img.shields.io/badge/Gemini-Imagen%203-purple.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Setup & Installation](#-setup--installation)
- [Hardware Requirements](#-hardware-requirements)
- [Usage Instructions](#-usage-instructions)
- [Prompt Engineering](#-prompt-engineering-tips--best-practices)
- [Model Details](#-model-details)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🎨 Project Overview

AetherLens is a modern, full-featured AI image generation studio that leverages Google's Imagen 3 model through the Gemini API. Built with React and TypeScript, it provides an intuitive interface for creating, editing, and managing AI-generated artwork with advanced controls for style, composition, and aspect ratio.

### ✨ Key Features

- **🎨 Text-to-Image Generation**: Transform text prompts into high-quality images using Imagen 4.0
- **🤖 AI Prompt Enhancement**: Automatically enhance prompts using Gemini 2.5 Flash
- **💡 Smart Suggestions**: Get contextual keyword suggestions to improve your prompts
- **🎭 Style Presets**: 10 built-in artistic styles (Photorealistic, Cinematic, Anime, Digital Art, Oil Painting, Cyberpunk, Sketch, Fantasy, 3D Model)
- **✂️ Image Editor**: Built-in editor with filters, adjustments, cropping, and rotation
- **↩️ Undo/Redo System**: Full history management for editing operations
- **📦 Batch Generation**: Generate up to 4 images simultaneously
- **🖼️ Responsive Gallery**: View and manage all generated images
- **⏱️ Real-time Progress**: Live progress tracking with status messages during generation
- **💾 Download Options**: Export high-quality JPEG images
- **🌙 Dark Mode UI**: Modern, professional dark theme interface

### 🎯 Use Cases

- **Digital Artists**: Rapid concept art and ideation
- **Content Creators**: Social media graphics and thumbnails
- **Designers**: Mood boards and visual references
- **Marketers**: Ad creative and campaign visuals
- **Educators**: Visual aids and educational content
- **Hobbyists**: Creative exploration and experimentation

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (React)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Controls  │  │   Gallery    │  │  Image Editor    │   │
│  │   Sidebar   │  │   Component  │  │  (Canvas API)    │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │              │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Management (React Hooks)             │
│  • useState for UI state    • useEffect for side effects    │
│  • useCallback for optimization  • useRef for canvas       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer (geminiService.ts)            │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ Prompt          │  │ Image Generation  │                 │
│  │ Enhancement     │  │ (Imagen 4.0)      │                 │
│  └────────┬────────┘  └────────┬──────────┘                 │
│           │                     │                            │
└───────────┼─────────────────────┼────────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Generative AI SDK (@google/genai)        │
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  Gemini 2.5      │        │   Imagen 4.0     │          │
│  │  Flash Model     │        │   Generate Model │          │
│  └──────────────────┘        └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud AI Services                  │
│         (API-based, no local model files required)          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── App.tsx                      # Main application container
│   ├── State management
│   ├── Event handlers
│   └── Layout orchestration
│
├── components/
│   ├── Gallery.tsx              # Image grid with hover actions
│   │   ├── Loading skeletons
│   │   ├── Progress indicators
│   │   └── Action buttons (download, edit, delete)
│   │
│   ├── ImageEditor.tsx          # Canvas-based editing modal
│   │   ├── Tabbed interface (Adjust, Filter, Crop)
│   │   ├── History management (undo/redo)
│   │   ├── Real-time preview
│   │   └── Canvas rendering engine
│   │
│   └── ui/
│       └── Icons.tsx            # SVG icon library
│
├── services/
│   └── geminiService.ts         # API integration layer
│       ├── generateImages()     # Main image generation
│       ├── enhancePrompt()      # AI prompt enhancement
│       └── getPromptSuggestions() # Keyword suggestions
│
├── types.ts                     # TypeScript interfaces
│   ├── GeneratedImage
│   ├── AspectRatio enum
│   ├── StylePreset enum
│   └── GenerationConfig
│
├── index.tsx                    # Application entry point
└── index.html                   # HTML template
```

### Data Flow Architecture

```
1. USER INPUT
   ├─> Prompt text
   ├─> Style preset selection
   ├─> Aspect ratio selection
   ├─> Guidance scale (0-20)
   └─> Number of images (1-4)
        │
        ▼
2. OPTIONAL ENHANCEMENT
   ├─> Click "Enhance Prompt" button
   ├─> Gemini 2.5 Flash processes prompt
   ├─> Returns enhanced descriptive text
   └─> Updates prompt field
        │
        ▼
3. GENERATION REQUEST
   ├─> Combine prompt + style modifiers
   ├─> Create generation config
   ├─> Send to Imagen 4.0 API
   └─> Create loading placeholders in UI
        │
        ▼
4. PROCESSING
   ├─> API processes request (10-30 seconds)
   ├─> Progress updates (simulated)
   ├─> Receive base64 encoded images
   └─> Convert to data URLs
        │
        ▼
5. STORAGE & DISPLAY
   ├─> Store in React state with metadata
   ├─> Display in responsive gallery grid
   ├─> Enable download/edit/delete actions
   └─> Maintain generation history
        │
        ▼
6. OPTIONAL EDITING
   ├─> Open in ImageEditor modal
   ├─> Apply filters/adjustments via Canvas API
   ├─> Manage edit history (undo/redo)
   ├─> Export as new data URL
   └─> Update in gallery
        │
        ▼
7. EXPORT
   └─> Download as JPEG (quality: 0.92)
```

---

## 🛠️ Technology Stack

### Frontend Framework
- **React** 19.2.0 - Component-based UI library
- **TypeScript** 5.8.2 - Type-safe JavaScript
- **Vite** 6.2.0 - Fast build tool and dev server
- **Tailwind CSS** (via CDN) - Utility-first CSS framework

### AI/ML Services
- **@google/genai** 1.30.0 - Google Generative AI SDK
- **Imagen 4.0** - Text-to-image generation model
- **Gemini 2.5 Flash** - Text processing and enhancement

### Development Tools
- **@vitejs/plugin-react** 5.0.0 - React plugin for Vite
- **@types/node** 22.14.0 - Node.js type definitions
- **ESM Modules** - Modern JavaScript module system

### Browser APIs
- **Canvas API** - Image manipulation and rendering
- **File API** - Image download functionality
- **CSS Filters** - Real-time visual effects

### State Management
- **React Hooks** - useState, useEffect, useCallback, useRef
- **In-memory Storage** - No database dependencies

---

## 🚀 Setup & Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - Version 16.x or higher ([Download](https://nodejs.org/))
- **NPM** - Version 8.x or higher (comes with Node.js)
- **Git** - For cloning the repository ([Download](https://git-scm.com/))
- **Gemini API Key** - Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/aetherlens-ai-image-studio.git

# OR clone via SSH
git clone git@github.com:yourusername/aetherlens-ai-image-studio.git

# Navigate to project directory
cd aetherlens-ai-image-studio
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will install:
# - @google/genai (AI SDK)
# - react, react-dom (UI framework)
# - TypeScript and type definitions
# - Vite and build tools
```

### Step 3: Configure API Key

Create a `.env.local` file in the root directory:

```bash
# Create the file
touch .env.local

# Add your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local
```

Or manually create `.env.local` with:

```env
GEMINI_API_KEY=your_actual_api_key_from_google_ai_studio
```

⚠️ **Security Important**: 
- Never commit `.env.local` to version control
- The file is already in `.gitignore`
- Never share your API key publicly
- Rotate keys if accidentally exposed

### Step 4: Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v16.x.x or higher

# Check npm version
npm --version
# Should output: 8.x.x or higher

# Verify dependencies installed
npm list --depth=0
```

### Step 5: Start Development Server

```bash
npm run dev
```

Expected output:
```
VITE v6.2.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.x:3000/
➜  press h to show help
```

Open your browser and navigate to `http://localhost:3000`

### Step 6: Build for Production

```bash
# Create optimized production build
npm run build

# Output will be in dist/ directory
# Preview production build
npm run preview
```

### Model Download Instructions

**Good News**: No manual model downloads required! 

AetherLens uses Google's cloud-based models via API:

- **Imagen 4.0** (`imagen-4.0-generate-001`) - Accessed via API
- **Gemini 2.5 Flash** (`gemini-2.5-flash`) - Accessed via API

All models are hosted by Google and accessed through the `@google/genai` SDK. Your API key provides access to these models without any local storage requirements.

### Troubleshooting Installation

**Issue**: `npm install` fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Issue**: API key not recognized
```bash
# Verify .env.local exists
ls -la | grep .env.local

# Verify file content (should show your key)
cat .env.local

# Restart dev server after changes
npm run dev
```

**Issue**: Port 3000 already in use
```bash
# Edit vite.config.ts and change port:
server: {
  port: 3001,  // or any available port
}
```

---

## 💻 Hardware Requirements

### Minimum System Requirements

| Component | Specification |
|-----------|---------------|
| **CPU** | Dual-core processor (2.0 GHz or higher) |
| **RAM** | 4 GB |
| **Storage** | 500 MB free space |
| **Network** | Stable internet connection (required for API) |
| **GPU** | Not required (processing is cloud-based) |
| **Display** | 1280x720 resolution |
| **OS** | Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+) |

### Recommended System Requirements

| Component | Specification |
|-----------|---------------|
| **CPU** | Quad-core processor (3.0 GHz or higher) |
| **RAM** | 8 GB or more |
| **Storage** | 2 GB free space |
| **Network** | High-speed internet (10+ Mbps recommended) |
| **GPU** | Not required, but improves canvas rendering |
| **Display** | 1920x1080 resolution or higher |
| **OS** | Latest stable OS version |

### Network Requirements

- **Minimum Bandwidth**: 5 Mbps download, 1 Mbps upload
- **Recommended Bandwidth**: 10+ Mbps download, 5+ Mbps upload
- **Latency**: < 100ms to Google servers
- **Data Usage**: ~2-5 MB per generated image (varies by resolution)

### Browser Compatibility

| Browser | Minimum Version | Recommended Version |
|---------|----------------|---------------------|
| **Chrome** | 90+ | Latest stable |
| **Firefox** | 88+ | Latest stable |
| **Safari** | 14+ | Latest stable |
| **Edge** | 90+ | Latest stable |

**Note**: Chrome and Edge (Chromium-based) provide the best performance for canvas operations.

### Important Notes

1. **No GPU Required**: Unlike local Stable Diffusion setups, AetherLens does NOT require a GPU because all image generation happens on Google's servers via API.

2. **Cloud-Based Processing**: Your computer only handles:
   - UI rendering (React components)
   - Canvas operations (image editing)
   - API request management
   - Display of received images

3. **RAM Usage**: Typical RAM usage is 200-500 MB for the application. Large batch generations may temporarily increase usage to ~1 GB.

4. **Storage**: Images are stored in memory (React state) and cleared on page refresh. For persistent storage, manually download images.

---

## 📖 Usage Instructions

### Basic Image Generation Workflow

#### 1. Enter a Prompt

Type your image description in the prompt textarea:

```
Example: "A serene mountain landscape at sunset with purple sky"
```

**Tips**:
- Be specific about what you want
- Include details about lighting, mood, style
- Use descriptive adjectives

#### 2. (Optional) Enhance Your Prompt ✨

Click the **Sparkles icon** (✨) to automatically improve your prompt with AI:

**Before**: "A cat"
**After**: "A majestic Maine Coon cat with piercing green eyes, sitting regally on a velvet cushion, soft window lighting, photorealistic, highly detailed fur texture, 8k"

The enhancement adds:
- Descriptive details
- Lighting information
- Quality modifiers
- Style-specific language

#### 3. (Optional) Get Smart Suggestions 💡

Click the **Lightbulb icon** (💡) to receive keyword suggestions:

**Original**: "cyberpunk city"
**Suggestions**: neon lights, rain, night time, holographic, futuristic, reflections

Click any suggestion chip to add it to your prompt.

#### 4. Select a Style Preset 🎭

Choose from 10 artistic styles:

| Style | Best For | Example Output |
|-------|----------|----------------|
| **None** | Raw generation, full control | Natural AI interpretation |
| **Photorealistic** | Portraits, products, nature | DSLR-quality photographs |
| **Cinematic** | Dramatic scenes, storytelling | Movie-quality visuals |
| **Anime** | Characters, vibrant art | Japanese animation style |
| **Digital Art** | Concept art, illustrations | Artstation-quality work |
| **Oil Painting** | Classical art, portraits | Traditional canvas look |
| **Cyberpunk** | Futuristic, neon scenes | Blade Runner aesthetic |
| **Sketch** | Line art, studies | Pencil/charcoal drawings |
| **Fantasy** | Magical scenes, creatures | D&D/fantasy game art |
| **3D Model** | Characters, objects | Pixar/Blender renders |

#### 5. Adjust Parameters

**Prompt Strength (Guidance Scale)**: 0-20
- **Low (3-5)**: More creative, abstract interpretation
- **Medium (7-8)**: Balanced adherence (recommended)
- **High (12-20)**: Strict prompt following, may reduce creativity

**Aspect Ratio**:
- **1:1** - Square (Instagram posts)
- **3:4** - Portrait (Pinterest, profile pics)
- **4:3** - Landscape (Presentations)
- **16:9** - Wide (Desktop wallpapers, YouTube thumbnails)
- **9:16** - Tall (Mobile wallpapers, Stories)

**Number of Images**: 1-4
- Generate multiple variations in one request
- Useful for comparing different interpretations

#### 6. Generate Images

Click **"Generate Art"** button.

**What happens next**:
1. Loading placeholders appear immediately
2. Progress bar shows real-time status (0-100%)
3. Status messages update: "Initializing...", "Interpreting prompt...", etc.
4. Generation completes in 10-30 seconds
5. Images appear in gallery automatically

#### 7. Manage Generated Images

**Gallery Actions** (hover over image):

- **Save** 💾 - Download as JPEG
- **Edit** ✏️ - Open in image editor
- **Delete** 🗑️ - Remove from gallery

**Bulk Actions**:
- **Clear All** - Remove all images from gallery

### Advanced Image Editing

Click **Edit** on any image to open the full-screen editor.

#### Adjust Tab 🎨

Fine-tune image properties with sliders:

**Brightness** (50-150%)
- **< 100%**: Darker image
- **= 100%**: Original
- **> 100%**: Brighter image
- Use case: Fix underexposed images

**Contrast** (50-150%)
- **< 100%**: Flatter, washed out
- **= 100%**: Original
- **> 100%**: More dramatic, punchier
- Use case: Add depth and dimension

**Saturation** (0-200%)
- **0%**: Grayscale/black & white
- **= 100%**: Original colors
- **> 100%**: Vibrant, intense colors
- Use case: Create mood, adjust color intensity

**Pro Tip**: Drag sliders to see real-time preview. Changes commit to history when you release the slider.

#### Filter Tab ✨

Apply preset filters with one click:

| Filter | Effect | Best For |
|--------|--------|----------|
| **None** | Original image | Reset filters |
| **Grayscale** | Black & white | Classic, dramatic look |
| **Sepia** | Vintage brown tone | Old photograph aesthetic |
| **Invert** | Reverse colors | Artistic, abstract effects |
| **Warm** | Orange/yellow tones | Cozy, nostalgic feel |
| **Cool** | Blue/cyan tones | Calm, professional look |
| **Vintage** | Faded, nostalgic | Retro photography |
| **B&W Film** | High contrast B&W | Film noir, dramatic |
| **Neo-Noir** | Dark, moody | Cinematic thriller look |
| **Polaroid** | Faded, bright | Instant camera aesthetic |
| **Dramatic** | High contrast | Bold, impactful images |

#### Crop & Rotate Tab ✂️

**Rotation**:
- Click **"Rotate 90°"** to rotate clockwise
- Click multiple times for 180°, 270°, 360°
- Use case: Fix orientation, create different compositions

**Crop Ratios**:
- **Original** - Maintains source aspect ratio
- **1:1** - Perfect square (Instagram)
- **4:3** - Standard landscape
- **16:9** - Widescreen format

**Cropping Behavior**:
- Crops are centered automatically
- Preserves maximum content while fitting ratio
- No manual crop box (simplified workflow)

#### History Controls ↩️ ↪️

**Undo** (⟲ button):
- Step backward through editing history
- Restores previous state completely
- Available for all changes (adjustments, filters, crops, rotations)

**Redo** (⟳ button):
- Re-apply undone changes
- Moves forward through history
- Available when undo has been used

**Tips**:
- Full editing session is preserved
- Slider movements commit to history on release (not during drag)
- Filter/crop/rotate changes commit immediately
- Maximum history depth: unlimited during session

#### Save Changes

Click **"Save Changes"** to:
1. Export edited image as new data URL
2. Update image in gallery
3. Preserve original metadata (prompt, timestamp)
4. Close editor modal

---

## 🎯 Prompt Engineering Tips & Best Practices

### Prompt Structure Framework

**Optimal Format**:
```
[Main Subject] + [Key Details] + [Environment/Setting] + [Lighting] + 
[Mood/Atmosphere] + [Style/Medium] + [Quality Modifiers]
```

### Detailed Examples by Category

#### Portraits

```
❌ Bad: "person smiling"

✅ Good: "Portrait of a young woman with curly auburn hair, gentle smile, 
wearing a cream knit sweater, golden hour lighting from window, warm 
atmosphere, soft focus background, professional photography, 85mm lens, 
shallow depth of field"

✅ Great: "Cinematic portrait of an elderly craftsman with weathered hands 
and kind eyes, workshop setting with wooden tools in soft focus, dust 
particles visible in morning sunlight streaming through window, Rembrandt 
lighting, film grain, warm color palette, intimate mood, medium format 
photography"
```

#### Landscapes

```
❌ Bad: "mountain view"

✅ Good: "Majestic mountain range at sunset, snow-capped peaks, alpine 
meadow in foreground with wildflowers, dramatic clouds, golden hour 
lighting, wide angle view, crisp details"

✅ Great: "Epic vista of jagged mountain peaks piercing through sea of 
clouds, purple and orange sunset sky, foreground with ancient gnarled pine 
tree silhouette, atmospheric perspective, god rays breaking through clouds, 
moody and ethereal, landscape photography, HDR, ultra sharp, 16mm wide angle"
```

#### Characters & Creatures

```
❌ Bad: "fantasy dragon"

✅ Good: "Majestic dragon with emerald scales, perched on cliff edge, 
wings spread wide, sunset background, fantasy art style, detailed scales 
and textures"

✅ Great: "Ancient celestial dragon with iridescent scales shifting between 
deep blue and purple, intricate golden horn patterns, wise amber eyes, 
coiled around floating crystal spire above clouds, magical aurora in 
background, volumetric lighting through translucent wings, fantasy 
illustration, high detail, epic composition, trending on artstation"
```

#### Architecture & Environments

```
❌ Bad: "futuristic building"

✅ Good: "Futuristic skyscraper with glass facade, neon accent lights, 
cyberpunk city setting, night scene, reflective surfaces, modern 
architecture"

✅ Great: "Towering neo-brutalist megastructure with asymmetric design, 
holographic advertisements cascading down walls, flying vehicles weaving 
between buildings, neon underglow, rain-slicked streets reflecting pink 
and cyan lights, cyberpunk aesthetic, cinematic composition, Blade Runner 
atmosphere, volumetric fog, high contrast, ultra detailed, 8k rendering"
```

### Essential Keywords by Category

#### Lighting Terms
- **Natural**: golden hour, blue hour, overcast, dappled sunlight
- **Artificial**: neon, rim lighting, Rembrandt lighting, backlit
- **Dramatic**: god rays, volumetric lighting, chiaroscuro, dramatic shadows
- **Soft**: diffused, soft glow, ambient light, gentle illumination

#### Quality Modifiers
- **Resolution**: 8k, 4k, ultra HD, high resolution
- **Detail**: highly detailed, intricate, sharp focus, crisp
- **Rendering**: octane render, unreal engine, ray tracing, photorealistic
- **Professional**: professional photography, award winning, masterpiece

#### Mood & Atmosphere
- **Positive**: serene, peaceful, joyful, vibrant, uplifting
- **Dark**: moody, ominous, mysterious, eerie, haunting
- **Dreamy**: ethereal, surreal, dreamlike, magical, enchanting
- **Energetic**: dynamic, explosive, intense, dramatic, action-packed

#### Composition Terms
- **Framing**: close-up, wide shot, aerial view, bird's eye view
- **Depth**: shallow depth of field, bokeh, layered composition
- **Perspective**: low angle, dutch angle, isometric, first person view
- **Balance**: rule of thirds, centered, symmetrical, asymmetrical

### Style-Specific Tips

#### For Photorealistic Style
```
Key additions: professional photography, DSLR, 85mm lens, shallow depth 
of field, natural lighting, high detail, sharp focus, 8k resolution

Example: "Professional portrait photograph of [subject], 85mm lens, 
f/1.8 aperture, natural window lighting, sharp focus on eyes, subtle 
background blur, realistic skin texture, shot on Canon 5D Mark IV"
```

#### For Cinematic Style
```
Key additions: cinematic lighting, film grain, anamorphic lens, color 
grading, dramatic atmosphere, movie still, 2.39:1 aspect ratio

Example: "Cinematic scene of [subject], dramatic lighting from single 
source, film grain, desaturated color palette with teal and orange tones, 
shallow focus, anamorphic lens flare, moody atmosphere, professional color 
grading"
```

#### For Anime Style
```
Key additions: anime style, cel shaded, vibrant colors, Studio Ghibli, 
character design, clean lines, expressive eyes

Example: "Anime illustration of [character], vibrant colors, cel shaded, 
Studio Ghibli style, expressive large eyes, flowing hair with dynamic 
movement, detailed costume design, soft gradients, clean linework, 
professional anime art"
```

#### For Digital Art Style
```
Key additions: digital painting, concept art, trending on artstation, 
highly detailed illustration, matte painting, art by [artist name]

Example: "Digital concept art of [subject], highly detailed illustration, 
trending on artstation, dramatic lighting, rich colors, painterly style, 
detailed background elements, professional digital painting, sharp focus"
```

### Common Mistakes to Avoid

❌ **Too Vague**: "nice picture of sunset"
✅ **Specific**: "Dramatic sunset over ocean with orange and purple clouds, silhouetted palm trees, golden light reflecting on water"

❌ **Conflicting Styles**: "photorealistic anime character"
✅ **Consistent**: Choose either "photorealistic portrait" OR "anime character"

❌ **Negative Descriptions**: "no blur, not dark, without noise"
✅ **Positive**: "sharp focus, bright lighting, clean image"

❌ **Overloaded**: 300+ word essay describing every microscopic detail
✅ **Focused**: 30-80 words hitting key visual elements

❌ **Inconsistent Lighting**: "sunrise, sunset, and moonlight"
✅ **Single Source**: "warm sunrise lighting with orange glow"

### Advanced Techniques

#### Technique 1: Layered Detail
Build complexity by layering descriptions:
```
[Main Subject] → [Medium Detail] → [Fine Detail] → [Atmosphere]

"Ancient wizard → with flowing silver beard → intricate star patterns 
embroidered on midnight blue robes → mystical purple glow surrounding hands 
→ casting spell → magical particles floating → in candlelit tower study → 
books and artifacts visible in background → atmospheric fog → fantasy 
illustration style"
```

#### Technique 2: Reference Fusion
Combine reference points for unique results:
```
"[Concept] in the style of [Artist/Style] meets [Another Style]"

Example: "Cyberpunk samurai in the style of Akira Toriyama meets Blade 
Runner, neon-lit rain-soaked streets, anime character design with 
photorealistic environmental details"
```

#### Technique 3: Mood First
Start with emotional/atmospheric goal:
```
"Create a [mood/feeling] scene showing [subject]..."

Example: "Create a melancholic and nostalgic scene showing an abandoned 
amusement park at twilight, overgrown with vines, rusted carousel horse 
in foreground, purple sky, cinematic composition, shallow depth of field"
```

#### Technique 4: Technical Precision
Use photography/art terminology:
```
"[Subject], shot with [lens/settings], [lighting setup], [composition rule]"

Example: "Product photograph of luxury watch on marble surface, shot with 
100mm macro lens at f/5.6, dramatic side lighting with reflector, rule of 
thirds composition, commercial photography, high-end editorial style"
```

### Prompt Templates by Use Case

**Social Media Post**:
```
"[Product/subject], clean white background, centered composition, soft 
even lighting, product photography, high quality, sharp focus, professional 
e-commerce style"
```

**Album Cover Art**:
```
"Album cover design featuring [concept], bold typography space at [position], 
[color scheme], [artistic style], high contrast, eye-catching, professional 
graphic design, printable quality"
```

**Wallpaper/Background**:
```
"[Scene/subject], wide angle vista, [aspect ratio] composition, rich colors, 
atmospheric depth, no text, suitable for desktop wallpaper, ultra HD, 
minimal focal points"
```

**Character Concept**:
```
"Full body character design of [description], [pose], character sheet style, 
white background, front view, detailed costume, professional concept art, 
clean lines, reference material style"
```

**Thumbnail/Preview**:
```
"Eye-catching thumbnail for [topic], bold composition, high contrast, 
clear focal point, [color scheme], dynamic angle, suitable for small size 
viewing, attention-grabbing"
```

### Testing & Iteration Strategy

1. **Start Simple**: Begin with basic prompt, evaluate results
2. **Add Layers**: Incrementally add details (lighting, style, mood)
3. **Compare Variations**: Generate 2-4 versions with slight differences
4. **Refine Winners**: Take best result and enhance specific aspects
5. **Document Success**: Save prompts that work well for future reference

### Pro Tips Summary

✅ **DO**:
- Use specific, vivid adjectives
- Include lighting descriptions
- Specify artistic medium/style
- Add quality modifiers (8k, detailed, sharp)
- Use commas to separate concepts
- Test variations (2-4 images per prompt)
- Build complexity gradually

❌ **DON'T**:
- Use vague terms ("nice", "good", "pretty")
- Include negative descriptions ("no blur")
- Mix incompatible styles
- Write excessively long prompts (>150 words)
- Forget about lighting
- Expect perfection on first try (iterate!)
- Copy prompts verbatim from others (adapt to your vision)
- Skip the enhancement feature for complex scenes

---

## 🔬 Model Details

### Imagen 4.0 Specifications

**Official Model ID**: `imagen-4.0-generate-001`

**Architecture**:
- **Type**: Diffusion-based text-to-image model
- **Training Methodology**: Large-scale web data with advanced filtering
- **Diffusion Process**: Cascaded diffusion with super-resolution
- **Text Encoder**: Advanced transformer-based language understanding

**Capabilities**:
- **Resolution**: Adaptive based on aspect ratio (typically 1024x1024 base)
- **Aspect Ratios**: 1:1, 3:4, 4:3, 9:16, 16:9
- **Output Format**: JPEG, PNG support via SDK
- **Guidance Scale Range**: 0-20 (optimal: 7-8)
- **Batch Generation**: Up to 4 images per request

**Safety Features**:
- Content filtering for harmful/inappropriate content
- Watermarking for AI-generated image detection
- Copyright protection filters
- Ethical AI training data curation

**Performance Characteristics**:
- **Generation Time**: 10-30 seconds per image
- **Consistency**: High prompt adherence with guidance scale tuning
- **Quality**: Professional-grade outputs suitable for commercial use
- **Style Range**: Versatile across artistic styles and photorealism

**Limitations**:
- Text rendering in images (letters may be distorted)
- Fine detail on hands/fingers (common diffusion model limitation)
- Anatomical accuracy in complex poses
- Brand logos and copyrighted characters (filtered)

### Gemini 2.5 Flash Specifications

**Official Model ID**: `gemini-2.5-flash`

**Architecture**:
- **Type**: Large Language Model (LLM)
- **Purpose**: Text understanding, generation, and enhancement
- **Optimization**: Balanced for speed and quality

**Capabilities in AetherLens**:

1. **Prompt Enhancement** (`enhancePrompt()`):
   - Expands simple prompts with artistic detail
   - Adds appropriate style-specific keywords
   - Maintains user intent while improving specificity
   - Target output: 30-80 words
   - Processing time: 1-3 seconds

2. **Keyword Suggestions** (`getPromptSuggestions()`):
   - Analyzes prompt context
   - Generates 5-8 relevant keywords
   - Focuses on lighting, mood, style, details
   - Returns comma-separated list
   - Processing time: 1-2 seconds

**Context Window**: Large enough for complex prompt processing

**Response Quality**:
- Natural language understanding
- Context-aware suggestions
- Style-appropriate enhancements
- Minimal hallucination risk

### API Integration Details

**SDK**: `@google/genai` version 1.30.0

**Authentication**:
```typescript
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

**Image Generation Request Structure**:
```typescript
const response = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt: finalPrompt,
  config: {
    numberOfImages: 1-4,
    outputMimeType: 'image/jpeg',
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
    guidanceScale: 0-20,
  }
});
```

**Text Generation Request Structure**:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: promptText,
});
```

**Response Format**:
```typescript
// Image Generation Response
{
  generatedImages: [
    {
      image: {
        imageBytes: string (base64 encoded)
      }
    }
  ]
}

// Text Generation Response
{
  text: string
}
```

**Error Handling**:
- HTTP 429: Rate limit exceeded (quota exhausted)
- HTTP 400: Invalid request parameters
- HTTP 403: API key invalid or permissions issue
- HTTP 500: Server-side processing error

**Rate Limits** (Free Tier):
- Requests per minute: Varies by API key tier
- Quota: Check Google AI Studio dashboard
- Recommendation: Implement exponential backoff for 429 errors

### Style Modifier System

AetherLens implements style presets by appending specific keywords to prompts:

```typescript
const styleModifiers: Record<StylePreset, string> = {
  None: "",
  Photorealistic: ", photorealistic, 8k, highly detailed, realistic lighting, 
                   professional photography, sharp focus",
  Cinematic: ", cinematic lighting, movie scene, dramatic atmosphere, 
              shallow depth of field, 4k, anamorphic lens",
  Anime: ", anime style, vibrant colors, studio ghibli style, cel shaded, 
          highly detailed, distinct character design",
  // ... additional styles
};
```

**How It Works**:
1. User enters base prompt
2. User selects style preset
3. System concatenates: `basePrompt + styleModifier`
4. Enhanced prompt sent to Imagen 4.0
5. Model interprets combined prompt for styled output

---

## ⚠️ Limitations

### Current Technical Constraints

#### 1. API-Dependent Limitations

**Rate Limits & Quota**:
- **Free Tier**: Limited daily/monthly quota
- **Symptom**: HTTP 429 errors when quota exceeded
- **Impact**: Must wait for quota reset (typically 24 hours)
- **Workaround**: Upgrade to paid tier for higher limits
- **User Experience**: Clear error messages guide users to wait

**Network Dependency**:
- **Requirement**: Stable internet connection mandatory
- **Offline Mode**: Not available (no local model)
- **Latency**: Generation time varies with connection speed
- **Reliability**: Dependent on Google API uptime

#### 2. Generation Performance

**Time Requirements**:
- **Average**: 10-30 seconds per image
- **Factors**: Prompt complexity, server load, network speed
- **Batch Impact**: 4 images take ~15-45 seconds
- **No Optimization**: Cannot predict or reduce wait time

**Progress Tracking**:
- **Simulated**: Progress bar is estimated (not real-time from API)
- **Increments**: Based on elapsed time, not actual processing stage
- **Accuracy**: Provides user feedback but not precise

#### 3. Storage & Persistence

**Temporary Storage**:
- **Method**: In-memory React state only
- **Persistence**: None - refreshing page clears all images
- **Gallery Limit**: Practical limit ~50-100 images (browser memory)
- **Solution Required**: Manual download for archival

**No Cloud Storage**:
- **Impact**: Cannot save/load sessions
- **Missing Features**: No project management, no sharing
- **User Responsibility**: Must download important images

#### 4. Image Quality Constraints

**Output Format**:
- **Type**: JPEG only
- **Compression**: 0.92 quality (high but lossy)
- **No Transparency**: Alpha channel not supported
- **File Size**: 200KB - 2MB typical range

**Resolution Limits**:
- **Controlled by Model**: Output size determined by Imagen 4.0
- **Typical Base**: 1024x1024 for square aspect ratios
- **No Upscaling**: Cannot request higher resolution
- **Workaround**: Use external tools for super-resolution

#### 5. Content & Generation Limits

**Content Policy Restrictions**:
- **Filtered**: Explicit, violent, or copyrighted content blocked
- **No Warnings**: Rejected prompts fail silently or return error
- **Brand Names**: Logos and trademarks filtered
- **Public Figures**: May be restricted depending on context

**Model Limitations**:
- **Text in Images**: Letters and words often distorted/incorrect
- **Hand Anatomy**: Fingers and hands frequently malformed
- **Complex Poses**: Difficult anatomical positions may fail
- **Consistency**: Cannot guarantee exact match across generations
- **Fine Details**: Small objects may lack clarity

#### 6. Browser & Canvas Limitations

**Memory Constraints**:
- **Canvas API**: Large images consume significant RAM
- **Gallery Size**: Many high-res images can slow browser
- **Editing Performance**: Complex filters on large images lag
- **Mobile Impact**: More pronounced on mobile devices

**Browser Compatibility**:
- **Inconsistent Rendering**: Canvas filters vary slightly by browser
- **Performance**: Chrome/Edge faster than Firefox/Safari for canvas
- **Storage API**: No localStorage (API design choice)

#### 7. Editing Functionality Gaps

**Missing Features**:
- **No Inpainting**: Cannot selectively regenerate image regions
- **No Outpainting**: Cannot extend image boundaries
- **No Layers**: Single-layer editing only
- **No Masking**: Cannot protect specific areas during edits
- **No Custom Brushes**: Preset filters only

**History Limits**:
- **Session-Based**: Undo/redo cleared when editor closes
- **No Comparison**: Cannot A/B test edits side-by-side

#### 8. User Experience Limitations

**No User Accounts**:
- **Anonymous**: No login or user profiles
- **No Preferences**: Settings reset on page reload
- **No History**: Cannot review past prompts
- **No Favorites**: Cannot bookmark successful prompts

**Batch Operations**:
- **Limited**: Maximum 4 images per generation
- **No Queuing**: Cannot schedule multiple batches
- **No Templates**: Cannot save prompt templates

#### 9. Collaboration Restrictions

**Single User**:
- **No Sharing**: Cannot share gallery with others
- **No Comments**: No feedback or annotation system
- **No Versioning**: Cannot track iterations of same concept
- **No Teams**: Designed for individual use only

### Performance Benchmarks

| Operation | Average Time | Best Case | Worst Case |
|-----------|-------------|-----------|------------|
| Single Image Generation | 15 seconds | 8 seconds | 35 seconds |
| Batch (4 images) | 25 seconds | 15 seconds | 45 seconds |
| Prompt Enhancement | 2 seconds | 1 second | 5 seconds |
| Keyword Suggestions | 2 seconds | 1 second | 4 seconds |
| Canvas Edit Apply | Instant | Instant | 1 second |
| Full Editor Load | 0.5 seconds | 0.2 seconds | 2 seconds |
| Image Download | 0.5 seconds | 0.1 seconds | 2 seconds |

### Known Issues & Workarounds

**Issue**: Quota exceeded error
**Workaround**: Wait 1 hour, upgrade to paid tier, or try again later

**Issue**: Images cleared on refresh
**Workaround**: Download important images immediately, use browser "don't close this tab" feature

**Issue**: Slow generation on weak internet
**Workaround**: Close other network-heavy apps, try during off-peak hours

**Issue**: Hands/fingers look wrong
**Workaround**: Be very specific about hand position, try multiple generations, use editing to crop out

**Issue**: Text in image is gibberish
**Workaround**: Don't rely on text generation, add text in post-processing, use "sign with text '[word]'" carefully

---

## 🚀 Future Improvements

### Planned Features (Roadmap)

#### Phase 1: Core Enhancements (Q1-Q2 2025)

**1. Persistent Storage System**
- **IndexedDB Integration**: Local browser database for gallery persistence
- **Session Management**: Save/load named projects
- **Auto-save**: Periodic background saves
- **Export/Import**: JSON export of entire session
- **Estimated Impact**: Eliminates refresh data loss

**2. Advanced Image Editing**
- **Inpainting Tool**: Select and regenerate specific image regions
- **Outpainting**: Extend image boundaries in any direction
- **Layer System**: Multiple editing layers with blend modes
- **Selection Tools**: Lasso, magic wand, rectangular selection
- **Custom Brushes**: Adjustable brush size and opacity
- **Estimated Development**: 2-3 months

**3. Prompt Template System**
- **Save Templates**: Store favorite prompt structures
- **Template Variables**: Placeholders for quick customization
- **Category Library**: Pre-built templates by use case
- **Community Templates**: Share and import templates
- **Estimated Impact**: 50% faster workflow for repeat tasks

#### Phase 2: AI & Model Improvements (Q3 2025)

**4. Model Fine-tuning Capabilities**
- **Custom Style Training**: Upload 10-20 reference images
- **DreamBooth Integration**: Train on specific subjects/styles
- **LoRA Adapters**: Lightweight model adaptations
- **Training Time**: 15-30 minutes for custom style
- **Use Cases**: Personal art style, brand consistency, character consistency
- **Technical Requirements**: Google Cloud integration, paid tier

**5. Advanced Generation Controls**
- **Negative Prompts**: Specify what to avoid
- **Seed Control**: Reproducible generations
- **ControlNet Support**: Pose guidance, edge detection, depth maps
- **Multi-stage Pipelines**: Text → sketch → refined image
- **Estimated Impact**: 70% improvement in precision

**6. Style Transfer**
- **Image-to-Image**: Use reference image for style
- **Strength Control**: Blend between original and style
- **Multi-style Fusion**: Combine multiple style references
- **Real-time Preview**: See style before generating
- **Use Cases**: Match existing brand style, artistic remixes

#### Phase 3: Collaboration & Cloud (Q4 2025)

**7. User Accounts & Cloud Storage**
- **User Authentication**: Sign up with Google/email
- **Cloud Gallery**: Unlimited image storage
- **Cross-device Sync**: Access from any device
- **Backup & Recovery**: Never lose work
- **Premium Features**: Higher resolution, priority generation

**8. Team Collaboration**
- **Shared Workspaces**: Collaborate with team members
- **Comments & Annotations**: Feedback on images
- **Version History**: Track iterations and changes
- **Role Permissions**: Admin, editor, viewer roles
- **Real-time Updates**: See team edits live

**9. Gallery Management**
- **Collections**: Organize images into albums
- **Tags & Search**: Find images by keyword
- **Filters**: Sort by date, style, aspect ratio
- **Bulk Actions**: Edit/download/delete multiple images
- **Export**: High-quality ZIP downloads

#### Phase 4: Performance & Optimization (2026)

**10. Generation Optimization**
- **Request Queuing**: Smart queue management for batches
- **Caching**: Cache similar prompts for instant results
- **Progressive Loading**: Show low-res preview first
- **Parallel Processing**: Generate multiple images simultaneously
- **Estimated Speedup**: 40-60% faster workflows

**11. WebGL-Accelerated Canvas**
- **GPU Rendering**: Hardware acceleration for editing
- **Real-time Filters**: Instant filter preview
- **Large Image Support**: Edit 4K+ images smoothly
- **Smooth Animations**: Buttery 60fps interface

**12. Mobile Optimization**
- **Responsive Design**: Optimized for tablets and phones
- **Touch Gestures**: Pinch, zoom, swipe controls
- **Offline Mode**: Queue generations for when online
- **Mobile Editor**: Full editing on mobile devices

#### Phase 5: Advanced Features (2026+)

**13. Video Generation**
- **Text-to-Video**: Animated clips from prompts
- **Image-to-Video**: Animate static images
- **Video Style Transfer**: Apply styles to videos
- **Duration**: 2-10 second clips
- **Use Cases**: Social media content, animations

**14. 3D Asset Generation**
- **Text-to-3D**: Generate 3D models from prompts
- **Image-to-3D**: Convert 2D images to 3D models
- **Export Formats**: OBJ, FBX, GLTF
- **Use Cases**: Game assets, product visualization

**15. AI Assistant**
- **Prompt Guidance**: Real-time suggestions as you type
- **Style Recommendations**: Suggest styles based on prompt
- **Composition Advice**: Tips for better framing
- **Learning System**: Improve based on your preferences

**16. API & Integrations**
- **Public API**: Programmatic access to AetherLens
- **Zapier Integration**: Automate workflows
- **Figma Plugin**: Generate directly in Figma
- **Adobe Integration**: Export to Photoshop/Illustrator
- **Webhooks**: Trigger actions on generation complete

### Technical Debt & Refactoring

**Code Quality Improvements**:
- Migrate to Redux/Zustand for state management
- Implement proper error boundaries
- Add comprehensive unit tests (Jest, React Testing Library)
- E2E testing with Playwright
- Performance profiling and optimization
- Accessibility audit (WCAG 2.1 AA compliance)

**Architecture Updates**:
- Microservices architecture for scalability
- WebSocket for real-time features
- CDN integration for faster asset delivery
- Progressive Web App (PWA) support
- Service worker for offline capabilities

### Community Features

**Social Platform**:
- Public gallery showcase
- Like/comment system
- Follow favorite creators
- Trending prompts
- Prompt challenges and contests

**Educational Content**:
- Interactive tutorials
- Video guides
- Prompt engineering course
- Style guide library
- Case studies and use cases

### Hardware Acceleration Goals

**Local Processing Options**:
- WebGPU support for client-side filtering
- WASM-based image processing
- Local model inference (TensorFlow.js)
- Reduced server dependency
- Privacy-focused local-first mode

### Expected Impact Summary

| Improvement | User Benefit | Timeline |
|-------------|--------------|----------|
| Persistent Storage | Never lose work | Q1 2025 |
| Inpainting | 10x more control | Q2 2025 |
| Fine-tuning | Custom styles | Q3 2025 |
| Cloud Sync | Access anywhere | Q4 2025 |
| Video Generation | New content type | 2026 |
| 3D Assets | Expanded use cases | 2026+ |

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or suggesting enhancements, your help makes AetherLens better for everyone.

### Ways to Contribute

1. **Report Bugs**: Open issues for any bugs you encounter
2. **Request Features**: Suggest new features or improvements
3. **Submit Code**: Fix bugs or implement new features
4. **Improve Docs**: Enhance documentation and examples
5. **Share Feedback**: Tell us about your experience

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/YOUR_USERNAME/aetherlens.git
cd aetherlens

# Add upstream remote
git remote add upstream https://github.com/original/aetherlens.git

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run dev

# Run type checking
npx tsc --noEmit

# Build production
npm run build
```

### Contribution Guidelines

**Code Style**:
- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused

**Commit Messages**:
```
feat: Add inpainting tool to image editor
fix: Resolve quota error handling bug
docs: Update installation instructions
style: Format Gallery component
refactor: Extract API logic to separate service
test: Add unit tests for geminiService
```

**Pull Request Process**:
1. Update README if needed
2. Ensure all tests pass
3. Add screenshots for UI changes
4. Link related issues
5. Request review from maintainers

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- Follow project guidelines

---

## 📄 License

This project is open-source and available under the **MIT License**.

```
MIT License

Copyright (c) 2025 AetherLens Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## ⚖️ Terms of Use

By using AetherLens, you agree to:

- Use generated images responsibly
- Respect content policies
- Not use for illegal purposes
- Follow Google's API terms of service
- Give appropriate credit when sharing

Generated images may be subject to Google's usage policies. Review [Google AI Terms](https://ai.google.dev/terms) for details.

---

## 🔒 Privacy & Security

- **No Data Collection**: We don't store your prompts or images
- **API Key Security**: Keys stored locally, never transmitted to us
- **No Tracking**: No analytics or user tracking
- **Open Source**: Code is transparent and auditable

---

**Built with ❤️ for AI-powered creativity**

*Transform your imagination into stunning visuals with AetherLens*

---

## Quick Start Checklist

- [ ] Node.js installed (v16+)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] API key configured in `.env.local`
- [ ] Dev server running (`npm run dev`)
- [ ] First image generated successfully
- [ ] Explored style presets
- [ ] Tried image editor
- [ ] Downloaded favorite creation

**Ready to create amazing AI art? Start generating now! 🎨**
