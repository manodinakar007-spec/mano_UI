import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, ShoppingCart, BookOpen } from 'lucide-react';
import { courseApi, enrollmentApi, cartApi } from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function EnrollmentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseApi.get(courseId).then((r) => r.data),
    placeholderData: { id: courseId, title: 'Course', price: 79.99, instructor: { name: 'Instructor' } },
  });

  const enrollMutation = useMutation({
    mutationFn: () =>
      course?.price === 0
        ? enrollmentApi.enroll(courseId)
        : cartApi.add({ courseId, type: 'course' }),
    onSuccess: () => {
      navigate(course?.price === 0 ? '/dashboard' : '/checkout');
    },
  });

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enroll in this Course</h1>
        <p className="text-gray-500 mb-6">{course.title}</p>
        <p className="text-gray-500 mb-1 text-sm">Instructor: <span className="font-medium text-gray-900">{course.instructor?.name}</span></p>
        <p className="text-3xl font-bold text-gray-900 mb-8 mt-4">
          {course.price === 0 ? 'Free' : `$${course.price?.toFixed(2)}`}
        </p>

        {course.price === 0 ? (
          <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Instant access</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Certificate included</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> No credit card required</li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 30-day money-back guarantee</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Lifetime access</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Certificate on completion</li>
          </ul>
        )}

        <button
          onClick={() => enrollMutation.mutate()}
          disabled={enrollMutation.isPending}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          {enrollMutation.isPending ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : <ShoppingCart className="h-5 w-5" />}
          {course.price === 0 ? 'Enroll Now — Free' : 'Add to Cart & Checkout'}
        </button>
      </div>
    </div>
  );
}
