'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/context/GameContext';
import { Music, ArrowRight } from 'lucide-react';

export default function PrepPage() {
  const router = useRouter();
  const { setIsLoading } = useGame();

  const handleCreateTask = () => {
    setIsLoading(true);
    router.push('/task');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full"
    >
      <div className="w-full max-w-md space-y-10 text-center">
        
        <div className="space-y-4">
          <h2 className="text-3xl font-playfair font-bold text-white drop-shadow-md">
            הכנות אחרונות...
          </h2>
          <p className="text-white/70">
            כדי להיכנס לאווירה, אנחנו ממליצים להדליק מוזיקה חושנית ולהעמעם את האורות.
          </p>
        </div>

        <motion.div 
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6"
          whileHover={{ borderColor: 'rgba(255, 215, 0, 0.3)' }}
        >
          <div className="flex items-center justify-center space-x-3 space-x-reverse text-gold">
            <Music size={24} />
            <h3 className="text-xl font-medium">המלצות פלייליסט (YouTube)</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <a href="https://www.youtube.com/results?search_query=romantic+sexy+vibes+playlist" target="_blank" rel="noopener noreferrer" 
               className="block bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-4 transition-colors">
              <span className="text-white block font-medium">Romantic / Sexy Vibes R&B</span>
              <span className="text-white/50 text-sm">מוזיקת אווירה קצבית וחושנית</span>
            </a>
            <a href="https://www.youtube.com/results?search_query=dark+sensual+music+mix" target="_blank" rel="noopener noreferrer" 
               className="block bg-black/20 hover:bg-black/40 border border-white/5 rounded-xl p-4 transition-colors">
              <span className="text-white block font-medium">Dark Sensual Mix</span>
              <span className="text-white/50 text-sm">ביטים עמוקים ומהפנטים</span>
            </a>
          </div>
        </motion.div>

        <div className="pt-8">
          <p className="text-white/50 mb-6 text-sm">כשתהיו מוכנים, לחצו כאן</p>
          <Button onClick={handleCreateTask} size="lg" className="w-full text-xl group">
            צור משימה
            <ArrowRight className="mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
    </motion.div>
  );
}
