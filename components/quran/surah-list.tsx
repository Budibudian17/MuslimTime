import { Surah } from '@/lib/types/quran';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface SurahListProps {
  surahs: Surah[];
}

export function SurahList({ surahs }: SurahListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {surahs.map((surah) => (
        <Link href={`/surah/${surah.number}`} key={surah.number}>
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {surah.number}. {surah.englishName}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {surah.revelationType}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-arabic mb-2">{surah.name}</div>
              <p className="text-xs text-muted-foreground">
                {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
} 