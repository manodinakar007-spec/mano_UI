import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, Cloud, Code2, Database, Shield, Cpu, TrendingUp, Layers, BookOpen, Palette } from 'lucide-react';
import { clsx } from 'clsx';

const LEVEL_STYLES = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

const CATEGORY_THEME = {
  'Cloud & DevOps':      { grad: 'from-sky-500 via-blue-600 to-indigo-700',      icon: Cloud,       dot1: '#38bdf8', dot2: '#818cf8' },
  'Web Development':     { grad: 'from-violet-500 via-purple-600 to-fuchsia-700', icon: Code2,       dot1: '#a78bfa', dot2: '#f0abfc' },
  'Data Science':        { grad: 'from-emerald-500 via-teal-600 to-cyan-700',     icon: Database,    dot1: '#34d399', dot2: '#22d3ee' },
  'Security':            { grad: 'from-rose-500 via-red-600 to-orange-600',       icon: Shield,      dot1: '#fb7185', dot2: '#fb923c' },
  'Backend Development': { grad: 'from-amber-500 via-orange-500 to-yellow-500',   icon: Cpu,         dot1: '#fbbf24', dot2: '#f97316' },
  'Product':             { grad: 'from-pink-500 via-rose-500 to-red-500',         icon: TrendingUp,  dot1: '#f472b6', dot2: '#fb7185' },
  'Machine Learning':    { grad: 'from-cyan-500 via-blue-500 to-indigo-600',      icon: Cpu,         dot1: '#22d3ee', dot2: '#818cf8' },
  'Design':              { grad: 'from-fuchsia-500 via-pink-500 to-rose-500',     icon: Palette,     dot1: '#e879f9', dot2: '#f472b6' },
  'default':             { grad: 'from-brand-500 via-brand-600 to-violet-700',    icon: Layers,      dot1: '#6366f1', dot2: '#a78bfa' },
};

function CardThumbnail({ category, title, level, price }) {
  const theme = CATEGORY_THEME[category] || CATEGORY_THEME['default'];
  const Icon = theme.icon;
  const initials = title
    ? title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'CS';

  return (
    <div className={`relative aspect-video bg-gradient-to-br ${theme.grad} overflow-hidden`}>
      {/* Decorative blobs */}
      <div
        className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-25"
        style={{ background: theme.dot1 }}
      />
      <div
        className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full opacity-20"
        style={{ background: theme.dot2 }}
      />
      {/* Dot-grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Centre icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase">
          {category || 'Course'}
        </span>
      </div>

      {/* Initials watermark */}
      <span className="absolute bottom-2 right-3 text-white/10 font-black text-4xl leading-none select-none pointer-events-none">
        {initials}
      </span>

      {/* Level badge */}
      <span
        className={clsx(
          'absolute top-3 left-3 text-[10px] font-bold capitalize px-2 py-0.5 rounded-full backdrop-blur-sm z-20',
          LEVEL_STYLES[level] || 'bg-white/90 text-gray-700',
        )}
      >
        {level}
      </span>

      {/* Free badge */}
      {price === 0 && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white z-20">
          Free
        </span>
      )}
    </div>
  );
}

export default function CourseCard({ course }) {
  const {
    _id, id, title, instructor, category, level,
    rating, reviewCount, durationHours, enrolledCount, price, currency = 'USD',
  } = course;

  const courseId = _id || id;

  return (
    <Link
      to={`/courses/${courseId}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
    >
      <CardThumbnail category={category} title={title} level={level} price={price} />

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-2.5">
        <div>
          <p className="text-xs font-extrabold text-brand-600 uppercase tracking-widest mb-1.5">{category}</p>
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-brand-700 transition-colors leading-snug">
            {title}
          </h3>
        </div>

        <p className="text-xs text-gray-500">
          by <span className="font-semibold text-gray-700">{instructor?.name || instructor}</span>
        </p>

        {/* Stars */}
        {rating && (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-extrabold text-gray-800">{rating.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount?.toLocaleString()})</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            {durationHours}h
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Users className="h-3.5 w-3.5" />
            {enrolledCount?.toLocaleString()}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-extrabold text-gray-900">
            {price === 0 ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              `$${price?.toFixed(2)}`
            )}
          </span>
          <span className="btn-primary text-xs px-3 py-1.5 rounded-lg">
            Enroll Now
          </span>
        </div>
      </div>
    </Link>
  );
}
