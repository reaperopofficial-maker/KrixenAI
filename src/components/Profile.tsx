import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, CheckCircle2, XCircle, Loader2, Image as ImageIcon, Clapperboard, Mic, Trash2, Download, Play, X, User, Sparkles, Link as LinkIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'voice'>('images');
  const [libraryData, setLibraryData] = useState({ images: [], videos: [], voice: [] });
  
  // Edit Profile
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Load local storage data
  useEffect(() => {
    // In a real app we'd load this from other studios writing to localStorage
    const savedLibrary = localStorage.getItem('krixen_library');
    if (savedLibrary) {
      try {
        setLibraryData(JSON.parse(savedLibrary));
      } catch (e) {}
    }
  }, []);

  const openEditModal = () => {
    setEditName(auth.currentUser?.displayName || '');
    setEditPhotoURL(auth.currentUser?.photoURL || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: editName,
        photoURL: editPhotoURL
      });
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

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
      <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-base/80 backdrop-blur-xl border-b border-inverted/5">
        <h1 className="text-2xl font-bold tracking-tight text-inverted">Profile</h1>
      </header>

      <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
        
        {/* User Card */}
        <section className="bg-surface border border-inverted/5 p-6 rounded-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <div className="relative group flex-shrink-0 cursor-pointer" onClick={openEditModal}>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-blue to-secondary-violet text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(79,142,247,0.3)] border-2 border-surface z-10 uppercase tracking-wider">
                Free
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-blue to-secondary-violet flex items-center justify-center p-[2px]">
                <div className="w-full h-full bg-base rounded-full flex items-center justify-center overflow-hidden">
                  {auth.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-inverted/50" />
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-inverted truncate hover:text-clip hover:whitespace-normal transition-all">{auth.currentUser?.displayName || 'Krixen User'}</h2>
              <p className="text-sm text-text-muted truncate hover:text-clip hover:whitespace-normal transition-all">{auth.currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={openEditModal} 
            className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-inverted/5 hover:bg-inverted/10 border border-inverted/5 transition-colors text-sm font-semibold w-full sm:w-auto"
          >
            Edit Profile
          </button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-inverted/5 p-5 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Images Generated</span>
            </div>
            <span className="text-3xl font-bold text-inverted">{stats.images}</span>
          </div>
          <div className="bg-surface border border-inverted/5 p-5 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clapperboard className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Videos Generated</span>
            </div>
            <span className="text-3xl font-bold text-inverted">{stats.videos}</span>
          </div>
          <div className="bg-surface border border-inverted/5 p-5 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Mic className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Voice Generated</span>
            </div>
            <span className="text-3xl font-bold text-inverted">{stats.voice}</span>
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
                  <h4 className="font-bold text-inverted text-lg">Free Plan</h4>
                  <p className="text-xs text-text-muted mt-1">Access to all basic AI tools</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-primary-blue/10 text-primary-blue text-[10px] font-bold uppercase tracking-wider border border-primary-blue/20">
                  Current
                </span>
              </div>
              <div className="mt-auto pt-4">
                <button className="w-full py-2.5 rounded-xl bg-inverted/5 text-text-secondary text-sm font-semibold cursor-default">
                  Active
                </button>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-surface/50 border border-inverted/5 p-6 rounded-[24px] flex flex-col gap-4 opacity-70">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-inverted text-lg">Pro Plan</h4>
                  <p className="text-xs text-text-muted mt-1">Faster generation & limits</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-inverted/5 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                  Soon
                </span>
              </div>
              <div className="mt-auto pt-4">
                <button disabled className="w-full py-2.5 rounded-xl bg-inverted/5 text-text-muted text-sm font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Premium */}
            <div className="bg-surface/50 border border-inverted/5 p-6 rounded-[24px] flex flex-col gap-4 opacity-70 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary-violet/10 blur-[30px] rounded-full" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h4 className="font-bold text-inverted text-lg">Premium</h4>
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
          
          <div className="bg-elevated border border-inverted/5 rounded-[20px] p-5 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-inverted/5">
              <Sparkles className="w-5 h-5 text-secondary-violet" />
            </div>
            <div>
              <p className="text-sm font-semibold text-inverted">🚀 Upcoming plans will include:</p>
              <ul className="text-sm text-text-muted mt-2 space-y-1 list-disc list-inside">
                <li>Faster generation</li>
                <li>Priority processing</li>
                <li>Advanced models</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="space-y-4">
          <div 
            onClick={handleLogout}
            className="bg-primary-rose/10 hover:bg-primary-rose/20 border border-primary-rose/20 rounded-[32px] p-6 flex items-center justify-between group cursor-pointer transition-all shadow-sm"
          >
            <div>
              <p className="text-xl font-bold text-primary-rose">Logout</p>
              <p className="text-sm text-primary-rose/70 mt-1">Sign out of your account</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary-rose/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary-rose text-primary-rose group-hover:text-white transition-all shadow-sm">
              <LogOut className="w-6 h-6 ml-[-2px]" />
            </div>
          </div>
        </section>

        {/* User Library */}
        <section className="space-y-6 pt-4 border-t border-inverted/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Your Library</h3>
          </div>
          
          <div className="flex gap-2 p-1 bg-surface border border-inverted/5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('images')}
              className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === 'images' ? "bg-inverted/10 text-inverted" : "text-text-secondary hover:text-inverted")}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === 'videos' ? "bg-inverted/10 text-inverted" : "text-text-secondary hover:text-inverted")}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={cn("px-6 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === 'voice' ? "bg-inverted/10 text-inverted" : "text-text-secondary hover:text-inverted")}
            >
              Voice
            </button>
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'images' && (
              libraryData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {libraryData.images.map((item: any, i) => (
                    <div key={i} className="group relative aspect-square rounded-[20px] overflow-hidden bg-surface border border-inverted/5">
                      <img src={item.url || item.images?.[0]} alt="Creation" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button className="p-2 bg-inverted/10 hover:bg-inverted/20 rounded-full backdrop-blur-md"><Download className="w-4 h-4 text-inverted" /></button>
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
                    <div key={i} className="group relative aspect-video rounded-[24px] overflow-hidden bg-surface border border-inverted/5">
                      {item.url ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80" alt="Video cover" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-inverted/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-inverted ml-1" />
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
                    <div key={i} className="p-4 bg-surface border border-inverted/5 rounded-[20px] flex items-center gap-4 group">
                      <button className="w-12 h-12 rounded-full bg-primary-rose/10 text-primary-rose flex items-center justify-center flex-shrink-0 group-hover:bg-primary-rose group-hover:text-white transition-colors">
                        <Play className="w-5 h-5 ml-1" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">Generated Audio {i+1}</p>
                        <p className="text-xs text-text-muted truncate">{item.text || 'Voice synthesis'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-text-muted hover:text-inverted transition-colors"><Download className="w-4 h-4" /></button>
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
      
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-surface border border-inverted/10 rounded-[32px] p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-inverted/5 text-text-muted transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold mb-2 text-inverted">Edit Profile</h3>
                <p className="text-text-secondary text-sm">
                  Update your display name and profile picture.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted pl-2">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-muted" />
                    </div>
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-base border border-inverted/10 rounded-[16px] py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all text-inverted"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted pl-2">Profile Picture URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-text-muted" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={editPhotoURL}
                      onChange={(e) => setEditPhotoURL(e.target.value)}
                      className="w-full bg-base border border-inverted/10 rounded-[16px] py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-blue/50 focus:ring-1 focus:ring-primary-blue/50 transition-all text-inverted"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: isSavingProfile ? 1 : 1.02 }}
                  whileTap={{ scale: isSavingProfile ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full mt-4 py-4 rounded-pill bg-gradient-to-r from-primary-blue to-secondary-violet text-white font-bold tracking-wide shadow-[0_0_20px_rgba(79,142,247,0.3)] disabled:opacity-70 flex justify-center items-center h-14"
                >
                  {isSavingProfile ? (
                    <div className="w-5 h-5 border-2 border-inverted/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="w-full h-[300px] border border-dashed border-inverted/10 rounded-[32px] flex flex-col items-center justify-center text-center p-6 bg-surface/30">
      <div className="w-16 h-16 rounded-full bg-inverted/5 flex items-center justify-center mb-4">
        {tab === 'images' && <ImageIcon className="w-6 h-6 text-text-muted" />}
        {tab === 'videos' && <Clapperboard className="w-6 h-6 text-text-muted" />}
        {tab === 'voice' && <Mic className="w-6 h-6 text-text-muted" />}
      </div>
      <p className="font-bold text-inverted text-lg">No creations yet</p>
      <p className="text-text-muted text-sm mt-2 max-w-[250px]">Your generated {tab} will appear here safely stored.</p>
    </div>
  );
}