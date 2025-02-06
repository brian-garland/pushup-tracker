import { Request, Response } from 'express';
import { startOfDay, endOfDay, subDays, parseISO } from 'date-fns';
import { toZonedTime, getTimezoneOffset } from 'date-fns-tz';
import PushupEntry from '../models/PushupEntry';
import User from '../models/User';
import { format } from 'date-fns';

export const createEntry = async (req: Request, res: Response) => {
  try {
    console.log('Creating entry with body:', req.body);
    const { count, date } = req.body;
    const userId = (req as any).user._id;
    console.log('User ID:', userId);

    // Get user's daily goal
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Found user:', { id: user._id, name: user.name, dailyGoal: user.dailyGoal });

    // Get user's timezone
    const userTimezone = req.get('Timezone') || 'UTC';
    console.log('User timezone:', userTimezone);

    // Create entry date based on the user's timezone
    let entryDate;
    if (date) {
      // For past dates, parse the ISO string and convert to UTC while preserving the local date
      const localDate = parseISO(date);
      const zonedDate = toZonedTime(localDate, userTimezone);
      entryDate = startOfDay(zonedDate);
      console.log('Past date entry:', { 
        providedDate: date,
        localDate: format(localDate, 'yyyy-MM-dd'),
        zonedDate: format(zonedDate, 'yyyy-MM-dd'),
        entryDate: format(entryDate, 'yyyy-MM-dd')
      });
    } else {
      // For today's entry, use current date in user's timezone
      const nowInUserTz = toZonedTime(new Date(), userTimezone);
      entryDate = startOfDay(nowInUserTz);
      console.log('Today\'s entry:', {
        userDate: format(nowInUserTz, 'yyyy-MM-dd'),
        entryDate: format(entryDate, 'yyyy-MM-dd')
      });
    }

    // Check if entry already exists for the specified date in user's timezone
    const dayStart = startOfDay(entryDate);
    const dayEnd = endOfDay(entryDate);
    
    console.log('Searching for existing entry between:', {
      dayStart: format(dayStart, 'yyyy-MM-dd HH:mm:ss'),
      dayEnd: format(dayEnd, 'yyyy-MM-dd HH:mm:ss')
    });

    const existingEntry = await PushupEntry.findOne({
      userId,
      date: {
        $gte: dayStart,
        $lt: dayEnd
      }
    });
    console.log('Existing entry:', existingEntry);

    let entry;
    if (existingEntry) {
      // Update existing entry
      console.log('Updating existing entry');
      existingEntry.count = count;
      existingEntry.goalMet = count >= user.dailyGoal;
      entry = await existingEntry.save();
      console.log('Updated entry:', entry);
    } else {
      // Create new entry
      console.log('Creating new entry');
      entry = new PushupEntry({
        userId,
        date: entryDate,
        count,
        goalMet: count >= user.dailyGoal
      });
      await entry.save();
      console.log('Created new entry:', entry);
    }

    // Update user's streak
    await updateUserStreak(userId);
    
    // Fetch the updated user to get the new streak values
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      throw new Error('User not found after updating streak');
    }

    // Format the entry date consistently
    const formattedEntry = {
      ...entry.toObject(),
      date: format(startOfDay(new Date(entry.date)), 'yyyy-MM-dd')
    };

    const response = {
      entry: formattedEntry,
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak
    };
    console.log('Sending response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error in createEntry:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEntries = async (req: Request, res: Response) => {
  try {
    console.log('Getting entries with query params:', req.query);
    const userId = (req as any).user._id;
    const { startDate, endDate } = req.query;
    console.log('User ID:', userId);

    // Get user's timezone
    const userTimezone = req.get('Timezone') || 'UTC';
    console.log('User timezone:', userTimezone);

    const query: any = { userId };

    if (startDate && endDate) {
      // Convert string dates to Date objects and use startOfDay/endOfDay in user's timezone
      const startLocalDate = parseISO(startDate as string);
      const endLocalDate = parseISO(endDate as string);

      // Convert to UTC while preserving local dates
      const startZoned = toZonedTime(startLocalDate, userTimezone);
      const endZoned = toZonedTime(endLocalDate, userTimezone);
      const startOffset = getTimezoneOffset(userTimezone, startZoned);
      const endOffset = getTimezoneOffset(userTimezone, endZoned);

      const start = new Date(startOfDay(startZoned).getTime() - startOffset);
      const end = new Date(endOfDay(endZoned).getTime() - endOffset);
      
      console.log('Date range:', { 
        startLocal: format(startLocalDate, 'yyyy-MM-dd'),
        endLocal: format(endLocalDate, 'yyyy-MM-dd'),
        startUTC: format(start, 'yyyy-MM-dd HH:mm:ss'),
        endUTC: format(end, 'yyyy-MM-dd HH:mm:ss')
      });

      query.date = {
        $gte: start,
        $lte: end
      };
    }

    // Get all entries
    const entries = await PushupEntry.find(query);
    
    // Format and normalize all dates to user's timezone
    const formattedEntries = entries.map(entry => {
      // Convert UTC date to user's timezone
      const zonedDate = toZonedTime(new Date(entry.date), userTimezone);
      const normalizedDate = startOfDay(zonedDate);
      return {
        ...entry.toObject(),
        date: format(normalizedDate, 'yyyy-MM-dd')
      };
    });
    
    // Sort entries by date in descending order (most recent first)
    const sortedEntries = formattedEntries.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    console.log('Found entries:', sortedEntries.map(entry => ({
      id: entry._id,
      date: entry.date,
      count: entry.count
    })));
    
    if (sortedEntries.length === 0) {
      console.log('No entries found for the query');
    }
    
    res.json(sortedEntries);
  } catch (error) {
    console.error('Error in getEntries:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { count } = req.body;
    const userId = (req as any).user._id;

    const entry = await PushupEntry.findOne({ _id: id, userId });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Get user's daily goal
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    entry.count = count;
    entry.goalMet = count >= user.dailyGoal;
    await entry.save();

    // Recalculate streak
    await updateUserStreak(userId);

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    console.log('Deleting entry:', { id, userId });

    const entry = await PushupEntry.findOneAndDelete({ _id: id, userId });
    if (!entry) {
      console.log('Entry not found');
      return res.status(404).json({ error: 'Entry not found' });
    }

    console.log('Deleted entry:', entry);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error in deleteEntry:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to update user's streak
async function updateUserStreak(userId: string) {
  const user = await User.findById(userId);
  if (!user) return;

  // First, get all entries sorted by date
  const entries = await PushupEntry.find({ userId })
    .sort({ date: -1 });

  console.log('Raw entries:', entries.map(e => ({
    id: e._id,
    date: e.date,
    count: e.count,
    goalMet: e.goalMet
  })));

  // Group entries by date and check if any entry that day met the goal
  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = format(startOfDay(new Date(entry.date)), 'yyyy-MM-dd');
    console.log('Processing entry:', {
      dateKey,
      entryDate: entry.date,
      goalMet: entry.goalMet,
      count: entry.count
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: startOfDay(new Date(entry.date)),
        goalMet: entry.goalMet
      };
    } else {
      // If any entry that day met the goal, mark the day as completed
      acc[dateKey].goalMet = acc[dateKey].goalMet || entry.goalMet;
      console.log('Multiple entries for date:', dateKey, 'goalMet updated to:', acc[dateKey].goalMet);
    }
    return acc;
  }, {} as Record<string, { date: Date; goalMet: boolean }>);

  // Convert to array and sort by date
  const dailyEntries = Object.values(entriesByDate)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  console.log('Sorted daily entries:', 
    dailyEntries.map(entry => ({
      date: format(entry.date, 'yyyy-MM-dd'),
      goalMet: entry.goalMet
    }))
  );

  // Calculate current streak (must be consecutive days up to today)
  let currentStreak = 0;
  const today = startOfDay(new Date());
  let currentDate = today;
  
  console.log('Starting current streak calculation from:', format(currentDate, 'yyyy-MM-dd'));
  
  while (true) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayEntry = entriesByDate[dateKey];

    console.log('Checking date for current streak:', {
      date: dateKey,
      hasEntry: !!dayEntry,
      goalMet: dayEntry?.goalMet,
      isToday: currentDate.getTime() === today.getTime()
    });

    if (dayEntry && dayEntry.goalMet) {
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    } else {
      // If we're checking today and there's no entry, that's okay
      if (currentDate.getTime() === today.getTime() && !dayEntry) {
        console.log('No entry for today, continuing to check previous days');
        currentDate = subDays(currentDate, 1);
        continue;
      }
      console.log('Streak break found, ending current streak calculation');
      break;
    }
  }

  // Calculate all streaks (including historical ones)
  console.log('Starting all streaks calculation');
  let maxStreak = 0;
  let currentHistoricalStreak = 0;
  let lastDate: Date | null = null;

  // Sort entries by date ascending
  const ascendingEntries = [...dailyEntries].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (let i = 0; i < ascendingEntries.length; i++) {
    const entry = ascendingEntries[i];
    
    if (!entry.goalMet) {
      // Reset streak on non-goal days
      maxStreak = Math.max(maxStreak, currentHistoricalStreak);
      currentHistoricalStreak = 0;
      lastDate = null;
      console.log('Non-goal day found, resetting streak:', {
        date: format(entry.date, 'yyyy-MM-dd'),
        maxStreak
      });
      continue;
    }

    if (!lastDate) {
      // Start new streak
      currentHistoricalStreak = 1;
      lastDate = entry.date;
      console.log('Starting new streak:', {
        date: format(entry.date, 'yyyy-MM-dd'),
        currentHistoricalStreak
      });
    } else {
      const dayDiff = Math.round((entry.date.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (dayDiff === 1) {
        // Consecutive day
        currentHistoricalStreak++;
        console.log('Consecutive day found:', {
          date: format(entry.date, 'yyyy-MM-dd'),
          currentHistoricalStreak,
          dayDiff
        });
      } else {
        // Gap in streak
        maxStreak = Math.max(maxStreak, currentHistoricalStreak);
        currentHistoricalStreak = 1;
        console.log('Gap in streak found:', {
          date: format(entry.date, 'yyyy-MM-dd'),
          dayDiff,
          maxStreak
        });
      }
    }
    lastDate = entry.date;
  }

  // Handle the final streak
  maxStreak = Math.max(maxStreak, currentHistoricalStreak);

  // Update the user's streaks
  user.currentStreak = currentStreak;
  user.longestStreak = maxStreak;

  console.log('Final streak calculation:', {
    userId,
    currentStreak,
    longestStreak: maxStreak,
    entries: entries.length,
    uniqueDays: Object.keys(entriesByDate).length
  });

  await user.save();
} 