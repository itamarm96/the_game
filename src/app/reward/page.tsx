'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGame, type GameContent } from '@/context/GameContext';
import { Play, ArrowRight, Pause, Home, Wine } from 'lucide-react';

export default function RewardPage() {
  const router = useRouter();
  const { currentReward, setCurrentReward, incrementTaskCount, setCurrentTask, level } = useGame();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const TOTAL_TIME = 180; // 3 minutes
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReward = useCallback(async () => {
    setLocalLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reward', level })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reward');
      setCurrentReward(data.result as GameContent);
      setIsTimerRunning(true);
    } catch (err: any) {
      setError("אופס, משהו השתבש. נסה שוב.");
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  }, [level, setCurrentReward]);

  useEffect(() => {
    if (!currentReward) {
      fetchReward();
    } else {
      setIsTimerRunning(true);
    }
  }, [currentReward, fetchReward]);

  // Heartbeat sound via Web Audio API
  const playHeartbeat = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(50, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Ignore if audio context not allowed
    }
  }, []);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        playHeartbeat();
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsTimerRunning(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, playHeartbeat]);

  const handleNextTask = () => {
    setIsTimerRunning(false);
    setTimeLeft(TOTAL_TIME);
    incrementTaskCount();
    setCurrentTask(null);
    setCurrentReward(null);
    router.push('/task');
  };

  const handleHome = () => {
    setIsTimerRunning(false);
    router.push('/prep');
  };

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const progressPercentage = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
            <div className="w-16 h-16 border-t-2 border-gold rounded-full animate-spin"></div>
            <p className="text-white/70">מכין את הפרס של המנצח...</p>
          </motion.div>
        ) : error ? (
           <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <p className="text-red-400">{error}</p>
            <Button onClick={fetchReward} variant="outline">נסה שוב</Button>
          </motion.div>
        ) : currentReward ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center"
          >
            {/* Dynamic Reward Title */}
            <motion.h1
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-playfair font-bold text-gold mb-6 drop-shadow-lg leading-snug"
            >
              🏆 {currentReward.title}
            </motion.h1>

            {/* Reward Card */}
            <div className="bg-black/40 backdrop-blur-lg border border-gold/30 rounded-2xl p-7 mb-6 w-full shadow-[0_0_30px_rgba(255,215,0,0.1)] relative">
              {/* Description — scrollable */}
              <div className="max-h-[35vh] overflow-y-auto custom-scrollbar mb-5">
                <p className="text-white text-lg leading-relaxed font-light">
                  {currentReward.description}
                </p>
              </div>

              {/* Drinking Rule */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gold/10 border border-gold/25 rounded-2xl p-4 flex items-start gap-3"
              >
                <Wine className="text-gold mt-1 shrink-0" size={20} />
                <p className="text-white/85 text-base leading-relaxed text-right">
                  {currentReward.drinkingRule}
                </p>
              </motion.div>
            </div>

            {/* Timer UI */}
            <div className="w-full mb-10 space-y-4">
              <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-white/60 text-sm">זמן נותר</span>
                <span className={`text-2xl font-mono font-bold ${timeLeft < 30 ? 'text-crimson-red animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
                <button onClick={toggleTimer} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-crimson-red to-red-500 rounded-full shadow-[0_0_10px_rgba(220,20,60,0.8)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>
            </div>

            <Button onClick={handleNextTask} size="lg" className="w-full text-xl group" variant="outline">
              בואו נמשיך למשימה הבאה
              <ArrowRight className="ml-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
