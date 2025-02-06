import React from 'react';
import { Card, CardContent, Typography, Box, Grid, styled, alpha } from '@mui/material';
import { format, eachDayOfInterval, subDays, isToday, startOfDay, parseISO } from 'date-fns';
import type { PushupEntry } from '../types';

const getEntryForDate = (date: Date) => {
  const formattedSearchDate = format(startOfDay(date), 'yyyy-MM-dd');
  
  const foundEntry = entries.find(entry => {
    const entryDate = parseISO(entry.date);
    const formattedEntryDate = format(startOfDay(entryDate), 'yyyy-MM-dd');
    return formattedSearchDate === formattedEntryDate;
  });
  
  return foundEntry;
};

// Get last 28 days using startOfDay to normalize the time in local timezone
const today = startOfDay(new Date());

const daysToShow = eachDayOfInterval({
  start: subDays(today, 27),
  end: today,
}).map(date => startOfDay(date));

const CalendarView: React.FC<CalendarViewProps> = ({ 
  entries, 
  dailyGoal,
  onDayClick,
  selectedDate 
}) => {
  // @ts-ignore
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // ... rest of the code ...
}; 