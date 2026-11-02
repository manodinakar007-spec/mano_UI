import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, Clock, BookOpen, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pathApi } from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function LearningPathsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => pathApi.list().then((r) => r.data),
    placeholderData: { paths: PLACEHOLDER_PATHS },
  });

  const paths = data?.paths || PLACEHOLDER_PATHS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
        <p className="text-gray-500 mt-1">Structured sequences of courses designed to take you from beginner to job-ready.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <div key={path.id} className="card p-6 flex flex-col gap-4 group hover:border-brand-200 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${path.color || 'bg-brand-100'}`}>
                <Layers className={`h-6 w-6 ${path.iconColor || 'text-brand-600'}`} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{path.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{path.description}</p>
              </div>

              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {path.courseCount} courses</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {path.durationWeeks} weeks</span>
                {path.isBestseller && (
                  <span className="flex items-center gap-1 text-accent-600 font-medium"><Zap className="h-3.5 w-3.5" /> Bestseller</span>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {path.price === 0 ? 'Free' : `$${path.price}`}
                </span>
                <Link to={`/learning-paths/${path.id}`} className="btn-secondary text-sm flex items-center gap-1">
                  View Path <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PLACEHOLDER_PATHS = [
  { id: '1', title: 'Full-Stack Web Developer', description: 'Master modern web development from HTML fundamentals to deploying scalable Node.js + React applications.', courseCount: 8, durationWeeks: 24, price: 199, isBestseller: true, color: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: '2', title: 'Cloud & DevOps Engineer', description: 'Learn AWS, Kubernetes, Terraform, CI/CD, and site reliability engineering practices used at scale.', courseCount: 10, durationWeeks: 32, price: 249, isBestseller: true, color: 'bg-orange-100', iconColor: 'text-orange-600' },
  { id: '3', title: 'Data Scientist & ML Engineer', description: 'From Python basics to productionizing machine learning models with MLOps best practices.', courseCount: 12, durationWeeks: 36, price: 299, isBestseller: false, color: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: '4', title: 'Cybersecurity Analyst', description: 'Build expertise in threat detection, incident response, penetration testing, and compliance frameworks.', courseCount: 9, durationWeeks: 28, price: 229, isBestseller: false, color: 'bg-red-100', iconColor: 'text-red-600' },
  { id: '5', title: 'Product Manager', description: 'Learn product strategy, user research, roadmapping, and agile delivery from practitioners at top companies.', courseCount: 6, durationWeeks: 20, price: 179, isBestseller: false, color: 'bg-green-100', iconColor: 'text-green-600' },
  { id: '6', title: 'AI & Generative AI Engineer', description: 'Dive deep into LLMs, prompt engineering, RAG architectures, and building production AI applications.', courseCount: 7, durationWeeks: 22, price: 0, isBestseller: true, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
];
