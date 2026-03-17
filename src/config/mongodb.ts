import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://admin:password@localhost:27018/supportflow?authSource=admin';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.log('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
