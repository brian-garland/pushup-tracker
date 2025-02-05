import { Request, Response } from 'express';
import { startOfDay, endOfDay, subDays } from 'date-fns';
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

    // Create entry date based on the user's timezone
    const userTimezone = req.get('Timezone') || 'UTC';
    const entryDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());
    console.log('Entry date:', entryDate);
    console.log('User timezone:', userTimezone);

    // Check if entry already exists for the specified date
    const existingEntry = await PushupEntry.findOne({
      userId,
      date: {
        $gte: startOfDay(entryDate),
        $lt: endOfDay(entryDate)
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

    const response = {
      entry: {
        ...entry.toObject(),
        date: new Date(entry.date)
      },
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

    const query: any = { userId };

    if (startDate && endDate) {
      // Convert string dates to Date objects and use startOfDay/endOfDay
      const start = startOfDay(new Date(startDate as string));
      const end = endOfDay(new Date(endDate as string));
      
      console.log('Date range:', { start, end });

      // Use actual Date objects in the query, not strings
      query.date = {
        $gte: start,
        $lte: end
      };

      // Log the actual query with dates
      console.log('MongoDB query:', {
        ...query,
        date: {
          $gte: query.date.$gte.toISOString(),
          $lte: query.date.$lte.toISOString()
        }
      });
    }

    const entries = await PushupEntry.find(query).sort({ date: -1 });
    
    // Log entries with their dates for debugging
    console.log('Found entries:', entries.map(entry => ({
      id: entry._id,
      date: entry.date,
      count: entry.count
    })));
    
    if (entries.length === 0) {
      console.log('No entries found for the query');
    }
    
    res.json(entries);
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

  const today = new Date();
  let currentStreak = 0;
  let maxStreak = 0;
  let consecutiveDays = 0;

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
  let currentDate = startOfDay(today);
  console.log('Starting current streak calculation from:', format(currentDate, 'yyyy-MM-dd'));
  
  while (true) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayEntry = entriesByDate[dateKey];

    console.log('Checking date for current streak:', {
      date: dateKey,
      hasEntry: !!dayEntry,
      goalMet: dayEntry?.goalMet,
      isToday: currentDate.getTime() === startOfDay(today).getTime()
    });

    if (dayEntry && dayEntry.goalMet) {
      currentStreak++;
      console.log('Streak day found, current streak:', currentStreak);
      currentDate = subDays(currentDate, 1);
    } else {
      // If we're checking today and there's no entry, that's okay
      if (currentDate.getTime() === startOfDay(today).getTime() && !dayEntry) {
        console.log('No entry for today, continuing to check previous days');
        currentDate = subDays(currentDate, 1);
        continue;
      }
      console.log('Streak break found, ending current streak calculation');
      break;
    }
  }

  // Calculate longest streak using a sliding window approach
  console.log('Starting longest streak calculation');
  let tempStreak = 0;
  let prevDate: Date | null = null;

  // Sort entries by date ascending for longest streak calculation
  const ascendingEntries = [...dailyEntries].sort((a, b) => a.date.getTime() - b.date.getTime());

  ascendingEntries.forEach((entry) => {
    if (!entry.goalMet) {
      maxStreak = Math.max(maxStreak, tempStreak);
      tempStreak = 0;
      prevDate = null;
      console.log('Non-goal day found, resetting streak:', {
        date: format(entry.date, 'yyyy-MM-dd'),
        maxStreak
      });
      return;
    }

    if (!prevDate) {
      tempStreak = 1;
      prevDate = entry.date;
      console.log('Starting new streak:', {
        date: format(entry.date, 'yyyy-MM-dd'),
        tempStreak
      });
    } else {
      const dayDiff = Math.round((entry.date.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (dayDiff === 1) {
        tempStreak++;
        console.log('Consecutive day found:', {
          date: format(entry.date, 'yyyy-MM-dd'),
          tempStreak,
          dayDiff
        });
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
        console.log('Gap in streak found:', {
          date: format(entry.date, 'yyyy-MM-dd'),
          dayDiff,
          maxStreak
        });
      }
      prevDate = entry.date;
    }
  });

  // Handle the final streak
  maxStreak = Math.max(maxStreak, tempStreak);

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