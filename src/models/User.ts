import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'seller' | 'buyer';
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  avatar_url: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'seller', 'buyer'],
    default: 'buyer'
  },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);