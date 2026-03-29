'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/context/GameContext';
import RoundIndicator from '@/components/RoundIndicator';
import TaskTimer from '@/components/TaskTimer';
import { RefreshCw, CheckCircle, Home, Wine, Clock, Music } from 'lucide-react';

export default function TaskPage() {
  const router = useRouter();
  const { currentTask, generateTask, setCurrentTask, round, maxIntensity } = useGame();
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    if (!currentTask) {
      generateTask();
    }
    // Reveal animation delay
    const timer = setTimeout(() => setIsRevealing(false), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = () => {
    router.push('/reward');
  };

  const handleReplace = () => {
    setIsRevealing(true);
    setCurrentTask(null);
    generateTask();
    setTimeout(() => setIsRevealing(false), 600);
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
        {!currentTask ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-t-2 border-crimson-red rounded-full animate-spin" />
              <div className="absolute inset-2 border-r-2 border-gold rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl animate-heartbeat">
                ❤️
              </div>
            </div>
            <p className="text-white/60 animate-pulse text-sm">מייצר אתגר חדש...</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center mt-20"
          >
            {/* Task Card */}
            <div className="game-card w-full mb-6">
              {/* Emoji & Title */}
              <div className="flex flex-col items-center mb-5">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-4xl mb-3"
                >
                  {currentTask.emoji}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-playfair text-gold tracking-wide leading-snug"
                >
                  {currentTask.title}
                </motion.h2>
              </div>

              {/* Duration tag */}
              <div className="flex justify-center mb-5">
                <div className="duration-tag">
                  <Clock size={12} />
                  <span>{currentTask.durationLabel}</span>
                </div>
              </div>

              {/* Description */}
              <div className="max-h-[35vh] overflow-y-auto custom-scrollbar mb-5">
                <p className="text-white/85 text-base leading-relaxed font-light text-right">
                  {currentTask.description}
                </p>
              </div>

              {/* Song Suggestions (for מופע ליחיד) */}
              {currentTask.songSuggestions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-gold/70 mb-2">
                    <Music size={14} />
                    <span className="text-xs font-medium">הצעות לשירים:</span>
                  </div>
                  {currentTask.songSuggestions.map((song, i) => (
                    <a
                      key={i}
                      href={song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="song-link"
                    >
                      <span className="text-sm">🎵</span>
                      <div className="text-right flex-1">
                        <span className="text-white text-sm font-medium">{song.title}</span>
                        <span className="text-white/40 text-xs block">{song.artist}</span>
                      </div>
                    </a>
                  ))}
                </motion.div>
              )}

              {/* Drinking Rule */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="drinking-rule"
              >
                <Wine className="text-crimson-red mt-0.5 shrink-0" size={18} />
                <p className="text-white/80 text-sm leading-relaxed text-right">
                  {currentTask.drinkingRule}
                </p>
              </motion.div>

              {/* Inline Timer (only if task has duration) */}
              {currentTask.duration && (
                <TaskTimer totalSeconds={currentTask.duration} variant="task" />
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <Button onClick={handleComplete} size="lg" className="w-full text-lg group">
                השלמתי את המשימה 🏆
              </Button>
              <Button onClick={handleReplace} variant="secondary" className="w-full text-sm">
                <RefreshCw className="ml-2 w-4 h-4" />
                החלף משימה
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
