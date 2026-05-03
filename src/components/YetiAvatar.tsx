import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export type YetiState = 'idle' | 'email' | 'password' | 'peek' | 'error' | 'success';

interface YetiAvatarProps {
  state: YetiState;
  emailLength?: number;
}

export default function YetiAvatar({ state, emailLength = 0 }: YetiAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const blink = () => {
      if (state !== 'password' && state !== 'peek') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
      timeout = setTimeout(blink, Math.random() * 3000 + 3000); // 3-6s
    };
    timeout = setTimeout(blink, 2000);
    return () => clearTimeout(timeout);
  }, [state]);

  // Animation variants
  const isCoveringEyes = state === 'password';
  const isPeeking = state === 'peek';
  
  // Base transforms
  const eyeBaseY = 0;
  const pupilBaseX = 0;
  const pupilBaseY = 0;

  // Track email length for pupil movement
  const pupilX = state === 'email' ? Math.min(Math.max((emailLength * 1.5) - 15, -15), 15) : 0;
  const pupilY = state === 'email' ? 5 : 0;

  // Emotional states
  const isError = state === 'error';
  const isSuccess = state === 'success';

  return (
    <div className="relative w-32 h-32 mx-auto mb-6 flex justify-center items-end perspective-1000">
      {/* Soft Glow Behind */}
      <motion.div 
        animate={{ 
          scale: isSuccess ? [1, 1.2, 1.1] : isError ? [1, 0.9, 1] : [1, 1.05, 1],
          opacity: isSuccess ? 0.6 : isError ? 0.2 : 0.4
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full blur-2xl z-0 ${isSuccess ? 'bg-success-green' : isError ? 'bg-primary-rose' : 'bg-primary-blue'}`}
      />

      {/* Yeti Body */}
      <motion.div 
        animate={{
          scale: isSuccess ? [1, 1.05, 1] : isError ? [1, 0.95, 1.02, 0.98, 1] : [1, 1.02, 1],
          y: isSuccess ? [-5, -15, -5] : [0, -2, 0],
          rotate: isPeeking ? 5 : isError ? [-2, 2, -2, 2, 0] : 0
        }}
        transition={{ 
          scale: { duration: isSuccess ? 0.5 : isError ? 0.4 : 3, repeat: isSuccess ? 2 : isError ? 0 : Infinity, ease: "easeInOut" },
          y: { duration: isSuccess ? 0.5 : isError ? 0.4 : 3, repeat: isSuccess ? 2 : isError ? 0 : Infinity, ease: "easeInOut" },
          rotate: { type: "spring", stiffness: 300, damping: 20 }
        }}
        className="relative z-10 w-24 h-24 bg-gradient-to-b from-[#ffffff] to-[#e2e8f0] rounded-[40px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex flex-col justify-start items-center pt-5 overflow-hidden"
      >
        {/* Face Gradient Highlight */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-[40px]" />

        {/* Eyebrows */}
        <motion.div className="flex gap-4 mb-1 absolute top-4 z-20">
          <motion.div 
            animate={{ 
              y: isError ? 4 : isBlinking || isCoveringEyes ? 2 : 0,
              rotate: isError ? 15 : isPeeking ? -10 : 0,
              opacity: isSuccess ? 0 : 1 // Hide brows on success to show happy eyes
            }}
            className="w-3 h-1 bg-[#475569] rounded-full"
          />
          <motion.div 
            animate={{ 
              y: isError ? 4 : isBlinking || isCoveringEyes ? 2 : 0,
              rotate: isError ? -15 : isPeeking ? 10 : 0,
              opacity: isSuccess ? 0 : 1
            }}
            className="w-3 h-1 bg-[#475569] rounded-full"
          />
        </motion.div>

        {/* Eyes Area */}
        <div className="flex gap-4 relative z-20 mt-1">
          {/* Left Eye */}
          <motion.div 
            animate={{ x: pupilX, y: pupilY }}
            className="relative flex justify-center items-center"
          >
            <motion.div 
              animate={{ 
                scaleY: isBlinking ? 0.1 : (isSuccess ? 0.2 : 1),
                y: isSuccess ? -2 : 0,
                borderRadius: isSuccess ? '50% 50% 0 0' : '50%'
              }}
              className="w-4 h-5 bg-[#1e293b] rounded-full overflow-hidden relative"
            >
              {/* Highlight */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-70" />
            </motion.div>
          </motion.div>
          
          {/* Right Eye */}
          <motion.div 
            animate={{ x: pupilX, y: pupilY }}
            className="relative flex justify-center items-center"
          >
            <motion.div 
              animate={{ 
                scaleY: isBlinking ? 0.1 : (isSuccess ? 0.2 : 1),
                y: isSuccess ? -2 : 0,
                borderRadius: isSuccess ? '50% 50% 0 0' : '50%'
              }}
              className="w-4 h-5 bg-[#1e293b] rounded-full relative"
            >
              {/* Highlight */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-70" />
              
              {/* Sparkle conceptually inside eye or nearby. Add peek sparkle */}
              <AnimatePresence>
                {isPeeking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute -top-1 -right-2 w-3 h-3 bg-yellow-300 rounded-full blur-[1px] z-20"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        {/* Mouth */}
        <motion.div 
          animate={{
            width: isError ? 12 : isSuccess ? 20 : isCoveringEyes ? 8 : 12,
            height: isError ? 4 : isSuccess ? 10 : isCoveringEyes ? 4 : 6,
            borderRadius: isError ? '8px 8px 4px 4px' : isSuccess ? '4px 4px 12px 12px' : '4px 4px 8px 8px',
            y: isError ? 2 : 0,
          }}
          className="bg-[#1e293b] mt-2 z-20"
        />

        {/* Arms Base */}
        <div className="absolute bottom-0 w-full flex justify-between px-2 pointer-events-none z-30">
          {/* Left Arm */}
          <motion.div 
            animate={{
              y: isCoveringEyes || isPeeking ? -55 : isSuccess ? -20 : 0,
              x: isCoveringEyes || isPeeking ? 15 : isSuccess ? -10 : 0,
              rotate: isCoveringEyes || isPeeking ? 45 : isSuccess ? -20 : 0,
            }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="w-6 h-10 bg-gradient-to-t from-[#cbd5e1] to-white rounded-t-full rounded-b-md shadow-md"
          />
          {/* Right Arm */}
          <motion.div 
            animate={{
              y: isCoveringEyes ? -55 : isPeeking ? -10 : isSuccess ? -20 : 0,
              x: isCoveringEyes ? -15 : isPeeking ? 0 : isSuccess ? 10 : 0,
              rotate: isCoveringEyes ? -45 : isPeeking ? 20 : isSuccess ? 20 : 0,
            }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="w-6 h-10 bg-gradient-to-t from-[#cbd5e1] to-white rounded-t-full rounded-b-md shadow-md"
          />
        </div>
      </motion.div>
      
      {/* Subtle Shadow under Yeti */}
      <motion.div 
        animate={{
          scale: isSuccess ? 0.8 : 1,
          opacity: isSuccess ? 0.3 : 0.6
        }}
        className="absolute -bottom-2 w-16 h-3 bg-black/40 blur-sm rounded-[100%]"
      />
    </div>
  );
}
