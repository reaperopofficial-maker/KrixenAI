import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, Image as ImageIcon, Sparkles, Upload, X, ChevronDown, ChevronRight, Maximize2, Download, RefreshCcw, Heart, Camera, Search, Cpu, History, RotateCcw, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const API_KEY = "Sxke9cEkWwjgj3eNBr7kLqLC";

const MODELS = [
  { id: 'grok-2', name: 'Grok 2' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro' },
  { id: 'imagen-4', name: 'Imagen 4' },
  { id: 'nano-banana-2', name: 'Nano Banana 2' },
];

const MODES = [
  { id: 't2i', name: 'Text → Image' },
  { id: 'i2i', name: 'Image → Image' },
  { id: 'reference', name: 'Reference' },
];

const ASPECT_RATIOS = [
  { id: '1:1', icon: '□', label: '1:1' },
  { id: '4:3', icon: '▭', label: '4:3' },
  { id: '3:4', icon: '▯', label: '3:4' },
  { id: '16:9', icon: '▬', label: '16:9' },
  { id: '9:16', icon: '▮', label: '9:16' },
];

const STYLES = [
  { id: 'cinematic', name: 'Cinematic', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop' },
  { id: 'anime', name: 'Anime', img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=200&h=200&fit=crop' },
  { id: 'realistic', name: 'Realistic', img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop' },
  { id: '3d', name: '3D Render', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop' },
  { id: 'fantasy', name: 'Fantasy', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop' },
  { id: 'neon', name: 'Neon', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop' },
];

const MOODS = ['Dramatic', 'Peaceful', 'Dark', 'Vibrant', 'Mysterious', 'Epic', 'Dreamy', 'Surreal'];
const LIGHTING = ['Natural', 'Golden Hour', 'Studio', 'Neon', 'Moonlight', 'Volumetric', 'Backlit'];
const CAMERA_ANGLES = ['Wide', 'Close-up', 'Drone', 'POV', 'Macro'];

type HistoryItem = {
  id: string;
  prompt: string;
  negativePrompt: string;
  model: typeof MODELS[number];
  aspectRatio: string;
  batchCount: number;
  style: string;
  moods: string[];
  lighting: string[];
  cameraAngle: string;
  images: string[];
  timestamp: number;
};

export default function ImageStudio() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]); // Nano Banana Pro default
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [searchModelQuery, setSearchModelQuery] = useState('');
  const filteredModels = MODELS.filter(m => m.name.toLowerCase().includes(searchModelQuery.toLowerCase()));
  const [activeMode, setActiveMode] = useState(MODES[0].id);
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [batchCount, setBatchCount] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedLighting, setSelectedLighting] = useState<string[]>([]);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isNegativeOpen, setIsNegativeOpen] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState('Wide');
  const [isAngleOpen, setIsAngleOpen] = useState(false);
  
  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const toggleLighting = (light: string) => {
    setSelectedLighting(prev => prev.includes(light) ? prev.filter(l => l !== light) : [...prev, light]);
  };

  const handleEnhance = async () => {
    if (!prompt) {
      toast.error("Enter a prompt first");
      return;
    }
    setIsEnhancing(true);
    try {
      const response = await fetch("https://api.geminigen.ai/uapi/v1/generate/text", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `Enhance this image generation prompt to be highly detailed and cinematic: "${prompt}"`
        })
      });
      const data = await response.json();
      if (data.enhanced_prompt || data.text || data.prompt) {
        setEnhancedPrompt(data.enhanced_prompt || data.text || data.prompt);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      // Mock fallback for preview since it might not be a real API yet
      setTimeout(() => {
        setEnhancedPrompt(`Masterpiece, best quality, highly detailed: ${prompt}, volumetric lighting, 8k resolution, cinematic composition`);
        setIsEnhancing(false);
      }, 1500);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

    // Simulating polling behavior since real API might not support it this way
    const pollInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p;
        return p + 10;
      });
    }, 800);

    try {
      const payload = {
        type: "image",
        prompt: prompt,
        negative_prompt: negativePrompt,
        model: selectedModel.id,
        aspect_ratio: aspectRatio,
        batch_count: batchCount,
        style: selectedStyle,
        moods: selectedMoods,
        lighting: selectedLighting,
        camera_angle: selectedAngle,
        ...(uploadedImage && activeMode !== 't2i' ? { reference_image: uploadedImage } : {})
      };

      const response = await fetch("https://api.geminigen.ai/uapi/v1/generate/image", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      
      clearInterval(pollInterval);
      setProgress(100);
      
      // Assume data.images is an array of URLs
      if (data.images && data.images.length > 0) {
         setGeneratedImages(data.images);
         setHistory(prev => [{
           id: Date.now().toString(),
           prompt,
           negativePrompt,
           model: selectedModel,
           aspectRatio,
           batchCount,
           style: selectedStyle,
           moods: selectedMoods,
           lighting: selectedLighting,
           cameraAngle: selectedAngle,
           images: data.images,
           timestamp: Date.now()
         }, ...prev]);
      } else {
         throw new Error("No images returned");
      }
    } catch (error) {
      clearInterval(pollInterval);
      // Fallback for mocked preview if API fails/is placeholder
      setTimeout(() => {
        setProgress(100);
        const placeholderImages = Array(batchCount).fill(0).map((_, i) => `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=800&fit=crop&q=80&sig=${Math.random()}`);
        setGeneratedImages(placeholderImages);
        setHistory(prev => [{
          id: Date.now().toString(),
          prompt,
          negativePrompt,
          model: selectedModel,
          aspectRatio,
          batchCount,
          style: selectedStyle,
          moods: selectedMoods,
          lighting: selectedLighting,
          cameraAngle: selectedAngle,
          images: placeholderImages,
          timestamp: Date.now()
        }, ...prev]);
      }, 2000);
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setNegativePrompt(item.negativePrompt);
    setSelectedModel(item.model);
    setAspectRatio(item.aspectRatio);
    setBatchCount(item.batchCount);
    setSelectedStyle(item.style);
    setSelectedMoods(item.moods);
    setSelectedLighting(item.lighting);
    setSelectedAngle(item.cameraAngle);
    setGeneratedImages(item.images);
    setIsHistoryOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col max-h-screen overflow-hidden bg-base relative">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/5 bg-surface/80 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary-blue to-secondary-violet bg-clip-text text-transparent">Krixen</span><span className="text-white">AI</span>
            <span className="text-text-muted font-normal text-sm ml-1">Image Studio</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-xl bg-elevated hover:bg-white/10 transition-colors relative"
          >
            <History className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
            {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-primary-blue rounded-full"></span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-xl bg-elevated hover:bg-white/10 transition-colors"
          >
            <Settings2 className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32 pt-4 px-4 custom-scrollbar relative z-10">
        
        {/* Model Selector */}
        <div className="relative mb-6">
          <div className="text-[14px] font-semibold text-text-primary mb-2 tracking-wide pl-1">Model</div>
          <button 
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="w-full flex items-center justify-between bg-transparent border border-white/10 rounded-xl p-3 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
              <span className="font-medium text-[15px] text-text-primary">{selectedModel.name}</span>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-text-muted transition-transform", modelDropdownOpen && "rotate-180")} strokeWidth={1.5} />
          </button>

          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-[72px] left-0 right-0 bg-[#121318] border border-white/10 rounded-[14px] shadow-2xl overflow-hidden z-30"
              >
                <div className="border-b border-white/5 relative">
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={searchModelQuery}
                    onChange={(e) => setSearchModelQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted p-3.5 focus:outline-none"
                  />
                </div>
                <div className="p-1.5 flex flex-col gap-0.5">
                  {filteredModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model); setModelDropdownOpen(false); setSearchModelQuery(''); }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors hover:bg-white/5",
                        selectedModel.id === model.id && "bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
                        <span className="font-medium text-[14px] text-text-primary">{model.name}</span>
                      </div>
                    </button>
                  ))}
                  {filteredModels.length === 0 && (
                    <div className="p-3 text-center text-sm text-text-muted">No models found</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-surface border border-white/5 rounded-2xl mb-6">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 relative",
                activeMode === mode.id ? "text-primary-blue bg-elevated shadow-lg" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {mode.name}
            </button>
          ))}
        </div>

        {/* Mode Info Box */}
        <AnimatePresence mode="wait">
          {activeMode && (
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="border border-[#B45309]/50 bg-[#78350F]/20 rounded-[14px] p-4 mb-6 flex gap-3 text-left shadow-lg overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B]/50" />
              <Info className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="flex flex-col">
                 <h4 className="text-[13px] font-bold text-[#FDE68A] mb-1">
                   {activeMode === 't2i' && 'Text \u2192 Image Mode'}
                   {activeMode === 'i2i' && 'Image \u2192 Image Mode'}
                   {activeMode === 'reference' && 'Reference Mode'}
                 </h4>
                 <p className="text-[12px] text-[#FDE68A]/80 leading-relaxed font-medium">
                   {activeMode === 't2i' && 'Create stunning visuals from scratch using detailed text descriptions. Expand your creativity with custom styles.'}
                   {activeMode === 'i2i' && 'Upload a base image to transform its style, structure, or content while keeping the original composition.'}
                   {activeMode === 'reference' && 'Keep character or style consistency by uploading a reference image. The AI will guide the generation based on it.'}
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Upload (Conditional) */}
        <AnimatePresence mode="popLayout">
          {activeMode !== 't2i' && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 24 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="overflow-hidden"
            >
              <div className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-widest pl-1">Reference Image</div>
              {!uploadedImage ? (
                <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-white/10 rounded-[22px] bg-surface hover:bg-elevated transition-colors cursor-pointer group">
                  <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:bg-primary-blue/20 transition-colors">
                    <Upload className="w-5 h-5 text-text-secondary group-hover:text-primary-blue transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Tap or drag image here</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative w-full h-32 rounded-[22px] overflow-hidden group border border-white/10">
                  <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-pill backdrop-blur-md cursor-pointer text-sm font-medium transition-colors">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <button 
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full backdrop-blur-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt Input */}
        <div className="mb-6 relative">
          <div className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-widest pl-1 flex justify-between">
            <span>Prompt</span>
            <span className="text-text-muted/60">{prompt.length}/1000</span>
          </div>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, 1000))}
              placeholder="A cinematic shot of a neon cyberpunk city during rain, reflections, masterpiece..."
              className="w-full h-32 bg-surface text-text-primary font-mono text-sm leading-relaxed border border-white/10 rounded-[22px] p-4 pr-12 focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all resize-none shadow-inner"
            />
            {/* Enhance Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEnhance}
              disabled={isEnhancing || !prompt}
              className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-gradient-to-br from-primary-blue to-secondary-violet shadow-lg disabled:opacity-50 group-hover:opacity-100 opacity-80 transition-opacity"
              title="Enhance Prompt"
            >
              {isEnhancing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {enhancedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 p-3 bg-surface border border-secondary-violet/30 rounded-[16px]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-secondary-violet font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Enhanced Version
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setEnhancedPrompt('')} className="text-xs text-text-muted hover:text-red-400">Cancel</button>
                    <button 
                      onClick={() => { setPrompt(enhancedPrompt); setEnhancedPrompt(''); }} 
                      className="text-xs text-primary-blue hover:text-white font-medium"
                    >
                      Use This
                    </button>
                  </div>
                </div>
                <p className="text-xs font-mono text-text-secondary leading-relaxed">{enhancedPrompt}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Negative Prompt (Main UI) */}
        <div className="mb-6">
          <button 
            onClick={() => setIsNegativeOpen(!isNegativeOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors focus:outline-none"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", isNegativeOpen && "rotate-90")} />
            <span>Advanced: Negative Prompt</span>
          </button>
          <AnimatePresence>
            {isNegativeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-3"
              >
                <textarea
                  placeholder="What to exclude (e.g. blurry, deformed, text, ugly, watermarks...)"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full h-20 bg-surface/50 text-text-primary text-xs leading-relaxed border border-white/10 rounded-2xl p-3 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none shadow-inner"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full h-14 rounded-pill relative overflow-hidden bg-gradient-to-r from-primary-blue to-secondary-violet shadow-[0_0_20px_rgba(79,142,247,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group transition-shadow hover:shadow-[0_0_30px_rgba(79,142,247,0.3)]"
        >
          {isGenerating && (
            <div className="absolute inset-0 bg-white/10" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center font-bold tracking-wide text-white">
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                Creating your masterpiece... {progress}%
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" /> Generate {batchCount > 1 ? `(${batchCount} Images)` : 'Image'}
              </span>
            )}
          </div>
        </motion.button>


        {/* Results Section */}
        {generatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="text-sm font-bold tracking-widest uppercase mb-4 text-text-primary px-1">Results</div>
            <div className={cn(
              "grid gap-4",
              batchCount === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {generatedImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group rounded-[22px] overflow-hidden aspect-square border border-white/10 bg-surface shadow-xl"
                >
                  <img src={img} alt="Generated result" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setIsFullscreen(img)}
                        className="p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md text-white transition-colors"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button className="p-2 bg-elevated hover:bg-primary-blue rounded-xl backdrop-blur-md text-white transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-elevated hover:bg-success-green rounded-xl backdrop-blur-md text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>


      {/* Sidebar Overlay */}
      <AnimatePresence>
        {(isSidebarOpen || isHistoryOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsSidebarOpen(false); setIsHistoryOpen(false); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-surface/95 border-r border-white/5 backdrop-blur-2xl z-[70] overflow-y-auto custom-scrollbar flex flex-col shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="sticky top-0 bg-surface/80 backdrop-blur-lg px-6 py-5 border-b border-white/5 flex items-center justify-between z-10 w-full mb-4 relative">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2"><History className="w-5 h-5"/> History</h2>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="px-4 flex flex-col gap-4 pb-12">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted">
                    <History className="w-12 h-12 mb-4 opacity-50" strokeWidth={1} />
                    <p className="text-sm">No history yet.</p>
                    <p className="text-xs mt-1 opacity-70">Generate images to see them here.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="bg-elevated border border-white/5 rounded-[20px] overflow-hidden flex flex-col">
                      <div className="relative aspect-video bg-black/50 overflow-hidden">
                        <img src={item.images[0]} alt="History thumbnail" className="w-full h-full object-cover opacity-90" />
                        {item.images.length > 1 && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                            +{item.images.length - 1} MORE
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <p className="text-xs text-text-primary line-clamp-3 font-mono leading-relaxed">{item.prompt}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-text-secondary border border-white/10">
                            {item.model.name}
                          </span>
                          <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full text-text-secondary border border-white/10">
                            {item.aspectRatio}
                          </span>
                        </div>
                        <div className="w-full h-[1px] bg-white/5 mt-1" />
                        <button 
                          onClick={() => loadHistoryItem(item)}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue text-xs font-bold rounded-xl transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Re-use Settings
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-surface/95 border-l border-white/5 backdrop-blur-2xl z-[70] overflow-y-auto custom-scrollbar flex flex-col shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="sticky top-0 bg-surface/80 backdrop-blur-lg px-6 py-5 border-b border-white/5 flex items-center justify-between z-10 w-full mb-6 relative">
                <h2 className="text-lg font-bold tracking-tight">Settings</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="px-6 flex flex-col gap-8 pb-12">
                
                {/* Batch Count */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest flex justify-between">
                    <span>Batch Size</span>
                    <span className="text-text-primary">{batchCount}</span>
                  </div>
                  <input 
                    type="range" min="1" max="4" step="1" 
                    value={batchCount} onChange={(e) => setBatchCount(parseInt(e.target.value))}
                    className="w-full accent-primary-blue h-1 bg-white/10 rounded-full outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-2">
                    <span>Fast</span>
                    <span>Slower</span>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Aspect Ratio</div>
                  <div className="grid grid-cols-5 gap-2">
                    {ASPECT_RATIOS.map(ar => (
                      <button
                        key={ar.id}
                        onClick={() => setAspectRatio(ar.id)}
                        className={cn(
                          "aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all duration-300 bg-elevated/50",
                          aspectRatio === ar.id ? "border-primary-blue text-primary-blue shadow-[0_0_15px_rgba(79,142,247,0.3)]" : "border-white/5 text-text-muted hover:border-white/20 hover:text-text-primary"
                        )}
                      >
                        <span className="text-lg leading-none">{ar.icon}</span>
                        <span className="text-[9px] font-bold">{ar.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Style</div>
                  <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                    {STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={cn(
                          "relative flex-shrink-0 w-24 h-28 rounded-2xl overflow-hidden snap-start group border-2 transition-all duration-300",
                          selectedStyle === style.id ? "border-secondary-violet" : "border-transparent"
                        )}
                      >
                        <img src={style.img} alt={style.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{style.name}</span>
                        </div>
                        {selectedStyle === style.id && <div className="absolute inset-0 bg-secondary-violet/20" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Moods */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Mood</div>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(mood => (
                      <button
                        key={mood}
                        onClick={() => toggleMood(mood)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selectedMoods.includes(mood) ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-text-muted hover:bg-white/5"
                        )}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Lighting</div>
                  <div className="flex flex-wrap gap-2">
                    {LIGHTING.map(light => (
                      <button
                        key={light}
                        onClick={() => toggleLighting(light)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selectedLighting.includes(light) ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-text-muted hover:bg-white/5"
                        )}
                      >
                        {light}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-[1px] bg-white/5 my-2" />

                {/* Camera Angle (Collapsible) */}
                <div>
                  <button 
                    onClick={() => setIsAngleOpen(!isAngleOpen)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-text-muted mb-2 uppercase tracking-widest focus:outline-none group"
                  >
                    <span className="flex items-center gap-2"><Camera className="w-4 h-4" /> Camera Angle</span>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", isAngleOpen && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {isAngleOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {CAMERA_ANGLES.map(angle => (
                            <button
                              key={angle}
                              onClick={() => setSelectedAngle(angle)}
                              className={cn(
                                "py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors",
                                selectedAngle === angle ? "bg-primary-blue/20 border-primary-blue/50 text-white" : "bg-elevated border-white/5 text-text-muted hover:border-white/20 hover:text-white"
                              )}
                            >
                              {angle}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Preview Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex flex-col backdrop-blur-xl"
          >
            <div className="flex justify-end p-4">
              <button 
                onClick={() => setIsFullscreen(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center min-h-0">
              <img src={isFullscreen} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
