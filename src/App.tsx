/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Splash from './components/Splash';
import Login from './components/Login';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import VoiceStudio from './components/VoiceStudio';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      if (location.pathname === '/') {
        if (user) {
          navigate('/image', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [loading, user, location.pathname, navigate]);

  const isAuthRoute = location.pathname === '/login';

  return (
    <AnimatePresence mode="wait">
      {loading || location.pathname === '/' ? (
        <motion.div key="splash" exit={{ opacity: 0, transition: { duration: 0.3 } }} className="fixed inset-0 z-50">
          <Splash />
        </motion.div>
      ) : (
        <motion.div 
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-base text-text-primary flex flex-col relative w-full overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/login" element={!user ? <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col min-h-0 w-full"><Login /></motion.div> : <Navigate to="/image" replace />} />
              <Route path="/image" element={user ? <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col min-h-0 w-full"><ImageStudio /></motion.div> : <Navigate to="/login" replace />} />
              <Route path="/video" element={user ? <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col min-h-0 w-full"><VideoStudio /></motion.div> : <Navigate to="/login" replace />} />
              <Route path="/voice" element={user ? <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col min-h-0 w-full"><VoiceStudio /></motion.div> : <Navigate to="/login" replace />} />
              <Route path="/profile" element={user ? <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col min-h-0 w-full"><Profile /></motion.div> : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          {!isAuthRoute && <BottomNav />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster 
        position="bottom-center" 
        containerStyle={{ bottom: 100 }}
        toastOptions={{ 
          style: {
            background: '#161A24',
            color: '#F0F2F8',
            borderRadius: '16px',
          }
        }} 
      />
    </BrowserRouter>
  );
}
