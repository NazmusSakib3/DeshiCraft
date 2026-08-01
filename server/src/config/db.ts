import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  // Public DNS resolvers — fixes mongodb+srv SRV lookup failures on some ISP setups.
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']); // NOSONAR intentional public DNS fallback
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log(`[db] connected to MongoDB (${mongoose.connection.name})`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
