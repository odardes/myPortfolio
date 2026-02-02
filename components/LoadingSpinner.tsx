'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  'aria-label': ariaLabel = 'Yükleniyor'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400 rounded-full animate-spin ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
