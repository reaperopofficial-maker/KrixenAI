import { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, Sparkles, Upload, X, ChevronDown, ChevronRight, Maximize2, Download, RefreshCcw, Heart, Mic, FileText, MessageSquareMore, Play, Pause, GripVertical, Plus, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { saveToLibrary } from '../lib/library';

const API_KEY = "Sxke9cEkWwjgj3eNBr7kLqLC";

const MODES = [
  { id: 'tts', name: 'Text to Speech' },
  { id: 'doc2speech', name: 'Document to Speech' },
  { id: 'dialogue', name: 'AI Dialogue' },
];

const VOICES = [
  { id: 'nova', name: 'Nova', style: 'Energetic female' },
  { id: 'aria', name: 'Aria', style: 'Calm professional' },
  { id: 'echo', name: 'Echo', style: 'Deep documentary' },
  { id: 'fable', name: 'Fable', style: 'British narrator' },
  { id: 'onyx', name: 'Onyx', style: 'Authoritative male' },
  { id: 'sage', name: 'Sage', style: 'Warm conversational' },
];

const EMOTIONS = ['Neutral', 'Happy', 'Calm', 'Excited', 'Sad', 'Professional', 'Energetic'];

export default function VoiceStudio() {
  const [activeMode, setActiveMode] = useState('tts');
  const [textPrompt, setTextPrompt] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);

  // Dialogue Builder
  const [dialogueLines, setDialogueLines] = useState([{ id: '1', speaker: 'A', text: '' }, { id: '2', speaker: 'B', text: '' }]);
  const [speakerA, setSpeakerA] = useState(VOICES[0]);
  const [speakerB, setSpeakerB] = useState(VOICES[1]);
  
  // Settings
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [selectedEmotion, setSelectedEmotion] = useState('Neutral');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [format, setFormat] = useState('MP3');

  // Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleDocUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedDoc(e.target.files[0]);
    }
  };

  const addDialogueLine = () => {
    setDialogueLines([...dialogueLines, { id: Date.now().toString(), speaker: dialogueLines.length % 2 === 0 ? 'A' : 'B', text: '' }]);
  };

  const updateDialogueLine = (id: string, text: string) => {
    setDialogueLines(lines => lines.map(l => l.id === id ? { ...l, text } : l));
  };

  const toggleSpeaker = (id: string) => {
    setDialogueLines(lines => lines.map(l => l.id === id ? { ...l, speaker: l.speaker === 'A' ? 'B' : 'A' } : l));
  };

  const deleteDialogueLine = (id: string) => {
    if(dialogueLines.length > 1) {
      setDialogueLines(lines => lines.filter(l => l.id !== id));
    }
  };

  const handleEnhance = async () => {
    if (!textPrompt) return;
    setIsEnhancing(true);
    setTimeout(() => {
      setEnhancedPrompt(`Welcome to KrixenAI. This is an enhanced version of your text, polished to sound more natural and conversational for a professional voiceover.`);
      setIsEnhancing(false);
    }, 1500);
  };

  const handleGenerate = () => {
    if (activeMode === 'tts' && !textPrompt) return;
    if (activeMode === 'doc2speech' && !uploadedDoc) return;
    if (activeMode === 'dialogue' && !dialogueLines[0].text) return;
    
    setIsGenerating(true);
    setProgress(0);
    setGeneratedAudio(null);
    setIsPlaying(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
          setGeneratedAudio(url);
          setIsGenerating(false);
          saveToLibrary('voice', { 
            id: Date.now().toString(),
            text: activeMode === 'tts' ? textPrompt : (activeMode === 'doc2speech' ? uploadedDoc?.name : 'Dialogue'),
            url,
            timestamp: Date.now()
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
            <span className="text-text-muted font-normal text-sm ml-1">Voice Studio</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 rounded-xl bg-elevated hover:bg-inverted/10 transition-colors"
          >
            <Settings2 className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
          </button>
        </div>
      </header>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        className="flex-1 overflow-y-auto pb-32 pt-4 px-4 custom-scrollbar relative z-10"
      >
        
        {/* Mode Selector */}
        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar snap-x">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap py-2.5 px-4 text-xs font-semibold rounded-xl transition-all duration-300 relative snap-start",
                activeMode === mode.id ? "text-white bg-primary-rose shadow-[0_0_15px_rgba(240,80,110,0.3)] border border-primary-rose/50" : "text-text-secondary bg-surface border border-inverted/5 hover:border-inverted/10 hover:text-text-primary"
              )}
            >
              {mode.name}
            </button>
          ))}
        </motion.div>

        {/* Mode Info Box */}
        <AnimatePresence mode="wait">
          {activeMode && (
            <motion.div
              layout
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
                   {activeMode === 'tts' && 'Text to Speech Mode'}
                   {activeMode === 'doc2speech' && 'Document to Speech Mode'}
                   {activeMode === 'dialogue' && 'AI Dialogue Mode'}
                 </h4>
                 <p className="text-[12px] text-[#FDE68A]/80 leading-relaxed font-medium">
                   {activeMode === 'tts' && 'Convert your text into highly realistic human voices with natural intonation. Supports multiple voice styles.'}
                   {activeMode === 'doc2speech' && 'Upload a document (PDF, TXT, DOCX) to have it read aloud. Great for creating audiobooks or reviewing long articles.'}
                   {activeMode === 'dialogue' && 'Create multi-speaker conversations by defining scripts. Assign different voice profiles to each character.'}
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TTS Mode */}
        {activeMode === 'tts' && (
          <div className="mb-6 relative">
            <div className="text-[14px] font-semibold text-text-primary mb-2 tracking-wide pl-1 flex justify-between">
              <span>Speech Text</span>
              <span className="text-text-muted/60 text-xs">{textPrompt.length}/5000</span>
            </div>
            <div className="relative group">
              <textarea
                value={textPrompt}
                onChange={e => setTextPrompt(e.target.value.slice(0, 5000))}
                placeholder="Type or paste the text you want to synthesize..."
                className="w-full h-40 bg-surface text-text-primary font-mono text-sm leading-relaxed border border-inverted/10 rounded-[22px] p-4 pr-12 focus:outline-none focus:border-primary-rose/50 focus:ring-1 focus:ring-primary-rose/50 transition-all resize-none shadow-inner"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleEnhance}
                disabled={isEnhancing || !textPrompt}
                className="absolute bottom-4 right-4 py-2 px-3 rounded-xl bg-gradient-to-br from-primary-rose to-rose-400 shadow-lg disabled:opacity-50 group-hover:opacity-100 opacity-80 transition-opacity flex items-center gap-1.5"
                title="Polish Text"
              >
                {isEnhancing ? (
                  <div className="w-4 h-4 border-2 border-inverted/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-inverted" />
                    <span className="text-xs text-inverted font-bold tracking-wide">Polish</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}

        {/* Document Mode */}
        {activeMode === 'doc2speech' && (
          <div className="mb-6">
            <div className="text-[14px] font-semibold text-text-primary mb-2 tracking-wide pl-1">Document Input</div>
            {!uploadedDoc ? (
              <label className="flex flex-col items-center justify-center h-40 w-full border-2 border-dashed border-inverted/10 rounded-[22px] bg-surface hover:bg-elevated transition-colors cursor-pointer group">
                <FileText className="w-8 h-8 text-text-secondary group-hover:text-primary-rose transition-colors mb-3" />
                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">Upload PDF, TXT, or DOCX</span>
                <span className="text-[10px] text-text-muted mt-1">Up to 10MB</span>
                <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={handleDocUpload} />
              </label>
            ) : (
              <div className="relative w-full p-4 rounded-[22px] border border-inverted/10 bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-rose/10 rounded-xl">
                    <FileText className="w-6 h-6 text-primary-rose" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{uploadedDoc.name}</h3>
                    <p className="text-xs text-text-muted">{(uploadedDoc.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setUploadedDoc(null)} className="p-2 bg-elevated hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-text-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dialogue Builder Mode */}
        {activeMode === 'dialogue' && (
          <div className="mb-6">
            <div className="text-[14px] font-semibold text-text-primary mb-4 tracking-wide pl-1 flex items-center gap-2">
              <MessageSquareMore className="w-4 h-4 text-primary-rose" /> AI Dialogue Builder
            </div>
            
            <div className="flex flex-col gap-3">
              {dialogueLines.map((line, idx) => (
                <motion.div key={line.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                  <button className="mt-2 text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4" /></button>
                  <button 
                    onClick={() => toggleSpeaker(line.id)}
                    className={cn(
                      "mt-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors w-10 text-center",
                      line.speaker === 'A' ? "bg-primary-rose/20 text-primary-rose" : "bg-primary-blue/20 text-primary-blue"
                    )}
                  >
                    {line.speaker}
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      value={line.text}
                      onChange={(e) => updateDialogueLine(line.id, e.target.value)}
                      placeholder={`Enter speaker ${line.speaker}'s line...`}
                      className="w-full bg-surface border border-inverted/5 focus:border-inverted/20 rounded-xl p-3 pr-10 text-sm focus:outline-none transition-colors"
                    />
                    <button onClick={() => deleteDialogueLine(line.id)} className="absolute right-2 top-2 p-1.5 text-text-muted hover:text-red-400 opacity-50 hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
              <div className="pl-6 pt-2">
                <button onClick={addDialogueLine} className="flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary-rose transition-colors">
                  <Plus className="w-3 h-3" /> Add Dialogue Line
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex flex-col items-center gap-2 mt-8">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || (activeMode === 'tts' && !textPrompt) || (activeMode === 'doc2speech' && !uploadedDoc) || (activeMode === 'dialogue' && !dialogueLines[0].text)}
            className="w-full h-14 rounded-pill relative overflow-hidden bg-gradient-to-r from-primary-rose to-rose-400 shadow-[0_0_20px_rgba(240,80,110,0.2)] disabled:opacity-70 disabled:cursor-not-allowed group transition-shadow hover:shadow-[0_0_30px_rgba(240,80,110,0.3)]"
          >
            {isGenerating && (
              <div className="absolute inset-0 bg-inverted/10" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
            )}
            <div className="absolute inset-0 flex items-center justify-center font-bold tracking-wide text-inverted">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Mic className="w-5 h-5 animate-pulse" />
                  Synthesizing voice... {progress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mic className="w-5 h-5" /> Generate Voice
                </span>
              )}
            </div>
          </motion.button>
        </div>

        {/* Results Section */}
        {generatedAudio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="text-sm font-bold tracking-widest uppercase mb-4 text-text-primary px-1">Audio Output</div>
            <div className="p-6 bg-surface border border-inverted/10 rounded-[24px] shadow-xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-rose rounded-full blur-[60px] opacity-10 pointer-events-none" />
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-center h-16 w-full gap-1 overflow-hidden">
                  {/* Waveform visualization (fake animated) */}
                  {Array.from({length: 40}).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={isPlaying ? { 
                        height: [10, Math.random() * 50 + 10, 10], 
                        transition: { duration: 0.5 + Math.random() * 0.5, repeat: Infinity }
                      } : { height: 4 }}
                      className="w-1.5 bg-primary-rose rounded-full"
                    />
                  ))}
                </div>
                
                <div className="flex items-center justify-between w-full">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-primary-rose text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(240,80,110,0.3)] hover:scale-105 transition-transform">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                  </button>
                  <div className="flex-1 px-4">
                    <div className="h-1 bg-inverted/10 rounded-full w-full relative">
                      <div className="absolute left-0 top-0 h-full bg-primary-rose rounded-full w-1/3" />
                      <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-text-muted">0:45</span>
                </div>

                <div className="flex gap-2 justify-center mt-2 border-t border-inverted/5 pt-4">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-elevated hover:bg-inverted/10 rounded-lg text-xs font-bold transition-colors">
                    <RefreshCcw className="w-3.5 h-3.5" /> Replay
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-rose/10 hover:bg-primary-rose/20 text-primary-rose rounded-lg text-xs font-bold transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
              <audio ref={audioRef} src={generatedAudio} onEnded={() => setIsPlaying(false)} />
            </div>
          </motion.div>
        )}

      </motion.div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
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
                <h2 className="text-lg font-bold tracking-tight">Voice Settings</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-inverted/10 transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <div className="px-6 flex flex-col gap-8 pb-12">
                
                {/* Voice Selection */}
                {activeMode !== 'dialogue' && (
                  <div>
                    <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest pl-1">Selected Voice</div>
                    <div className="grid grid-cols-2 gap-2">
                      {VOICES.map(voice => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 text-center transition-all duration-300 border rounded-2xl relative overflow-hidden group",
                            selectedVoice.id === voice.id ? "bg-gradient-to-br from-primary-rose/20 to-surface border-primary-rose shadow-[0_0_15px_rgba(240,80,110,0.15)]" : "bg-surface border-inverted/5 hover:border-inverted/20"
                          )}
                        >
                          <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center shrink-0 mb-1">
                            <span className="text-sm font-bold text-primary-rose">{voice.name[0]}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className={cn("font-semibold text-xs", selectedVoice.id === voice.id ? "text-inverted" : "text-text-primary")}>
                              {voice.name}
                            </span>
                            <span className="text-[9px] text-text-secondary relative z-10 leading-tight mt-0.5 max-w-[80px] truncate">
                              {voice.style}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emotion */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Emotion</div>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map(emotion => (
                      <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selectedEmotion === emotion ? "bg-inverted/10 border-inverted/20 text-inverted" : "border-inverted/5 text-text-muted hover:bg-inverted/5"
                        )}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest flex justify-between">
                    <span>Speech Speed</span>
                    <span className="text-text-primary">{speed}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2" step="0.1" 
                    value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-primary-rose h-1.5 bg-inverted/10 rounded-full outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-2">
                    <span>Slower</span>
                    <span>Faster</span>
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-widest">Output Format</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['MP3', 'WAV', 'OGG'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-bold transition-all border",
                          format === f ? "bg-primary-rose/20 border-primary-rose text-primary-rose" : "bg-elevated border-inverted/5 text-text-muted hover:text-text-primary hover:border-inverted/20"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
