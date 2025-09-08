import { Suspense } from 'react';
import { getAllSurahs, getJuzById } from '@/lib/services/quran';
import SurahList from '@/components/surah-list';
import { Skeleton } from '@/components/ui/skeleton';

async function SurahListContainer() {
  const response = await getAllSurahs();
  const surahs = response.data;

  // Pre-load Juz data for explore page (all 30 Juz)
  let juzData: any[] = [];
  let juzError = false;
  
  try {
    // Load all 30 Juz in batches to avoid timeout
    const batchSize = 10;
    const totalJuz = 30;
    
    for (let i = 0; i < totalJuz; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, totalJuz - i) }, (_, j) => 
        getJuzById(i + j + 1)
      );
      
      try {
        const batchResults = await Promise.all(batch);
        juzData.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < totalJuz) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (batchError) {
        console.error(`Error fetching Juz batch ${i + 1}-${i + batchSize}:`, batchError);
        // Continue with next batch
      }
    }
  } catch (error) {
    console.error("Error pre-loading Juz data:", error);
    juzError = true;
  }

  return (
    <SurahList 
      surahs={surahs} 
      preloadedJuzData={juzData.length > 0 ? juzData : undefined}
      juzLoadingError={juzError}
    />
  );
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