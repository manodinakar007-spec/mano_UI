import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Users, BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import { pathApi } from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function LearningPathDetailPage() {
  const { pathId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['learning-path', pathId],
    queryFn: () => pathApi.get(pathId).then((response) => response.data),
    retry: 1,
  });

  if (isLoading) {
    return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Learning path not found</h1>
        <Link to="/learning-paths" className="btn-primary">Back to Learning Paths</Link>
      </div>
    );
  }

  const path = data.path || data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/learning-paths" className="inline-flex items-center gap-2 text-brand-600 mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Learning Paths
      </Link>

      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-8 md:p-12 mb-8">
        <p className="text-brand-300 font-semibold uppercase tracking-wide mb-3">{path.category}</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-5">{path.title}</h1>
        <p className="text-gray-300 leading-relaxed">{path.description || path.short_description}</p>

        <div className="flex flex-wrap gap-6 mt-8 text-sm">
          <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {path.duration_weeks || 'Flexible'} weeks</span>
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {path.course_count} courses</span>
          <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {Number(path.enrolled_count || 0).toLocaleString()} enrolled</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Skills you'll develop</h2>
            {path.skills?.length ? (
              <ul className="grid sm:grid-cols-2 gap-3">
                {path.skills.map((skill, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500" /> {skill}
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500">Skills information will be available soon.</p>}
          </section>

          <section className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Included courses</h2>
            {path.courses?.length ? (
              <ul className="space-y-3">
                {path.courses.map((course, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <BookOpen className="h-5 w-5 text-brand-600" /> {course}
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500">Course details will be available soon.</p>}
          </section>
        </div>

        <aside className="border border-gray-200 rounded-xl p-6 h-fit">
          <p className="text-3xl font-bold mb-2">
            {Number(path.price) === 0 ? 'Free' : `${path.currency || 'USD'} ${path.price}`}
          </p>
          <p className="text-gray-500 capitalize mb-6">{path.level} level</p>
          <Link to="/courses" className="btn-primary block text-center w-full">
            Explore Courses
          </Link>
        </aside>
      </div>
    </div>
  );
}
