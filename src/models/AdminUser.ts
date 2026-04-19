import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'owner' | 'admin';
  sessionVersion: number;
  active: boolean;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  passwordHash: { type: String, required: true, select: false },
  name: { type: String, trim: true, default: '', maxlength: 120 },
  role: {
    type: String,
    enum: ['owner', 'admin'],
    default: 'admin',
  },
  sessionVersion: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

AdminUserSchema.index({ email: 1 }, { unique: true });

try {
  mongoose.deleteModel('AdminUser');
} catch {}

export default mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
