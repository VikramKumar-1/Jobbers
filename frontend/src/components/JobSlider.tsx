import { useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import JobCard, { Job } from './JobCard';
import Skeleton from './Skeleton';

interface JobSliderProps {
  title: string;
  icon?: ReactNode;
  jobs: Job[];
  loading?: boolean;
  type?: string;
}

export default function JobSlider({ title, icon, jobs, loading, type }: JobSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-3">
      <div className="flex justify-between items-end mb-2.5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scroll('left')}
            className="p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hidden sm:block"
          ><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => scroll('right')}
            className="p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hidden sm:block"
          ><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => navigate(`/jobs-list?type=${type || 'latest'}&title=${encodeURIComponent(title)}`)}
            className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline ml-1"
          >See More</button>
        </div>
      </div>

      <div className="relative">
        <div ref={scrollRef}
          className="flex overflow-x-auto gap-3 px-4 sm:px-6 lg:px-8 pb-3 hide-scrollbar max-w-7xl mx-auto snap-x snap-mandatory"
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-none w-[280px] min-w-[280px] max-w-[280px] sm:w-[320px] sm:min-w-[320px] sm:max-w-[320px] h-[185px] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-xl p-4 snap-start">
                <Skeleton className="w-3/4 h-5 mb-3" />
                <Skeleton className="w-1/2 h-4 mb-6" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="w-16 h-5 rounded-md" />
                  <Skeleton className="w-16 h-5 rounded-md" />
                </div>
                <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-800">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-24 h-8 rounded-full" />
                </div>
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="w-full shrink-0 py-8 text-center bg-white dark:bg-[#161b22]/50 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center min-h-[140px] px-6">
              <span className="text-2xl mb-2">🔍</span>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                {type === 'latest' 
                  ? 'There are no latest jobs right now please' 
                  : 'No jobs found in this section'}
              </p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="snap-start flex-none w-[280px] min-w-[280px] max-w-[280px] sm:w-[320px] sm:min-w-[320px] sm:max-w-[320px] h-[185px]">
                <JobCard job={job} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
