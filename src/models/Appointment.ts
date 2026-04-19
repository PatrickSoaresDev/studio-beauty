import mongoose, { Schema, Document, Types } from 'mongoose';
import { APPOINTMENT_STATUS } from '@/lib/appointment-status';

export interface IAppointment extends Document {
  clientName: string;
  clientPhone: string;
  serviceType: string;
  serviceId?: Types.ObjectId;
  durationMinutes?: number;
  status?: (typeof APPOINTMENT_STATUS)[number];
  date: Date;
  createdAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  serviceType: { type: String, required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  durationMinutes: { type: Number, default: 60, min: 15, max: 480 },
  status: {
    type: String,
    enum: APPOINTMENT_STATUS,
    default: 'pending',
  },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ date: 1, status: 1 });

try {
  mongoose.deleteModel('Appointment');
} catch {}

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
