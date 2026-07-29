import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log(`[db] connected to MongoDB (${mongoose.connection.name})`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
