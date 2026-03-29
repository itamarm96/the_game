'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/context/GameContext';
import RoundIndicator from '@/components/RoundIndicator';
import TaskTimer from '@/components/TaskTimer';
import { ArrowRight, Home, Wine } from 'lucide-react';

export default function RewardPage() {
  const router = useRouter();
  const {
    currentReward,
    generateReward,
    setCurrentReward,
    setCurrentTask,
    advanceRound,
    round,
    maxIntensity,
  } = useGame();
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    if (!currentReward) {
      generateReward();
    }
    const timer = setTimeout(() => setIsRevealing(false), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextTask = () => {
    advanceRound();
    router.push('/task');
  };

  const handleHome = () => {
    router.push('/prep');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full text-center relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4 py-3">
        <RoundIndicator round={round} maxIntensity={maxIntensity} />
        <button onClick={handleHome} className="text-white/40 hover:text-white transition-colors p-2">
          <Home size={20} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!currentReward ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 border-t-2 border-gold rounded-full animate-spin" />
            <p className="text-white/60 text-sm">מכין את הפרס...</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center mt-20"
          >
            {/* Reward Title */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center mb-6"
            >
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2, damping: 10 }}
                className="text-5xl mb-3"
              >
                {currentReward.emoji}
              </motion.span>
              <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gold drop-shadow-lg leading-snug">
                {currentReward.title}
              </h1>
              <p className="text-white/30 text-xs mt-2 tracking-widest uppercase">🏆 הפרס שלכם</p>
            </motion.div>

            {/* Reward Card */}
            <div className="game-card reward-card w-full mb-6">
              {/* Description */}
              <div className="max-h-[30vh] overflow-y-auto custom-scrollbar mb-5">
                <p className="text-white/90 text-base leading-relaxed font-light text-right">
                  {currentReward.description}
                </p>
              </div>

              {/* Drinking Rule */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="drinking-rule reward-rule"
              >
                <Wine className="text-gold mt-0.5 shrink-0" size={18} />
                <p className="text-white/80 text-sm leading-relaxed text-right">
                  {currentReward.drinkingRule}
                </p>
              </motion.div>

              {/* Reward Timer (auto-start) */}
              <TaskTimer
                totalSeconds={currentReward.duration}
                autoStart={true}
                variant="reward"
              />
            </div>

            {/* Next Round Button */}
            <Button
              onClick={handleNextTask}
              size="lg"
              className="w-full text-lg group"
              variant="outline"
            >
              בואו נמשיך למשימה הבאה
              <ArrowRight className="ml-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
