'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.PropsWithChildren<Omit<HTMLMotionProps<"button">, "ref">> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, onClick, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none w-full overflow-hidden";
    
    const variants = {
      primary: "bg-gradient-to-r from-red-600 to-crimson-red text-white shadow-[0_0_15px_rgba(220,20,60,0.5)] hover:shadow-[0_0_25px_rgba(220,20,60,0.8)] border border-red-500/50",
      secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20",
      outline: "bg-transparent text-gold border border-gold hover:bg-gold/10 shadow-[0_0_10px_rgba(255,215,0,0.2)]"
    };
    
    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-14 px-8 text-lg",
      lg: "h-16 px-10 text-xl"
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play sound
      if (typeof window !== 'undefined' && (window as any).playClickSound) {
        (window as any).playClickSound();
      }
      if (onClick) onClick(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`\\${baseStyles} \\${variants[variant]} \\${sizes[size]} \\${className}`}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
             />
          ) : children}
        </span>
        
        {/* Glow effect on hover for primary */}
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
