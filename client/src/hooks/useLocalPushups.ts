import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { PushupEntry } from '../types';

interface LocalPushupState {
  entries: PushupEntry[];
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
}

const STORAGE_KEY = 'pushup_tracker_data';

const calculateStreak = (entries: PushupEntry[], dailyGoal: number): { current: number; longest: number } => {
  if (!entries.length) return { current: 0, longest: 0 };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let currentDate = new Date();
  
  // Calculate current streak
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const expectedDate = new Date(currentDate);
    expectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (
      entryDate.getTime() === currentDate.getTime() && 
      entry.count >= dailyGoal
    ) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    
    if (!prevDate) {
      tempStreak = entry.count >= dailyGoal ? 1 : 0;
    } else {
      const dayDiff = Math.floor(
        (prevDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1 && entry.count >= dailyGoal) {
        tempStreak++;
      } else {
        tempStreak = entry.count >= dailyGoal ? 1 : 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = entryDate;
  }

  return { current: currentStreak, longest: longestStreak };
};

export const useLocalPushups = () => {
  const [state, setState] = useState<LocalPushupState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      entries: [],
      dailyGoal: 100,
      currentStreak: 0,
      longestStreak: 0
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addEntry = (count: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newEntry: PushupEntry = {
      _id: Date.now().toString(),
      userId: 'local',
      date: today,
      count,
      goalMet: count >= state.dailyGoal,
      createdAt: new Date().toISOString()
    };

    const newEntries = [...state.entries, newEntry];
    const { current, longest } = calculateStreak(newEntries, state.dailyGoal);

    setState(prev => ({
      ...prev,
      entries: newEntries,
      currentStreak: current,
      longestStreak: Math.max(longest, prev.longestStreak)
    }));

    return newEntry;
  };

  const updateDailyGoal = (newGoal: number) => {
    setState(prev => ({
      ...prev,
      dailyGoal: newGoal
    }));
  };

  const getEntries = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return state.entries;

    return state.entries.filter(entry => {
      const entryDate = entry.date;
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  return {
    entries: state.entries,
    dailyGoal: state.dailyGoal,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    addEntry,
    updateDailyGoal,
    getEntries
  };
}; 