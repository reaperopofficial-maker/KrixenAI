import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, CheckCircle2, XCircle, Loader2, Image as ImageIcon, Clapperboard, Mic, Trash2, Download, Play, X, User, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'voice'>('images');
  const [libraryData, setLibraryData] = useState({ images: [], videos: [], voice: [] });
  
  // Settings
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // Load local storage data
  useEffect(() => {
    // Check initial dark mode state from body
    setDarkMode(!document.documentElement.classList.contains('light'));

    // In a real app we'd load this from other studios writing to localStorage
    const savedLibrary = localStorage.getItem('krixen_library');
    if (savedLibrary) {
      try {
        setLibraryData(JSON.parse(savedLibrary));
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const stats = {
    images: libraryData.images.length || 0,
    videos: libraryData.videos.length || 0,
    voice: libraryData.voice.length || 0
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-base text-text-primary pb-24 custom-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-base/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
        <button className="p-2.5 rounded-xl bg-elevated hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-text-secondary" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
        
        {/* User Card */}
        <section className="bg-surface border border-white/5 p-6 rounded-[32px] flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-blue to-secondary-violet flex items-center justify-center p-[2px]">
                <div className="w-full h-full bg-base rounded-full flex items-center justify-center overflow-hidden">
                  {auth.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white/50" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-elevated border border-white/10 rounded-full shadow-lg group-hover:bg-primary-blue transition-colors">
                <Settings className="w-3 h-3 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{auth.currentUser?.displayName || 'Krixen User'}</h2>
              <p className="text-sm text-text-muted">{auth.currentUser?.email}</p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-semibold">
            Edit Profile
          </button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-white/5 p-5 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Images Generated</span>
            </div>
            <span className="text-3xl font-bold text-white">{stats.images}</span>
          </div>
          <div className="bg-surface border border-white/5 p-5 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clapperboard className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Videos Generated</span>
            </div>
            <span className="text-3xl font-bold text-white">{stats.videos}</span>
          </div>
          <div className="bg-surface border border-white/5 p-5 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Mic className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Voice Generated</span>
            </div>
            <span className="text-3xl font-bold text-white">{stats.voice}</span>
          </div>
        </section>

        {/* Subscription System */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold">Subscription Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Free */}
            <div className="relative bg-surface border border-primary-blue/30 p-6 rounded-[24px] overflow-hidden flex flex-col gap-4 shadow-[0_0_20px_rgba(79,142,247,0.1)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-blue to-secondary-violet" />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-lg">Free Plan</h4>
                  <p className="text-xs text-text-muted mt-1">Access to all basic AI tools</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-primary-blue/10 text-primary-blue text-[10px] font-bold uppercase tracking-wider border border-primary-blue/20">
                  Current
                </span>
              </div>
              <div className="mt-auto pt-4">
                <button className="w-full py-2.5 rounded-xl bg-white/5 text-text-secondary text-sm font-semibold cursor-default">
                  Active
                </button>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-surface/50 border border-white/5 p-6 rounded-[24px] flex flex-col gap-4 opacity-70">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-lg">Pro Plan</h4>
                  <p className="text-xs text-text-muted mt-1">Faster generation & limits</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                  Soon
                </span>
              </div>
              <div className="mt-auto pt-4">
                <button disabled className="w-full py-2.5 rounded-xl bg-white/5 text-text-muted text-sm font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className="bg-surface/50 border border-white/5 p-6 rounded-[24px] flex flex-col gap-4 opacity-70 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary-violet/10 blur-[30px] rounded-full" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h4 className="font-bold text-white text-lg">Premium</h4>
                  <p className="text-xs text-text-muted mt-1">Advanced models & priority</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-secondary-violet/10 text-secondary-violet text-[10px] font-bold uppercase tracking-wider border border-secondary-violet/20">
                  Soon
                </span>
              </div>
              <div className="mt-auto pt-4 relative z-10">
                <button disabled className="w-full py-2.5 rounded-xl bg-secondary-violet/10 text-secondary-violet/50 text-sm font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>

          </div>
          
          <div className="bg-elevated border border-white/5 rounded-[20px] p-5 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-white/5">
              <Sparkles className="w-5 h-5 text-secondary-violet" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">🚀 Upcoming plans will include:</p>
              <ul className="text-sm text-text-muted mt-2 space-y-1 list-disc list-inside">
                <li>Faster generation</li>
                <li>Priority processing</li>
                <li>Advanced models</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold">Settings</h3>
          <div className="bg-surface border border-white/5 rounded-[24px] overflow-hidden divide-y divide-white/5">
            <div className="p-4 px-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Dark Mode</p>
                <p className="text-xs text-text-muted">Toggle application theme</p>
              </div>
              <button 
                onClick={() => {
                  const newMode = !darkMode;
                  setDarkMode(newMode);
                  if (newMode) {
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                }}
                className={cn("w-12 h-6 rounded-full transition-colors relative", darkMode ? "bg-primary-blue" : "bg-white/10")}
              >
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", darkMode ? "left-7" : "left-1")} />
              </button>
            </div>
            
            <div className="p-4 px-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Notifications</p>
                <p className="text-xs text-text-muted">Generation success alerts</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={cn("w-12 h-6 rounded-full transition-colors relative", notifications ? "bg-success-green" : "bg-white/10")}
              >
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", notifications ? "left-7" : "left-1")} />
              </button>
            </div>
            
            <div className="p-4 px-6 flex items-center justify-between group hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={handleLogout}>
              <div>
                <p className="font-semibold text-primary-rose">Logout</p>
                <p className="text-xs text-text-muted">Sign out of your account</p>
              </div>
              <LogOut className="w-5 h-5 text-primary-rose/50 group-hover:text-primary-rose transition-colors" />
            </div>
          </div>
        </section>

        {/* User Library */}
        <section className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Your Library</h3>
          </div>
          
          <div className="flex gap-2 p-1 bg-surface border border-white/5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('images')}
              className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === 'images' ? "bg-white/10 text-white" : "text-text-secondary hover:text-white")}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === 'videos' ? "bg-white/10 text-white" : "text-text-secondary hover:text-white")}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === 'voice' ? "bg-white/10 text-white" : "text-text-secondary hover:text-white")}
            >
              Voice
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'images' && (
              libraryData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {libraryData.images.map((item: any, i) => (
                    <div key={i} className="group relative aspect-square rounded-[20px] overflow-hidden bg-surface border border-white/5">
                      <img src={item.url || item.images?.[0]} alt="Creation" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"><Download className="w-4 h-4 text-white" /></button>
                        <button className="p-2 bg-primary-rose/80 hover:bg-primary-rose rounded-full backdrop-blur-md"><Trash2 className="w-4 h-4 text-white" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState tab="images" />
              )
            )}
            
            {activeTab === 'videos' && (
              libraryData.videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryData.videos.map((item: any, i) => (
                    <div key={i} className="group relative aspect-video rounded-[24px] overflow-hidden bg-surface border border-white/5">
                      {item.url ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80" alt="Video cover" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState tab="videos" />
              )
            )}
            
            {activeTab === 'voice' && (
              libraryData.voice.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {libraryData.voice.map((item: any, i) => (
                    <div key={i} className="p-4 bg-surface border border-white/5 rounded-[20px] flex items-center gap-4 group">
                      <button className="w-12 h-12 rounded-full bg-primary-rose/10 text-primary-rose flex items-center justify-center flex-shrink-0 group-hover:bg-primary-rose group-hover:text-white transition-colors">
                        <Play className="w-5 h-5 ml-1" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">Generated Audio {i+1}</p>
                        <p className="text-xs text-text-muted truncate">{item.text || 'Voice synthesis'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-text-muted hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
                        <button className="p-2 text-text-muted hover:text-primary-rose transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState tab="voice" />
              )
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="w-full h-[300px] border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center p-6 bg-surface/30">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        {tab === 'images' && <ImageIcon className="w-6 h-6 text-text-muted" />}
        {tab === 'videos' && <Clapperboard className="w-6 h-6 text-text-muted" />}
        {tab === 'voice' && <Mic className="w-6 h-6 text-text-muted" />}
      </div>
      <p className="font-bold text-white text-lg">No creations yet</p>
      <p className="text-text-muted text-sm mt-2 max-w-[250px]">Your generated {tab} will appear here safely stored.</p>
    </div>
  );
}