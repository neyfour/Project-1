import mongoose from 'mongoose';

// Use environment variables with fallback values for browser environment
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/matrix-ecommerce';

export const connectDB = async () => {
  try {
    // In browser environment, we'll mock the connection
    if (typeof window !== 'undefined') {
      console.log('MongoDB connection simulated in browser environment');
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in browser environment
    if (typeof window === 'undefined') {
      // Only in Node.js environment
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    // In browser environment, we'll mock the disconnection
    if (typeof window !== 'undefined') {
      console.log('MongoDB disconnection simulated in browser environment');
      return;
    }
    
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};