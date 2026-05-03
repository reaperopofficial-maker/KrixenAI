import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Splash() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-base overflow-hidden">
      {/* Blurred Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-blue rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-violet rounded-full blur-3xl opacity-10" />

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-primary-blue to-secondary-violet p-[2px]">
          <div className="w-full h-full bg-surface rounded-3xl flex items-center justify-center shadow-lg shadow-black/50">
            <Sparkles className="w-12 h-12 text-primary-blue" />
          </div>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          <span className="bg-gradient-to-r from-primary-blue to-secondary-violet bg-clip-text text-transparent">Krixen</span><span className="text-white">AI</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-text-secondary font-medium tracking-wide"
        >
          Create Without Limits
        </motion.p>

        {/* Loading Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-48 h-1.5 bg-elevated rounded-pill mt-12 overflow-hidden relative shadow-inner"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary-blue to-secondary-violet rounded-pill"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
