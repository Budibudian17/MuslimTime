import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"

interface MushafLayoutProps {
  surahName: string
  arabicText: string[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onClose: () => void
}

export default function MushafLayout({
  surahName,
  arabicText,
  currentPage,
  totalPages,
  onPageChange,
  onClose
}: MushafLayoutProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-sky-600"
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Split View
          </Button>
        </div>

        {/* Header with Juz and Page navigation */}
        <div className="flex justify-between items-center mb-8 text-sky-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Juz</span>
            <ChevronRight className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Halaman</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Surah Title */}
        <div className="text-center mb-8">
          <h1 className="font-arabic text-3xl text-sky-600">{surahName}</h1>
        </div>

        {/* Quran Text */}
        <div className="space-y-6 mb-8">
          <div className="text-center font-arabic text-2xl leading-loose" dir="rtl">
            {arabicText.map((ayah, index) => (
              <span key={index} className="inline mx-2">
                {ayah}
                <span className="inline-block mx-2 text-sky-500">﴿{index + 1}﴾</span>
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            className="text-sky-600 hover:bg-sky-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Halaman Sebelumnya
          </Button>
          <Button
            variant="outline"
            className="text-sky-600 hover:bg-sky-50"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Halaman Selanjutnya
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
} 