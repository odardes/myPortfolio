'use client';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'chart' | 'form';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  type = 'card', 
  count = 1,
  className = ''
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        );
      
      case 'list':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        );
      
      case 'form':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className} role="status" aria-label="Yükleniyor" aria-live="polite">
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
      <span className="sr-only">İçerik yükleniyor...</span>
    </div>
  );
}
