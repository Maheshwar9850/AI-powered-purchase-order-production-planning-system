import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brake_pad_copilot';
    
    // Attempt connection to target MONGODB_URI with 3s timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to MongoDB host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] CRITICAL: Failed to connect to MongoDB at ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brake_pad_copilot'}`);
    console.error(`[Database] Error: ${error.message}`);
    console.error('[Database] Application cannot start without a valid database connection.');
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] Disconnected from MongoDB.');
  } catch (error) {
    console.error(`[Database] Error during disconnect: ${error.message}`);
  }
};

export default connectDB;
