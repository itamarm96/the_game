'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGame, type GameContent } from '@/context/GameContext';
import { RefreshCw, CheckCircle, Home, Wine } from 'lucide-react';

export default function TaskPage() {
  const router = useRouter();
  const { currentTask, setCurrentTask, setIsLoading, level } = useGame();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    setLocalLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'task', level })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch task');
      setCurrentTask(data.result as GameContent);
    } catch (err: any) {
      setError("אופס, משהו השתבש בייצור המשימה. נסה שוב.");
      console.error(err);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  }, [level, setCurrentTask, setIsLoading]);

  useEffect(() => {
    if (!currentTask) {
      fetchTask();
    } else {
      setIsLoading(false);
    }
  }, [currentTask, fetchTask, setIsLoading]);

  const handleComplete = () => {
    router.push('/reward');
  };

  const handleReplace = () => {
    setCurrentTask(null);
    fetchTask();
  };

  const handleHome = () => {
    router.push('/prep');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full text-center relative">

      {/* Top Bar — Level + Home */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4 py-3">
        <div className="level-badge">
          רמה {level}
        </div>
        <button onClick={handleHome} className="text-white/50 hover:text-white transition-colors p-2">
          <Home size={22} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {localLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-t-2 border-crimson-red rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-r-2 border-gold rounded-full animate-spin animation-delay-150"></div>
              <div className="absolute inset-0 flex items-center justify-center text-red-500 animate-heartbeat">
                ❤️
              </div>
            </div>
            <p className="text-white/70 animate-pulse">מייצר אתגר חדש...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <p className="text-red-400">{error}</p>
            <Button onClick={handleReplace} variant="outline">נסה שוב</Button>
          </motion.div>
        ) : currentTask ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* Task Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 mb-8 w-full shadow-2xl relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-crimson-red to-transparent"></div>

              {/* Dynamic Title — the mischievous task name */}
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-playfair text-gold mb-5 tracking-wide leading-snug"
              >
                {currentTask.title}
              </motion.h2>

              {/* Description — scrollable for long text */}
              <div className="max-h-[40vh] overflow-y-auto custom-scrollbar mb-5">
                <p className="text-white/90 text-lg leading-relaxed font-light">
                  {currentTask.description}
                </p>
              </div>

              {/* Drinking Rule */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-crimson-red/15 border border-crimson-red/30 rounded-2xl p-4 flex items-start gap-3"
              >
                <Wine className="text-crimson-red mt-1 shrink-0" size={20} />
                <p className="text-white/85 text-base leading-relaxed text-right">
                  {currentTask.drinkingRule}
                </p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <Button onClick={handleComplete} size="lg" className="w-full text-xl group">
                השלמתי את המשימה
                <CheckCircle className="ml-2 group-hover:scale-110 transition-transform text-white/80" />
              </Button>

              <Button onClick={handleReplace} variant="secondary" className="w-full">
                החלף משימה
                <RefreshCw className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
