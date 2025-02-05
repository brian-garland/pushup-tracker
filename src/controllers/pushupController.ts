import { Request, Response } from 'express';
import PushupEntry from '../models/PushupEntry';
import User from '../models/User';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const createEntry = async (req: Request, res: Response) => {
  try {
    const { count } = req.body;
    const userId = (req as any).user._id;

    // Get user's daily goal
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if entry already exists for today
    const today = new Date();
    const existingEntry = await PushupEntry.findOne({
      userId,
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today)
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'Entry already exists for today' });
    }

    // Create new entry
    const entry = new PushupEntry({
      userId,
      date: today,
      count,
      goalMet: count >= user.dailyGoal
    });

    await entry.save();

    // Update user's streak
    const yesterday = subDays(today, 1);
    const yesterdayEntry = await PushupEntry.findOne({
      userId,
      date: {
        $gte: startOfDay(yesterday),
        $lte: endOfDay(yesterday)
      }
    });

    if (yesterdayEntry && yesterdayEntry.goalMet) {
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    } else {
      user.currentStreak = 1;
    }

    await user.save();

    res.status(201).json({
      entry,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { startDate, endDate } = req.query;

    const query: any = { userId };

    if (startDate && endDate) {
      query.date = {
        $gte: startOfDay(new Date(startDate as string)),
        $lte: endOfDay(new Date(endDate as string))
      };
    }

    const entries = await PushupEntry.find(query).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
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

    const entry = await PushupEntry.findOneAndDelete({ _id: id, userId });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Recalculate streak
    await updateUserStreak(userId);

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to update user's streak
async function updateUserStreak(userId: string) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  let currentDate = today;
  let streak = 0;

  while (true) {
    const entry = await PushupEntry.findOne({
      userId,
      date: {
        $gte: startOfDay(currentDate),
        $lte: endOfDay(currentDate)
      }
    });

    if (!entry || !entry.goalMet) break;
    
    streak += 1;
    currentDate = subDays(currentDate, 1);
  }

  user.currentStreak = streak;
  if (streak > user.longestStreak) {
    user.longestStreak = streak;
  }

  await user.save();
} 