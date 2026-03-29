'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function EntrancePage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasStarted) {
        if (typeof window !== 'undefined' && (window as any).playIntroSound) {
          (window as any).playIntroSound();
        }
        setHasStarted(true);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasStarted]);

  const handleStart = () => {
    router.push('/prep');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        {/* Title with shimmer */}
        <h1 className="text-6xl md:text-7xl font-playfair font-bold text-center mb-3 tracking-wider shimmer-text drop-shadow-2xl">
          The Game
        </h1>

        {/* Accent line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '120px' }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="h-[2px] bg-gradient-to-r from-transparent via-crimson-red to-transparent mb-8"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-white/50 text-base mb-3 font-light tracking-[0.3em] uppercase"
        >
          A night to remember
        </motion.p>

        {/* Second subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-white/30 text-sm mb-16 font-light"
        >
          ✨ 25 משימות · 17 פרסים · לילה אחד ✨
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="w-full max-w-xs"
      >
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full text-xl shadow-[0_0_25px_rgba(220,20,60,0.5)]"
        >
          להתחיל את הלילה
        </Button>
      </motion.div>

      {/* Background breathing glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none -z-10 breathing-glow" />
      <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-gold/5 rounded-full blur-[80px] pointer-events-none -z-10 breathing-glow" style={{ animationDelay: '2s' }} />
    </div>
  );
}
