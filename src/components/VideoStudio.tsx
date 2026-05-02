import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, Sparkles, Upload, X, ChevronDown, ChevronRight, Maximize2, Download, RefreshCcw, Heart, Camera, Search, Cpu, History, RotateCcw, Clapperboard, MonitorPlay, Video, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { saveToLibrary } from '../lib/library';

const API_KEY = "Sxke9cEkWwjgj3eNBr7kLqLC";

const MODELS = [
  { id: 'grok-2-video', name: 'Grok 2 Video' },
  { id: 'veo-3-1-fast', name: 'Veo 3.1 Fast' },
  { id: 'veo-3-1-lite', name: 'Veo 3.1 Lite' },
  { id: 'veo-3-1', name: 'Veo 3.1' },
  { id: 'veo-2', name: 'Veo 2' },
];

const MODES = [
  { id: 't2v', name: 'Text → Video' },
  { id: 'i2v', name: 'Image → Video' },
  { id: 'v2v', name: 'Video → Video' },
  { id: 'first-last', name: 'First + Last Frame' },
  { id: 'extend', name: 'Extend Video' },
];

const ASPECT_RATIOS = [
  { id: '1:1', icon: '□', label: '1:1' },
  { id: '16:9', icon: '▬', label: '16:9' },
  { id: '9:16', icon: '▮', label: '9:16' },
];

