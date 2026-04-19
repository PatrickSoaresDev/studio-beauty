import mongoose, { Schema, Document } from 'mongoose';

export interface WorkDaySchedule {
  enabled: boolean;
  startMin: number;
  endMin: number;
  lunchStartMin: number | null;
  lunchEndMin: number | null;
}

export interface IWorkSchedule extends Document {
  singletonKey: string;
  days: WorkDaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

const DayScheduleSchema = new Schema<WorkDaySchedule>(
  {
    enabled: { type: Boolean, required: true },
    startMin: { type: Number, required: true, min: 0, max: 24 * 60 - 1 },
    endMin: { type: Number, required: true, min: 1, max: 24 * 60 },
    lunchStartMin: { type: Number, default: null, min: 0, max: 24 * 60 },
    lunchEndMin: { type: Number, default: null, min: 0, max: 24 * 60 },
  },
  { _id: false }
);

const WorkScheduleSchema = new Schema<IWorkSchedule>(
  {
    singletonKey: { type: String, required: true, unique: true, default: 'default' },
    days: {
      type: [DayScheduleSchema],
      required: true,
      validate: {
        validator: (v: unknown) => Array.isArray(v) && v.length === 7,
        message: 'São necessários 7 dias (domingo a sábado).',
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.WorkSchedule ||
  mongoose.model<IWorkSchedule>('WorkSchedule', WorkScheduleSchema);
