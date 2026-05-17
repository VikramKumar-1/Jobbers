import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export default function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden bg-gray-200 dark:bg-gray-800',
          circle ? 'rounded-full' : 'rounded',
          className
        )
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}
