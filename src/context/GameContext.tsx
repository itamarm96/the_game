'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type GameContent = {
  title: string;
  description: string;
  drinkingRule: string;
};

type GameContextType = {
  taskCount: number;
  currentTask: GameContent | null;
  currentReward: GameContent | null;
  isLoading: boolean;
  incrementTaskCount: () => void;
  setCurrentTask: (task: GameContent | null) => void;
  setCurrentReward: (reward: GameContent | null) => void;
  setIsLoading: (loading: boolean) => void;
  resetGame: () => void;
  level: number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [taskCount, setTaskCount] = useState(0);
  const [currentTask, setCurrentTask] = useState<GameContent | null>(null);
  const [currentReward, setCurrentReward] = useState<GameContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const incrementTaskCount = () => setTaskCount(prev => prev + 1);
  const resetGame = () => {
    setTaskCount(0);
    setCurrentTask(null);
    setCurrentReward(null);
  };

  // Each completed task-reward cycle = 1 level. No cap.
  const level = Math.floor(taskCount / 2) + 1;

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
