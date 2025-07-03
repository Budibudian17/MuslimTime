import { getSurahById } from "@/lib/services/quran";
import { notFound } from "next/navigation";
import SurahDetail from "@/app/surah/[id]/surah-detail";

export default async function SurahPage({ params }: { params: { id: string } }) {
  try {
    const surahData = await getSurahById(parseInt(params.id));
    
    if (!surahData) {
      return notFound();
    }

    return <SurahDetail initialData={surahData} />;
  } catch (error) {
    console.error('Error loading surah:', error);
    return notFound();
  }
} 