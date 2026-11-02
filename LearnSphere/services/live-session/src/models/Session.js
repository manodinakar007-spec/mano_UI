import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    format: {
      type: String,
      enum: ['webinar', 'workshop', 'mentoring', 'qa', 'bootcamp'],
      required: true,
    },
    instructor: {
      id: String,
      name: { type: String, required: true },
      title: String,
      avatarUrl: String,
    },
    courseId: { type: String, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    capacity: { type: Number, required: true },
    enrolledCount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    meetingUrl: String,
    recordingUrl: String,
    isLive: { type: Boolean, default: false },
    isRecorded: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    tags: [String],
    enrolledUsers: [{ type: String }],
  },
  { timestamps: true }
);

SessionSchema.index({ scheduledAt: 1, status: 1 });
SessionSchema.index({ format: 1, status: 1 });

export const Session = mongoose.model('Session', SessionSchema);
