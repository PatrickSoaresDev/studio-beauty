import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  durationMinutes: number;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    durationMinutes: { type: Number, required: true, min: 15, max: 480 },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ name: 1 }, { unique: true });

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
