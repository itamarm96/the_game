'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { INTENSITY_CONFIG } from '@/lib/inspirationDb';

interface RoundIndicatorProps {
  round: number;
  maxIntensity: 1 | 2 | 3;
}

export default function RoundIndicator({ round, maxIntensity }: RoundIndicatorProps) {
  const config = INTENSITY_CONFIG[maxIntensity];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      {/* Round number */}
      <div className="round-badge">
        <span className="text-white/50 text-[0.65rem] tracking-widest uppercase">סיבוב</span>
        <motion.span
          key={round}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-white font-bold text-lg leading-none tabular-nums"
        >
          {round}
        </motion.span>
      </div>

      {/* Intensity indicator */}
      <motion.div
        key={maxIntensity}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`intensity-badge intensity-${maxIntensity}`}
      >
        <span className="text-sm">{config.icon}</span>
        <span className="text-xs font-bold tracking-wide">{config.label}</span>
      </motion.div>
    </motion.div>
  );
}
