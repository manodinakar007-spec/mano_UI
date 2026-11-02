import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle, Clock, Award, TrendingUp, Play, Flame, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { enrollmentApi } from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const STATS_CONFIG = [
  { key: 'enrolled', label: 'Enrolled Courses', gradient: 'from-brand-500 to-violet-600' },
  { key: 'inProgress', label: 'In Progress', gradient: 'from-amber-500 to-orange-500' },
  { key: 'completed', label: 'Completed', gradient: 'from-emerald-500 to-teal-600' },
  { key: 'hours', label: 'Hours Learned', gradient: 'from-purple-500 to-violet-600' },
];

const STAT_ICONS = {
  enrolled: BookOpen,
  inProgress: TrendingUp,
  completed: CheckCircle,
  hours: Clock,
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: enrollments, isLoading, isError } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: () => enrollmentApi.myEnrollments().then((r) => r.data),
    retry: 1,
    enabled: true,
  });

  // API returns { enrollments: [...] } or just [...]
  const rawList = enrollments?.enrollments ?? (Array.isArray(enrollments) ? enrollments : null);
  const courses = (!isError && rawList) ? rawList : [];
  const completed = courses.filter((e) => e.progress === 100).length;
  const inProgress = courses.filter((e) => e.progress > 0 && e.progress < 100).length;
  const totalHours = courses.reduce((sum, e) => sum + (e.course?.durationHours || 0), 0);

  const statValues = {
    enrolled: courses.length,
    inProgress,
    completed,
    hours: totalHours,
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Welcome banner ── */}
      <div className="relative bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-brand-900/40 to-transparent" />
          <div className="absolute inset-0 hero-grid" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-orange-400 text-sm font-bold">3-day streak — keep it up!</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋
              </h1>
              <p className="text-gray-400 mt-1">Pick up where you left off and keep the momentum going.</p>
            </div>
            <Link to="/courses" className="btn-primary self-start sm:self-auto whitespace-nowrap">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS_CONFIG.map(({ key, label, gradient }) => {
            const Icon = STAT_ICONS[key];
            return (
              <div key={key} className="card p-5 group hover:-translate-y-0.5 transition-all duration-300">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{statValues[key]}</p>
                <p className="text-sm text-gray-500 mt-0.5 font-medium">{label}</p>
              </div>
            );
          })}
        </div>

        {/* ── My Courses ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">My Courses</h2>
              <p className="text-sm text-gray-500 mt-0.5">Continue where you left off</p>
            </div>
            <Link
              to="/courses"
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-bold transition-colors"
            >
              Browse more <Target className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No courses yet</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
                You haven't enrolled in any courses yet. Browse the catalog and start learning today!
              </p>
              <Link to="/courses" className="btn-primary text-sm px-6 py-2.5">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((enrollment) => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EnrollmentCard({ enrollment }) {
  const isCompleted = enrollment.progress === 100;
  const isStarted = enrollment.progress > 0;
  const title = enrollment.course?.title || enrollment.title;

  return (
    <div className="card p-5 flex gap-4 group hover:-translate-y-0.5 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
        <BookOpen className="h-6 w-6 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 leading-snug">{title}</h3>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-gray-400">Progress</span>
            <span className={isCompleted ? 'text-emerald-600' : 'text-brand-600'}>
              {enrollment.progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-brand-500 to-violet-500'
              }`}
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <Link
            to={`/courses/${enrollment.courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
              <Play className="h-2.5 w-2.5 fill-brand-600 text-brand-600 ml-px" />
            </div>
            {!isStarted ? 'Start course' : isCompleted ? 'Review' : 'Continue'}
          </Link>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Award className="h-3 w-3" />
              Certificate earned
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
