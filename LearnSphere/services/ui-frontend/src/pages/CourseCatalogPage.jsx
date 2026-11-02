import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { courseApi } from '../utils/api.js';
import CourseCard from '../components/common/CourseCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const LEVELS = ['All', 'beginner', 'intermediate', 'advanced'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseApi.categories().then((r) => r.data),
    placeholderData: { categories: [] },
  });

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ['courses', { search, level, category, sort, page }],
    queryFn: () =>
      courseApi.list({
        q: search || undefined,
        level: level !== 'All' ? level : undefined,
        category: category !== 'All' ? category : undefined,
        sort,
        page,
        limit: 12,
      }).then((r) => r.data),
    placeholderData: { courses: PLACEHOLDER_COURSES, total: PLACEHOLDER_COURSES.length, pages: 1 },
    retry: 1,
  });

  // Always show placeholder when API fails so the page is never empty
  const data = (isError || !rawData) ? { courses: PLACEHOLDER_COURSES, total: PLACEHOLDER_COURSES.length, pages: 1 } : rawData;

  const allCategories = ['All', ...(categories?.categories || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
        <p className="text-gray-500 mt-1">
          {data?.total?.toLocaleString() || '3,500+'} courses across 120+ skill domains
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search courses, skills, instructors..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input w-full md:w-48"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Level
              </h3>
              <div className="space-y-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLevel(l); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      level === l ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {l === 'All' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Category
              </h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      category === c ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Course Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <>
              {isError && (
                <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" /></svg>
                  Showing sample courses — live catalog unavailable. The backend service may be starting up.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {(data?.courses?.length ? data.courses : PLACEHOLDER_COURSES).map((course) => (
                  <CourseCard key={course._id || course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {data?.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {data.pages}</span>
                  <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_COURSES = [
  { id: '1', title: 'Cloud-Native Architecture with Kubernetes', category: 'Cloud & DevOps', level: 'intermediate', instructor: { name: 'Priya Mehta' }, rating: 4.8, reviewCount: 2341, durationHours: 24, enrolledCount: 18500, price: 79.99 },
  { id: '2', title: 'Full-Stack React & Node.js Development', category: 'Web Development', level: 'beginner', instructor: { name: 'James Whitfield' }, rating: 4.7, reviewCount: 5672, durationHours: 42, enrolledCount: 42000, price: 89.99 },
  { id: '3', title: 'Data Science with Python & ML', category: 'Data Science', level: 'intermediate', instructor: { name: 'Sara Chen' }, rating: 4.9, reviewCount: 3210, durationHours: 36, enrolledCount: 28000, price: 99.99 },
  { id: '4', title: 'Product Management Fundamentals', category: 'Product', level: 'beginner', instructor: { name: 'Rohan Kapoor' }, rating: 4.6, reviewCount: 1890, durationHours: 18, enrolledCount: 12000, price: 0 },
  { id: '5', title: 'Cybersecurity Essentials', category: 'Security', level: 'beginner', instructor: { name: 'Alex Torres' }, rating: 4.5, reviewCount: 1200, durationHours: 20, enrolledCount: 9000, price: 59.99 },
  { id: '6', title: 'Advanced Go Programming', category: 'Backend Development', level: 'advanced', instructor: { name: 'Wei Zhang' }, rating: 4.9, reviewCount: 890, durationHours: 30, enrolledCount: 7500, price: 94.99 },
];
