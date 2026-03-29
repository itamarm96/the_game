'use client';

import React from 'react';

/**
 * Floating ambient particles rendered via pure CSS.
 * Creates a subtle, premium background effect.
 */
export default function FloatingParticles() {
  // Generate deterministic particles via CSS
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            animationDelay: `${(i * 1.7) % 12}s`,
            animationDuration: `${14 + (i % 8) * 2}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            opacity: 0.15 + (i % 5) * 0.06,
          }}
        />
      ))}
    </div>
  );
}
