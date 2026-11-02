import React from 'react';
import { clsx } from 'clsx';

export default function LoadingSpinner({ fullScreen = false, size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-200 border-t-brand-600',
        sizes[size],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
