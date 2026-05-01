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
          className="min-h-screen bg-base text-text-primary flex flex-col relative w-full"
        >
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/image" replace />} />
            <Route path="/image" element={user ? <ImageStudio /> : <Navigate to="/login" replace />} />
            <Route path="/video" element={user ? <VideoStudio /> : <Navigate to="/login" replace />} />
            <Route path="/voice" element={user ? <VoiceStudio /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={user ? <div className="p-6 pt-12"><h2 className="text-2xl font-bold">Profile</h2></div> : <Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
      <Toaster position="top-center" toastOptions={{ 
        style: {
          background: '#161A24',
          color: '#F0F2F8',
          borderRadius: '16px',
        }
      }} />
    </BrowserRouter>
  );
}
