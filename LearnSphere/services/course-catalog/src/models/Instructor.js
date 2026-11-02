import mongoose from 'mongoose';

const InstructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    slug: { type: String, required: true, unique: true },
    title: String,
    bio: { type: String, maxlength: 1000 },
    avatarUrl: String,
    expertise: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String,
    },
    courseCount: { type: Number, default: 0 },
    totalLearners: { type: Number, default: 0 },
    avgRating: { type: Number, min: 0, max: 5 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Instructor = mongoose.model('Instructor', InstructorSchema);
