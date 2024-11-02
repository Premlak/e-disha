import mongoose from "mongoose";
export const connectDB = async () => {
    try {
      if (mongoose.connection.readyState === 0) {
          mongoose.set('strictPopulate', false);
          await mongoose.connect('mongodb+srv://horizoncoreteam:VMFQ6WC3oGVlpdcx@cluster0.dzk6bfg.mongodb.net/');
      }
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
};