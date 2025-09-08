import { Suspense } from "react";
import { getSurahById } from "@/lib/services/quran";
import { notFound } from "next/navigation";
import SurahDetail from "@/app/surah/[id]/surah-detail";

function SurahDetailSkeleton() {
  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950 relative text-gray-900 dark:text-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Header Skeleton */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="space-y-8 py-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-4 py-6">
                <div className="flex items-start justify-end gap-3 mb-4">
                  <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SurahPage({ params }: { params: { id: string } }) {
  try {
    const surahData = await getSurahById(parseInt(params.id));
    
    if (!surahData) {
      return notFound();
    }

    return (
      <Suspense fallback={<SurahDetailSkeleton />}>
        <SurahDetail initialData={surahData} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading surah:', error);
    return notFound();
  }
} 