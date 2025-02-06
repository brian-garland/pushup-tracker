import mongoose from 'mongoose';
import PushupEntry from '../models/PushupEntry';
import { startOfDay } from 'date-fns';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pushup-tracker';

async function migrateDates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all entries
    const entries = await PushupEntry.find({});
    console.log(`Found ${entries.length} entries to migrate`);

    for (const entry of entries) {
      if (typeof entry.date === 'string') {
        // Convert string date to Date object
        const dateObj = startOfDay(new Date(entry.date));
        entry.date = dateObj;
        await entry.save();
        console.log(`Migrated entry ${entry._id} date from ${entry.date} to ${dateObj.toISOString()}`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDates(); 