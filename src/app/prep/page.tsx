'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/context/GameContext';
import RoundIndicator from '@/components/RoundIndicator';
import { Music, ArrowRight } from 'lucide-react';

export default function PrepPage() {
  const router = useRouter();
  const { round, maxIntensity } = useGame();

  const handleCreateTask = () => {
    router.push('/task');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full relative"
    >
      {/* Top Bar — Round Indicator */}
      <div className="absolute top-0 left-0 px-4 py-3">
        <RoundIndicator round={round} maxIntensity={maxIntensity} />
      </div>

      <div className="w-full max-w-md space-y-8 text-center mt-16">
        <div className="space-y-3">
          <h2 className="text-3xl font-playfair font-bold text-white drop-shadow-md">
            {round === 1 ? 'הכנות אחרונות...' : 'מוכנים לסיבוב הבא?'}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            {round === 1
              ? 'כדי להיכנס לאווירה, אנחנו ממליצים להדליק מוזיקה חושנית ולהעמעם את האורות.'
              : 'קחו רגע לנשום, למזוג משקה ולהתכונן...'}
          </p>
        </div>

        {round === 1 && (
          <motion.div
            className="game-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center space-x-3 space-x-reverse text-gold mb-4">
              <Music size={22} />
              <h3 className="text-lg font-medium">המלצות פלייליסט</h3>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://www.youtube.com/results?search_query=romantic+sexy+vibes+playlist"
                target="_blank"
                rel="noopener noreferrer"
                className="song-link"
              >
                <span className="text-lg">🎵</span>
                <div className="text-right">
                  <span className="text-white block font-medium text-sm">Romantic / Sexy Vibes R&B</span>
                  <span className="text-white/40 text-xs">מוזיקת אווירה קצבית וחושנית</span>
                </div>
              </a>
              <a
                href="https://www.youtube.com/results?search_query=dark+sensual+music+mix"
                target="_blank"
                rel="noopener noreferrer"
                className="song-link"
              >
                <span className="text-lg">🌙</span>
                <div className="text-right">
                  <span className="text-white block font-medium text-sm">Dark Sensual Mix</span>
                  <span className="text-white/40 text-xs">ביטים עמוקים ומהפנטים</span>
                </div>
              </a>
            </div>
          </motion.div>
        )}

        <div className="pt-4">
          <p className="text-white/40 mb-5 text-xs tracking-wide">כשתהיו מוכנים, לחצו כאן</p>
          <Button onClick={handleCreateTask} size="lg" className="w-full text-xl group">
            {round === 1 ? 'צור משימה' : 'משימה הבאה'}
            <ArrowRight className="mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
