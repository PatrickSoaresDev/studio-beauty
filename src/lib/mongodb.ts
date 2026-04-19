import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Por favor defina a variável de ambiente MONGODB_URI dentro do .env.local'
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const g = globalThis as typeof globalThis & { __mongooseCache?: MongooseCache };

function getCache(): MongooseCache {
  if (!g.__mongooseCache) {
    g.__mongooseCache = { conn: null, promise: null };
  }
  return g.__mongooseCache;
}

async function dbConnect() {
  const cached = getCache();
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => m);
  }
  cached.conn = await cached.promise;

  const g = global as typeof globalThis & { __appointmentStatusMigrated?: boolean };
  if (!g.__appointmentStatusMigrated) {
    g.__appointmentStatusMigrated = true;
    try {
      const { default: Appointment } = await import('@/models/Appointment');
      const now = new Date();
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      await Appointment.updateMany(
        { status: { $exists: false }, date: { $gte: startToday } },
        { $set: { status: 'pending' } }
      );
      await Appointment.updateMany({ status: { $exists: false } }, { $set: { status: 'confirmed' } });
    } catch (e) {
      console.error('Migração de status em agendamentos:', e);
    }
  }

  return cached.conn;
}

export default dbConnect;
