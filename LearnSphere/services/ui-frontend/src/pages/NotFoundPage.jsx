import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <Zap className="h-16 w-16 text-brand-200 mb-4" />
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-2">Page not found</p>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
