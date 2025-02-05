import mongoose from 'mongoose';

export interface IPushupEntry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  count: number;
  goalMet: boolean;
  createdAt: Date;
}

const pushupEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 0
  },
  goalMet: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of user's entries by date
pushupEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.model<IPushupEntry>('PushupEntry', pushupEntrySchema); 