import { Suspense } from 'react';
import { getAllSurahs } from '@/lib/services/quran';
import SurahList from '@/components/surah-list';
import { Skeleton } from '@/components/ui/skeleton';

async function SurahListContainer() {
  const response = await getAllSurahs();
  const surahs = response.data;

  return <SurahList surahs={surahs} />;
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-neutral-950 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Explore the Holy Quran
            </h1>
            <div className="w-24 h-1 bg-sky-500 mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
              Discover and read all 114 surahs of the Holy Quran. Each surah contains divine wisdom and guidance for humanity.
            </p>
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-6" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-6 w-16 ml-auto" />
                      <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <SurahListContainer />
          </Suspense>
        </div>
      </main>
    </div>
  );
} 