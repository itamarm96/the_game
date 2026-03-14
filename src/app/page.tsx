'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function EntrancePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/prep');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <h1 className="text-6xl md:text-7xl font-playfair font-bold text-center mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl">
          The Game
        </h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1 bg-gradient-to-r from-transparent via-crimson-red to-transparent mb-12"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-white/60 text-lg mb-16 font-light tracking-widest uppercase"
        >
          A night to remember
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="w-full max-w-xs"
      >
        <Button onClick={handleStart} size="lg" className="w-full text-xl shadow-[0_0_20px_rgba(220,20,60,0.6)]">
          להתחיל את הלילה
        </Button>
      </motion.div>

      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-900/20 rounded-full blur-[100px] pointer-events-none -z-10" />
    </div>
  );
}
