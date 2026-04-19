import mongoose, { Schema, Document } from 'mongoose';

export type ScheduleRuleType = 'closed_day' | 'blocked_hour';

export interface IScheduleRule extends Document {
  type: ScheduleRuleType;
  dateKey: string;
  hour?: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleRuleSchema = new Schema<IScheduleRule>(
  {
    type: { type: String, enum: ['closed_day', 'blocked_hour'], required: true },
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    hour: { type: Number, min: 0, max: 23 },
    note: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

ScheduleRuleSchema.index({ dateKey: 1, hour: 1 }, { unique: true });

export default mongoose.models.ScheduleRule ||
  mongoose.model<IScheduleRule>('ScheduleRule', ScheduleRuleSchema);
