import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Play, SkipBack, SkipForward, History, Search, MoreVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const reciters = [
  { name: "Mishary Bin Rashid Alafasy", img: "/placeholder.svg?width=80&height=80&circle=true&text=MRA" },
  { name: "Abdul Rahman Al-Sudais", img: "/placeholder.svg?width=80&height=80&circle=true&text=ARS" },
  { name: "Abdul-Basit Abdul-Samad", img: "/placeholder.svg?width=80&height=80&circle=true&text=AAS" },
  { name: "Yasser Al Dosari", img: "/placeholder.svg?width=80&height=80&circle=true&text=YAD" },
  { name: "Abdul Aziz Bin Bandar Baleela", img: "/placeholder.svg?width=80&height=80&circle=true&text=AAB" },
  { name: "Abdur Rahman Al Ossi", img: "/placeholder.svg?width=80&height=80&circle=true&text=ARO" },
]

const learningMaterials = [
  { title: "Grand Mosque", img: "/placeholder.svg?width=100&height=100&text=Mosque" },
  { title: "Kaaba", img: "/placeholder.svg?width=100&height=100&text=Kaaba" },
  { title: "Holy Quran", img: "/placeholder.svg?width=100&height=100&text=Quran" },
]

export default function Sidebar() {
  return (
    <div className="space-y-8">
      {/* Translation Section */}
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>
              Translation by Dr. Mustafa Khattab, the Clear Quran{" "}
              <a href="#" className="text-sky-600">
                (Change)
              </a>
            </p>
            <a href="#" className="flex items-center text-sky-600">
              <History className="h-3 w-3 mr-1" /> History of Surah
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-right font-arabic text-2xl text-sky-700 my-4">
            <p>بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
            <p>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</p>
            <p>الرَّحْمَـٰنِ الرَّحِيمِ</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            In the Name of Allah—the Most Compassionate, Most Merciful.
            <br />
            All praise is for Allah—Lord of all worlds,
            <br />
            The Most Compassionate, Most Merciful.
          </p>
          {/* Mini Player for Surah */}
          <div className="border border-gray-200 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-sm text-gray-700">Surah Al-Fatihah (The Opener)</p>
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </div>
            <Progress value={60} className="w-full h-1 bg-sky-100 [&>div]:bg-sky-500" />
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>00:28</span>
              <span>00:40</span>
            </div>
            <div className="flex items-center justify-center space-x-4 mt-3 text-gray-600">
              <SkipBack className="h-5 w-5 cursor-pointer hover:text-sky-600" />
              <button className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-600">
                <Play className="h-5 w-5 fill-white" />
              </button>
              <SkipForward className="h-5 w-5 cursor-pointer hover:text-sky-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reciters Section */}
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Enjoy Holy Quran recited by your preferred reciters.</CardTitle>
          <div className="flex justify-between items-center mt-2">
            <div className="relative w-full sm:w-auto flex-grow mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Find your favorite reciter"
                className="pl-10 rounded-lg border-gray-300 w-full text-sm"
              />
            </div>
            <a href="#" className="text-sky-600 hover:text-sky-700 font-medium text-sm whitespace-nowrap">
              See All Reciters &gt;
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {reciters.map((reciter) => (
              <div key={reciter.name} className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-gray-200">
                  <AvatarImage src={reciter.img || "/placeholder.svg"} alt={reciter.name} />
                  <AvatarFallback>{reciter.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-gray-700">{reciter.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Section */}
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Learn Quran and Islam basics everyday.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {learningMaterials.map((item) => (
              <div key={item.title} className="text-center">
                <img
                  src={item.img || "/placeholder.svg"}
                  alt={item.title}
                  className="rounded-lg mb-2 mx-auto w-full h-auto aspect-square object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
