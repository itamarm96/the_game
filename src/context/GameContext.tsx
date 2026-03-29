'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  type TaskEntry,
  type RewardEntry,
  pickTask,
  pickReward,
  getMaxIntensity,
  INTENSITY_CONFIG,
} from '@/lib/inspirationDb';

type GameContextType = {
  round: number;
  currentTask: TaskEntry | null;
  currentReward: RewardEntry | null;
  usedTaskIds: number[];
  usedRewardIds: number[];
  maxIntensity: 1 | 2 | 3;
  intensityLabel: string;
  intensityIcon: string;

  generateTask: () => TaskEntry;
  generateReward: () => RewardEntry;
  setCurrentTask: (task: TaskEntry | null) => void;
  setCurrentReward: (reward: RewardEntry | null) => void;
  advanceRound: () => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [round, setRound] = useState(1);
  const [currentTask, setCurrentTask] = useState<TaskEntry | null>(null);
  const [currentReward, setCurrentReward] = useState<RewardEntry | null>(null);
  const [usedTaskIds, setUsedTaskIds] = useState<number[]>([]);
  const [usedRewardIds, setUsedRewardIds] = useState<number[]>([]);

  const maxIntensity = getMaxIntensity(round);
  const intensityLabel = INTENSITY_CONFIG[maxIntensity].label;
  const intensityIcon = INTENSITY_CONFIG[maxIntensity].icon;

  const generateTask = useCallback(() => {
    const { entry, resetIds } = pickTask(round, usedTaskIds);
    if (resetIds) {
      setUsedTaskIds([entry.id]);
    } else {
      setUsedTaskIds((prev) => [...prev, entry.id]);
    }
    setCurrentTask(entry);
    return entry;
  }, [round, usedTaskIds]);

  const generateReward = useCallback(() => {
    const { entry, resetIds } = pickReward(round, usedRewardIds);
    if (resetIds) {
      setUsedRewardIds([entry.id]);
    } else {
      setUsedRewardIds((prev) => [...prev, entry.id]);
    }
    setCurrentReward(entry);
    return entry;
  }, [round, usedRewardIds]);

  const advanceRound = useCallback(() => {
    setRound((prev) => prev + 1);
    setCurrentTask(null);
    setCurrentReward(null);
  }, []);

  const resetGame = useCallback(() => {
    setRound(1);
    setCurrentTask(null);
    setCurrentReward(null);
    setUsedTaskIds([]);
    setUsedRewardIds([]);
  }, []);

  return (
    <GameContext.Provider
      value={{
        round,
        currentTask,
        currentReward,
        usedTaskIds,
        usedRewardIds,
        maxIntensity,
        intensityLabel,
        intensityIcon,
        generateTask,
        generateReward,
        setCurrentTask,
        setCurrentReward,
        advanceRound,
        resetGame,
      }}
    >
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
