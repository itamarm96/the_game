'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, TimerReset } from 'lucide-react';

interface TaskTimerProps {
  totalSeconds: number;
  autoStart?: boolean;
  onComplete?: () => void;
  variant?: 'task' | 'reward';
}

export default function TaskTimer({
  totalSeconds,
  autoStart = false,
  onComplete,
  variant = 'task',
}: TaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isStarted, setIsStarted] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const isUrgent = timeLeft <= 30 && timeLeft > 0;

  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 80 : 50, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(isUrgent ? 0.5 : 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }, [isUrgent]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
        if (isUrgent || timeLeft % 3 === 0) {
          playTick();
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, isUrgent, playTick, onComplete]);

  const handleStart = () => {
    setIsStarted(true);
    setIsRunning(true);
  };

  const handleToggle = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    setIsComplete(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const accentColor = variant === 'reward' ? 'gold' : 'crimson-red';

  // Not yet started — show activation button
  if (!isStarted) {
    return (
      <motion.button
        onClick={handleStart}
        className="w-full mt-4 py-3 px-6 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm
                   flex items-center justify-center gap-3 text-white/80 hover:text-white hover:bg-white/10
                   transition-all group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Play size={18} className="text-gold" />
        </motion.div>
        <span className="text-sm font-medium">הפעל טיימר · {formatTime(totalSeconds)}</span>
      </motion.button>
    );
  }

  // Active timer
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="w-full mt-4 space-y-3"
    >
      {/* Timer display */}
      <div className="flex items-center justify-between px-1">
        <span className="text-white/50 text-xs font-medium tracking-wide">טיימר</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={timeLeft}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`text-2xl font-mono font-bold tabular-nums ${
              isComplete
                ? 'text-green-400'
                : isUrgent
                ? 'text-crimson-red animate-pulse'
                : 'text-white'
            }`}
          >
            {isComplete ? '✓' : formatTime(timeLeft)}
          </motion.span>
        </AnimatePresence>
        <div className="flex gap-2">
          {!isComplete && (
            <button
              onClick={handleToggle}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <TimerReset size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
        <motion.div
          className={`absolute top-0 right-0 h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-l from-green-400 to-green-600'
              : isUrgent
              ? 'bg-gradient-to-l from-crimson-red to-red-500 shadow-[0_0_12px_rgba(220,20,60,0.8)]'
              : variant === 'reward'
              ? 'bg-gradient-to-l from-gold to-amber-500 shadow-[0_0_8px_rgba(255,215,0,0.5)]'
              : 'bg-gradient-to-l from-crimson-red to-rose-500 shadow-[0_0_8px_rgba(220,20,60,0.5)]'
          }`}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 1 }}
        />
      </div>
    </motion.div>
  );
}