const STYLES = [
  { id: 'cinematic', name: 'Cinematic', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop' },
  { id: 'anime', name: 'Anime', img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=200&h=200&fit=crop' },
  { id: 'documentary', name: 'Documentary', img: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=200&h=200&fit=crop' },
  { id: 'slow-motion', name: 'Slow motion', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop' },
  { id: 'dreamlike', name: 'Dreamlike', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop' },
  { id: 'music-video', name: 'Music video', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop' },
];

const CAMERA_MOTIONS = ['Pan', 'Tilt', 'Zoom', 'Drone', 'Orbit', 'Tracking'];
const RESOLUTIONS = ['720p', '1080p', '4K'];
const DURATIONS = [2, 4, 8, 16];

const EFFECTS = [
  { id: 'rain', label: 'Rain / Snow' },
  { id: 'particles', label: 'Particles' },
  { id: 'fire', label: 'Fire / Smoke' },
  { id: 'light', label: 'Light Rays' },
  { id: 'glitch', label: 'Glitch' },
];

export default function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]); // Grok 2 Video
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [searchModelQuery, setSearchModelQuery] = useState('');
  const filteredModels = MODELS.filter(m => m.name.toLowerCase().includes(searchModelQuery.toLowerCase()));
  const [activeMode, setActiveMode] = useState(MODES[0].id);

  // Upload state
  const [uploadedImage1, setUploadedImage1] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [duration, setDuration] = useState(4);
  const [motionStrength, setMotionStrength] = useState(50);
  
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedMotion, setSelectedMotion] = useState('Pan');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isNegativeOpen, setIsNegativeOpen] = useState(false);

  // History state
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
    }
  };

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]);
  };

  const handleEnhance = async () => {
    if (!prompt) {
      toast.error("Enter a prompt first");
      return;
    }
    setIsEnhancing(true);
    setTimeout(() => {
      setEnhancedPrompt(`Cinematic sequence, 35mm lens: ${prompt}, volumetric lighting, 8k resolution, photorealistic, intricate detail, slow continuous drone movement`);
      setIsEnhancing(false);
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setProgress(0);
    setGeneratedVideo(null);
    setGenerationStage('Preparing scene...');

    let p = 0;
    const stages = ['Preparing scene...', 'Generating frames...', 'Rendering video...', 'Finalizing...'];
    
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      
      if (p < 25) setGenerationStage(stages[0]);
      else if (p < 70) setGenerationStage(stages[1]);
      else if (p < 90) setGenerationStage(stages[2]);
      else setGenerationStage(stages[3]);

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setGeneratedVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
          setIsGenerating(false);
          setHistory(prev => {
            const newItem = {
              id: Date.now().toString(),
              prompt,
              negativePrompt,
              mode: activeMode,
              model: selectedModel,
              duration,
              video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
              timestamp: Date.now()
            };
            saveToLibrary('videos', { ...newItem, url: newItem.video });
            return [newItem, ...prev];
          });
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col max-h-screen overflow-hidden bg-base relative">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-inverted/5 bg-surface/80 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary-blue to-secondary-violet bg-clip-text text-transparent">Krixen</span><span className="text-white">AI</span>
            <span className="text-text-muted font-normal text-sm ml-1">Video Studio</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 rounded-xl bg-elevated hover:bg-inverted/10 transition-colors relative"
          >
            <History className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
            {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-violet rounded-full"></span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-xl bg-elevated hover:bg-inverted/10 transition-colors"
          >
            <Settings2 className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32 pt-4 px-4 custom-scrollbar relative z-10">
        
        {/* Mode Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar snap-x">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => { setActiveMode(mode.id); setUploadedImage1(null); setUploadedImage2(null); setUploadedVideo(null); }}
              className={cn(
                "flex-shrink-0 whitespace-nowrap py-2.5 px-4 text-xs font-semibold rounded-xl transition-all duration-300 relative snap-start",
                activeMode === mode.id ? "text-white bg-secondary-violet shadow-[0_0_15px_rgba(124,92,246,0.3)] border border-secondary-violet/50" : "text-text-secondary bg-surface border border-inverted/5 hover:border-inverted/10 hover:text-text-primary"
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
                   {activeMode === 't2v' && 'Text \u2192 Video Mode'}
                   {activeMode === 'i2v' && 'Image \u2192 Video Mode'}
                   {activeMode === 'v2v' && 'Video \u2192 Video Mode'}
                   {activeMode === 'first-last' && 'First + Last Frame Mode'}
                   {activeMode === 'extend' && 'Video Extend Mode'}
                 </h4>
                 <p className="text-[12px] text-[#FDE68A]/80 leading-relaxed font-medium">
                   {activeMode === 't2v' && 'Generate high-quality cinematic videos from purely text descriptions. Be as detailed as possible for the best results.'}
                   {activeMode === 'i2v' && 'Bring your still images to life. Upload a starting image and describe how you want it to animate.'}
                   {activeMode === 'v2v' && 'Transform the style or subject of an existing video. Upload a base video and describe the desired changes.'}
                   {activeMode === 'first-last' && 'Create a seamless transition between two given frames. The AI interpolates the motion automatically.'}
                   {activeMode === 'extend' && 'Model, Aspect Ratio, and Resolution settings will be automatically set based on your selected video and cannot be modified.'}
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Model Selector */}
        <div className="relative mb-6">
          <div className="text-[14px] font-semibold text-text-primary mb-2 tracking-wide pl-1">Video Model</div>
          <button 
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="w-full flex items-center justify-between bg-transparent border border-inverted/10 rounded-xl p-3 hover:border-inverted/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
              <span className="font-medium text-[15px] text-text-primary">{selectedModel.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown className={cn("w-5 h-5 text-text-muted transition-transform", modelDropdownOpen && "rotate-180")} strokeWidth={1.5} />
            </div>
          </button>

          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-[72px] left-0 right-0 bg-[#121318] border border-inverted/10 rounded-[14px] shadow-2xl overflow-hidden z-30"
              >
                <div className="border-b border-inverted/5 relative">
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={searchModelQuery}
                    onChange={(e) => setSearchModelQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted p-3.5 focus:outline-none"
                  />
                </div>
                <div className="p-1.5 flex flex-col gap-0.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                  {filteredModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model); setModelDropdownOpen(false); setSearchModelQuery(''); }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors hover:bg-inverted/5",
                        selectedModel.id === model.id && "bg-inverted/5"
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

        {/* Smart Upload System */}
        <AnimatePresence mode="popLayout">
          {activeMode !== 't2v' && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 24 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="overflow-hidden"
            >
              <div className="text-[14px] font-semibold text-text-primary mb-2 tracking-wide pl-1">Input Assets</div>
              
              <div className={cn("grid gap-3", activeMode === 'first-last' ? "grid-cols-2" : "grid-cols-1")}>
                
                {(activeMode === 'i2v' || activeMode === 'first-last') && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-muted mb-1 ml-1">{activeMode === 'first-last' ? 'First Frame' : 'Start Image'}</span>
                    {!uploadedImage1 ? (
                      <label className="flex flex-col items-center justify-center h-28 w-full border-2 border-dashed border-inverted/10 rounded-[22px] bg-surface hover:bg-elevated transition-colors cursor-pointer group">
                        <Upload className="w-5 h-5 text-text-secondary group-hover:text-secondary-violet transition-colors mb-2" />
                        <span className="text-xs font-medium text-text-secondary">Upload Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setUploadedImage1)} />
                      </label>
                    ) : (
                      <div className="relative w-full h-28 rounded-[22px] overflow-hidden group border border-inverted/10">
                        <img src={uploadedImage1} alt="Reference" className="w-full h-full object-cover" />
                        <button onClick={() => setUploadedImage1(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full backdrop-blur-md text-inverted"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                )}

                {activeMode === 'first-last' && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-muted mb-1 ml-1">Last Frame</span>
                    {!uploadedImage2 ? (
                      <label className="flex flex-col items-center justify-center h-28 w-full border-2 border-dashed border-inverted/10 rounded-[22px] bg-surface hover:bg-elevated transition-colors cursor-pointer group">
                        <Upload className="w-5 h-5 text-text-secondary group-hover:text-secondary-violet transition-colors mb-2" />
                        <span className="text-xs font-medium text-text-secondary">Upload Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setUploadedImage2)} />
                      </label>
                    ) : (
                      <div className="relative w-full h-28 rounded-[22px] overflow-hidden group border border-inverted/10">
                        <img src={uploadedImage2} alt="Reference" className="w-full h-full object-cover" />
                        <button onClick={() => setUploadedImage2(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full backdrop-blur-md text-inverted"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                )}

                {(activeMode === 'v2v' || activeMode === 'extend') && (
                  <div className="flex flex-col">
                    {!uploadedVideo ? (
                      <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-inverted/10 rounded-[22px] bg-surface hover:bg-elevated transition-colors cursor-pointer group">
                        <Video className="w-6 h-6 text-text-secondary group-hover:text-secondary-violet transition-colors mb-2" />
                        <span className="text-xs font-medium text-text-secondary">Upload Base Video (.mp4, .mov)</span>
                        <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                      </label>
                    ) : (
                      <div className="relative w-full h-32 rounded-[22px] overflow-hidden group border border-inverted/10 bg-black">
                        <video src={uploadedVideo} className="w-full h-full object-cover" />
                        <button onClick={() => setUploadedVideo(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full backdrop-blur-md text-inverted"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt Input */}
        <div className="mb-6 relative">
          <div className="text-[14px] font-semibold text-text-primary mb-2 tracking-wide pl-1 flex justify-between">
            <span>Video Prompt</span>
            <span className="text-text-muted/60 text-xs">{prompt.length}/1000</span>
          </div>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, 1000))}
              placeholder="Cinematic drone shot flying over a neon-lit futuristic city, heavy rain, reflections on metallic surfaces..."
              className="w-full h-32 bg-surface text-text-primary font-mono text-sm leading-relaxed border border-inverted/10 rounded-[22px] p-4 pr-12 focus:outline-none focus:border-secondary-violet/50 focus:ring-1 focus:ring-secondary-violet/50 transition-all resize-none shadow-inner"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEnhance}
              disabled={isEnhancing || !prompt}
              className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-gradient-to-br from-secondary-violet to-primary-blue shadow-lg disabled:opacity-50 group-hover:opacity-100 opacity-80 transition-opacity"
              title="Enhance Prompt"
            >
              {isEnhancing ? (
                <div className="w-4 h-4 border-2 border-inverted/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-inverted" />
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
                      className="text-xs text-secondary-violet hover:text-inverted font-medium"
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
                  className="w-full h-20 bg-surface/50 text-text-primary text-xs leading-relaxed border border-inverted/10 rounded-2xl p-3 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none shadow-inner"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Generate Button */}
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full h-14 rounded-pill relative overflow-hidden bg-gradient-to-r from-secondary-violet to-primary-blue shadow-[0_0_20px_rgba(124,92,246,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group transition-shadow hover:shadow-[0_0_30px_rgba(124,92,246,0.3)]"
          >
            {isGenerating && (
              <div className="absolute inset-0 bg-inverted/10" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
            )}
            <div className="absolute inset-0 flex items-center justify-center font-bold tracking-wide text-inverted">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  {generationStage} {progress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MonitorPlay className="w-5 h-5" /> Generate Video
                </span>
              )}
            </div>
          </motion.button>
        </div>

        {/* Results Section */}
        {generatedVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="text-sm font-bold tracking-widest uppercase mb-4 text-text-primary px-1">Your Video</div>
            <div className="relative group rounded-[22px] overflow-hidden aspect-video border border-inverted/10 bg-surface shadow-xl flex items-center justify-center">
               <video 
                 src={generatedVideo}
                 controls
                 autoPlay
                 loop
                 className="w-full h-full object-cover"
               />
               
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-lg backdrop-blur-md text-inverted text-xs font-medium border border-inverted/10 transition-colors">
                      Extract Frame
                    </button>
                    <button className="px-3 py-1.5 bg-black/40 hover:bg-black/60 rounded-lg backdrop-blur-md text-inverted text-xs font-medium border border-inverted/10 transition-colors">
                      Extend
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-elevated hover:bg-secondary-violet rounded-xl backdrop-blur-md text-inverted hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Overlays */}
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

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-surface/95 border-l border-inverted/5 backdrop-blur-2xl z-[70] overflow-y-auto custom-scrollbar flex flex-col shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="sticky top-0 bg-surface/80 backdrop-blur-lg px-6 py-5 border-b border-inverted/5 flex items-center justify-between z-10 w-full mb-6 relative">
                <h2 className="text-lg font-bold tracking-tight">Video Settings</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-inverted/10 transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="px-6 flex flex-col gap-8 pb-12">
                
                {/* Duration */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest flex justify-between">
                    <span>Duration</span>
                    <span className="text-text-primary">{duration}s</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border",
                          duration === d ? "bg-secondary-violet/20 border-secondary-violet text-secondary-violet" : "bg-elevated border-inverted/5 text-text-muted hover:text-text-primary hover:border-inverted/20"
                        )}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Resolution</div>
                  <div className="grid grid-cols-3 gap-2">
                    {RESOLUTIONS.map(res => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border",
                          resolution === res ? "bg-secondary-violet/20 border-secondary-violet text-secondary-violet" : "bg-elevated border-inverted/5 text-text-muted hover:text-text-primary hover:border-inverted/20"
                        )}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Ratio</div>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map(ar => (
                      <button
                        key={ar.id}
                        onClick={() => setAspectRatio(ar.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border transition-all duration-300",
                          aspectRatio === ar.id ? "bg-secondary-violet/10 border-secondary-violet text-secondary-violet shadow-[0_0_15px_rgba(124,92,246,0.2)]" : "bg-elevated border-inverted/5 text-text-muted hover:border-inverted/20 hover:text-text-primary"
                        )}
                      >
                        <span className="text-xl leading-none">{ar.icon}</span>
                        <span className="text-[10px] font-bold">{ar.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motion Strength */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest flex justify-between">
                    <span>Motion Strength</span>
                    <span className="text-text-primary">{motionStrength}</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" step="1" 
                    value={motionStrength} onChange={(e) => setMotionStrength(parseInt(e.target.value))}
                    className="w-full accent-secondary-violet h-1.5 bg-inverted/10 rounded-full outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-2">
                    <span>Subtle</span>
                    <span>Dynamic</span>
                  </div>
                </div>

                {/* Camera Motion */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Camera Motion</div>
                  <div className="flex flex-wrap gap-2">
                    {CAMERA_MOTIONS.map(motion => (
                      <button
                        key={motion}
                        onClick={() => setSelectedMotion(motion)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selectedMotion === motion ? "bg-inverted/10 border-inverted/20 text-inverted" : "border-inverted/5 text-text-muted hover:bg-inverted/5"
                        )}
                      >
                        {motion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Style Direction</div>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={cn(
                          "relative w-full h-16 rounded-xl overflow-hidden group border-2 transition-all duration-300",
                          selectedStyle === style.id ? "border-secondary-violet" : "border-transparent"
                        )}
                      >
                        <img src={style.img} alt={style.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-inverted uppercase tracking-wider">{style.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effects */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Effects Switch</div>
                  <div className="flex flex-col gap-2">
                    {EFFECTS.map(effect => (
                      <button
                        key={effect.id}
                        onClick={() => toggleEffect(effect.id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-elevated border border-inverted/5 transition-colors hover:border-inverted/10"
                      >
                        <span className="text-sm font-medium text-text-primary">{effect.label}</span>
                        <div className={cn(
                          "w-10 h-5 rounded-full relative transition-colors duration-300",
                          selectedEffects.includes(effect.id) ? "bg-secondary-violet" : "bg-inverted/10"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow",
                            selectedEffects.includes(effect.id) ? "left-[22px]" : "left-0.5"
                          )} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
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
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-surface/95 border-r border-inverted/5 backdrop-blur-2xl z-[70] overflow-y-auto custom-scrollbar flex flex-col shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="sticky top-0 bg-surface/80 backdrop-blur-lg px-6 py-5 border-b border-inverted/5 flex items-center justify-between z-10 w-full mb-4 relative">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2"><History className="w-5 h-5"/> History</h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-inverted/10 transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="px-4 flex flex-col gap-4 pb-12">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted">
                    <History className="w-12 h-12 mb-4 opacity-50" strokeWidth={1} />
                    <p className="text-sm">No history yet.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="bg-elevated border border-inverted/5 rounded-[20px] overflow-hidden flex flex-col">
                      <div className="relative aspect-video bg-black/50 overflow-hidden">
                        <video src={item.video} className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-[10px] uppercase font-bold text-inverted bg-black/50 px-2 py-1 rounded w-fit backdrop-blur">{item.duration}s</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <p className="text-xs text-text-primary line-clamp-3 font-mono leading-relaxed">{item.prompt}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] px-2 py-1 bg-inverted/5 rounded-full text-text-secondary border border-inverted/10">{item.model.name}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
