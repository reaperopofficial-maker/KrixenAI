import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ImageIcon, Clapperboard, Mic, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { name: 'Image', path: '/image', icon: ImageIcon, colorClass: 'text-primary-blue', bgClass: 'bg-primary-blue/10', borderClass: 'border-primary-blue/20', lineClass: 'bg-primary-blue shadow-[0_0_8px_rgba(79,142,247,0.8)]' },
    { name: 'Video', path: '/video', icon: Clapperboard, colorClass: 'text-secondary-violet', bgClass: 'bg-secondary-violet/10', borderClass: 'border-secondary-violet/20', lineClass: 'bg-secondary-violet shadow-[0_0_8px_rgba(124,92,246,0.8)]' },
    { name: 'Voice', path: '/voice', icon: Mic, colorClass: 'text-primary-rose', bgClass: 'bg-primary-rose/10', borderClass: 'border-primary-rose/20', lineClass: 'bg-primary-rose shadow-[0_0_8px_rgba(240,80,110,0.8)]' },
    { name: 'Profile', path: '/profile', icon: User, colorClass: 'text-white', bgClass: 'bg-white/10', borderClass: 'border-white/20', lineClass: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pt-4 px-4 bg-gradient-to-t from-base via-base/95 to-transparent pointer-events-none">
      <div className="flex items-center justify-between w-full max-w-sm rounded-[32px] bg-surface/80 backdrop-blur-xl border border-white/5 p-2 shadow-2xl pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl group transition-all"
            >
              <div className={cn("relative z-10 flex flex-col items-center justify-center transition-colors duration-300", isActive ? tab.colorClass : "text-text-secondary group-hover:text-text-primary")}>
                <motion.div whileTap={{ scale: 0.8 }}>
                  <tab.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="text-[10px] font-semibold">{tab.name}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className={cn("absolute inset-0 rounded-2xl border", tab.bgClass, tab.borderClass)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div className={cn("absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full", tab.lineClass)} />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
