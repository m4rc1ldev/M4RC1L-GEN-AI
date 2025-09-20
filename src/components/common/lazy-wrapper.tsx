"use client";

import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { ReactNode, forwardRef } from 'react';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyWrapper = forwardRef<HTMLDivElement, LazyWrapperProps>(
  ({ children, fallback, className = '', threshold = 0.1, rootMargin = '100px' }, forwardedRef) => {
    const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
      threshold,
      rootMargin,
      triggerOnce: true,
    });

    return (
      <div 
        ref={forwardedRef || ref} 
        className={className}
      >
        {isVisible ? children : (fallback || <div className="h-[200px] animate-pulse bg-muted/30 rounded-lg" />)}
      </div>
    );
  }
);

LazyWrapper.displayName = 'LazyWrapper';