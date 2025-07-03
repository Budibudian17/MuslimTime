import { getJuzById, getJuzTranslation } from "@/lib/services/quran";
import { notFound } from "next/navigation";
import JuzDetail from "@/app/juz/[id]/juz-detail";

export default async function JuzPage({ params }: { params: { id: string } }) {
  try {
    const [juzData, translationData] = await Promise.all([
      getJuzById(parseInt(params.id)),
      getJuzTranslation(parseInt(params.id))
    ]);
    
    if (!juzData || !translationData) {
      return notFound();
    }

    // Combine Arabic text and translation
    const combinedData = {
      ...juzData,
      ayahs: juzData.ayahs.map((ayah, index) => ({
        ...ayah,
        translation: translationData.ayahs[index].text
      }))
    };

    return <JuzDetail initialData={combinedData} />;
  } catch (error) {
    console.error('Error loading juz:', error);
    return notFound();
  }
} 