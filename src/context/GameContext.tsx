'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type GameContextType = {
  taskCount: number;
  currentTask: string | null;
  currentReward: string | null;
  isLoading: boolean;
  incrementTaskCount: () => void;
  setCurrentTask: (task: string | null) => void;
  setCurrentReward: (reward: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  resetGame: () => void;
  level: number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [taskCount, setTaskCount] = useState(0);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [currentReward, setCurrentReward] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const incrementTaskCount = () => setTaskCount(prev => prev + 1);
  const resetGame = () => {
    setTaskCount(0);
    setCurrentTask(null);
    setCurrentReward(null);
  };

  const level = Math.min(Math.floor(taskCount / 5) + 1, 5); // Example: every 5 tasks increases level, cap at 5.

  return (
    <GameContext.Provider value={{
      taskCount, currentTask, currentReward, isLoading,
      incrementTaskCount, setCurrentTask, setCurrentReward, setIsLoading, resetGame, level
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
