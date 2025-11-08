import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[...Array(2)].map((_, i) => (
          <div key={`proj-${i}`} className="flex items-center gap-4 p-4 apple-blur rounded-2xl">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={`doc-${i}`} className="flex items-center gap-4 p-4 apple-blur rounded-2xl">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}