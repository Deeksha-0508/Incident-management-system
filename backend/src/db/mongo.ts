import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const signalSchema = new mongoose.Schema({
  workItemId: String,
  componentId: String,
  errorType: String,
  severity: String,
  payload: mongoose.Schema.Types.Mixed,
  receivedAt: { type: Date, default: Date.now },
});

export const Signal = mongoose.model('Signal', signalSchema);

export const initMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URL!);
  console.log('✅ MongoDB initialized');
};
