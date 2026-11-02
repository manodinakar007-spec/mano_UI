import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, BookOpen, Users, Award, TrendingUp,
  Zap, Play, CheckCircle, Star, Globe, Shield, BarChart3,
} from 'lucide-react';
import { courseApi } from '../utils/api.js';
import CourseCard from '../components/common/CourseCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const STATS = [
  { label: 'Active Learners', value: '250K+', icon: Users, gradient: 'from-blue-500 to-brand-600' },
  { label: 'Expert-Led Courses', value: '3,500+', icon: BookOpen, gradient: 'from-violet-500 to-purple-600' },
  { label: 'Certifications Issued', value: '180K+', icon: Award, gradient: 'from-amber-500 to-orange-500' },
  { label: 'Skill Domains', value: '120+', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Personalized Learning Paths',
    desc: 'AI-curated paths tailored to your goals, role, and current skill level.',
    gradient: 'from-brand-500 to-violet-600',
    badge: 'AI-Powered',
  },
  {
    icon: Users,
    title: 'Live Mentoring Sessions',
    desc: 'Book 1:1 or cohort sessions with industry practitioners.',
    gradient: 'from-rose-500 to-pink-600',
    badge: 'Live',
  },
  {
    icon: Shield,
    title: 'Proctored Assessments',
    desc: 'Validate competencies with scenario-based skill tests.',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'Verified',
  },
  {
    icon: BarChart3,
    title: 'Team Analytics',
    desc: 'Track progress, identify skill gaps, and prove L&D ROI.',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'Enterprise',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Skillfyme transformed our engineering team\'s capabilities. ROI was clear within 3 months.',
    author: 'Sarah Chen',
    role: 'VP Engineering, TechCorp',
    initials: 'SC',
    rating: 5,
  },
  {
    quote: 'The personalized learning paths are incredible. My team upskilled 40% faster than traditional training.',
    author: 'Marcus Johnson',
    role: 'L&D Director, FinanceHub',
    initials: 'MJ',
    rating: 5,
  },
  {
    quote: 'Best enterprise LMS we\'ve ever used. The live mentoring feature alone is worth the investment.',
    author: 'Priya Nair',
    role: 'CHRO, GlobalTech',
    initials: 'PN',
    rating: 5,
  },
];

const AVATAR_INITIALS = ['SC', 'JW', 'MJ', 'PK'];

export default function HomePage() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => courseApi.featured().then((r) => r.data),
    placeholderData: [],
  });

  return (
    <div className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center bg-gray-950 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-brand-600/25 rounded-full blur-[140px] animate-blob" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-violet-700/20 rounded-full blur-[120px] animate-blob animate-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-brand-800/15 rounded-full blur-[100px] animate-blob animate-delay-4000" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 hero-grid pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: copy */}
            <div className="flex-1 max-w-2xl">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/25 rounded-full px-4 py-1.5 text-sm font-semibold text-brand-300 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
                #1 Enterprise Learning Platform
              </div>

              <h1 className="text-5xl md:text-[4.25rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6 text-balance">
                Build Skills That{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-accent-500">
                  Drive Results
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-9 max-w-xl">
                Personalized learning paths, live expert mentoring, and AI-powered assessments —
                built for modern enterprises at scale.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-[0_4px_24px_rgba(37,69,245,0.45)] hover:shadow-[0_8px_32px_rgba(37,69,245,0.55)] transition-all duration-200 active:scale-[0.97]"
                >
                  Start Learning Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/live-sessions"
                  className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                  </div>
                  Watch Demo
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {AVATAR_INITIALS.map((init, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 border-2 border-gray-950 flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>Trusted by 250,000+ professionals</span>
                </div>
              </div>
            </div>

            {/* Right: floating card decoration */}
            <div className="hidden xl:block flex-shrink-0 w-[320px]">
              <div className="flex flex-col gap-3 animate-float">
                {/* Main card */}
                <div className="glass p-5 shadow-[0_16px_64px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold leading-tight">Cloud-Native Architecture</p>
                      <p className="text-gray-400 text-xs">with Kubernetes</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 font-medium">Progress</span>
                      <span className="text-brand-400 font-bold">68%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-gradient-to-r from-brand-500 to-violet-500 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">24h · 18 modules</span>
                    <span className="bg-brand-500/20 text-brand-300 px-2.5 py-1 rounded-full border border-brand-500/25 font-semibold">
                      Intermediate
                    </span>
                  </div>
                </div>

                {/* Completion badge — stacked below, no overflow */}
                <div className="glass-card px-4 py-3 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-float animate-delay-1000 self-start">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">+1,240 Certifications</p>
                    <p className="text-gray-500 text-[10px]">issued this month</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gray-900 border-y border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map(({ label, value, icon: Icon, gradient }) => (
              <div key={label} className="text-center group">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-4xl font-extrabold text-white mb-1">{value}</p>
                <p className="text-sm text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Course Library</p>
              <h2 className="text-4xl font-extrabold text-gray-900">Featured Courses</h2>
              <p className="text-gray-500 mt-2 text-base">Handpicked by our curriculum team</p>
            </div>
            <Link to="/courses" className="btn-secondary text-sm self-start sm:self-auto whitespace-nowrap">
              View all courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(featured?.courses || PLACEHOLDER_COURSES).map((course) => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Why Skillfyme</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Everything your team needs to grow</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-lg">
              A unified platform covering the complete learning lifecycle — from skill discovery to certification.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, gradient, badge }) => (
              <div key={title} className="card p-6 group hover:-translate-y-1 transition-all duration-300">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="inline-block text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full mb-3">
                  {badge}
                </span>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-4xl font-extrabold text-white">Loved by learning teams worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, author, role, initials, rating }) => (
              <div key={author} className="glass p-6 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{author}</p>
                    <p className="text-gray-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-violet-500/20 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-balance">
            Ready to transform your team?
          </h2>
          <p className="text-brand-200 text-lg mb-10 max-w-xl mx-auto">
            Join 250,000+ learners from 5,000+ companies who trust Skillfyme for professional development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login?mode=register"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-extrabold text-base px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <Globe className="h-5 w-5" />
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const PLACEHOLDER_COURSES = [
  { id: '1', title: 'Cloud-Native Architecture with Kubernetes', category: 'Cloud & DevOps', level: 'intermediate', instructor: { name: 'Priya Mehta' }, rating: 4.8, reviewCount: 2341, durationHours: 24, enrolledCount: 18500, price: 79.99, currency: 'USD' },
  { id: '2', title: 'Full-Stack React & Node.js Development', category: 'Web Development', level: 'beginner', instructor: { name: 'James Whitfield' }, rating: 4.7, reviewCount: 5672, durationHours: 42, enrolledCount: 42000, price: 89.99, currency: 'USD' },
  { id: '3', title: 'Data Science with Python & ML', category: 'Data Science', level: 'intermediate', instructor: { name: 'Sara Chen' }, rating: 4.9, reviewCount: 3210, durationHours: 36, enrolledCount: 28000, price: 99.99, currency: 'USD' },
  { id: '4', title: 'Product Management Fundamentals', category: 'Product', level: 'beginner', instructor: { name: 'Rohan Kapoor' }, rating: 4.6, reviewCount: 1890, durationHours: 18, enrolledCount: 12000, price: 0, currency: 'USD' },
];
