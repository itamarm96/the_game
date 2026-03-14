'use client';

import React, { useEffect, useRef } from 'react';

export const AudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioCtx = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Deep, sensual soft click for UI buttons
  const playClick = () => {
    try {
      const ctx = initAudioCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Use a low sine wave for a deep, soft "thud"/heartbeat feel
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      
      // Gentle fade out
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    } catch(e) {
      console.warn("Audio play failed", e);
    }
  };

  // Magical, romantic intro chime for the entrance screen
  const playIntro = () => {
    try {
      const ctx = initAudioCtx();

      // We'll play a quick arpeggio (chord) to sound luxurious and welcoming
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (C Major)
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = ctx.currentTime + (index * 0.1); // Stagger the notes
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5); // Long resonant tail
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 1.5);
      });
    } catch(e) {
      console.warn("Audio intro failed", e);
    }
  };

  // Attach to window object so it can be called globally
  useEffect(() => {
    (window as any).playClickSound = playClick;
    (window as any).playIntroSound = playIntro;
  }, []);

  return null;
};
