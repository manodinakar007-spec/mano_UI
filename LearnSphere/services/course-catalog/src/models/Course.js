import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  lessons: { type: Number, default: 0 },
  duration: String,
  topics: [String],
});

const InstructorRefSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  title: String,
  avatarUrl: String,
}, { _id: false });

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    category: { type: String, required: true, index: true },
    subcategory: String,
    tags: [{ type: String, lowercase: true }],
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },
    language: { type: String, default: 'English' },
    instructor: { type: InstructorRefSchema, required: true },
    coInstructors: [InstructorRefSchema],

    // Curriculum
    modules: [ModuleSchema],
    learningOutcomes: [String],
    prerequisites: [String],
    targetAudience: [String],

    // Media
    thumbnail: String,
    previewVideo: String,
    coverImage: String,

    // Pricing
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    originalPrice: Number,

    // Stats
    durationHours: { type: Number, required: true, min: 0 },
    lectureCount: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });
CourseSchema.index({ category: 1, level: 1, status: 1 });
CourseSchema.index({ isFeatured: 1, status: 1 });
CourseSchema.index({ enrolledCount: -1 });
CourseSchema.index({ rating: -1 });

export const Course = mongoose.model('Course', CourseSchema);
