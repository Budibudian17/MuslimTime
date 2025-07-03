"use client"

import { Play, SkipBack, SkipForward, Shuffle, X, MoreVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function MiniMusicPlayer() {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg text-gray-700 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xs text-gray-500">Relaxation Radio (Surah)</p>
          <p className="font-semibold text-sm">Surah Al-Fatihah (The Opener)</p>
        </div>
        <MoreVertical className="h-5 w-5 text-gray-500 cursor-pointer" />
      </div>
      <Progress value={33} className="w-full h-1 bg-sky-100 [&>div]:bg-sky-500" />
      <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
        <span>00:24</span>
        <span>00:48</span>
      </div>
      <div className="flex items-center justify-around mt-3 text-gray-600">
        <Shuffle className="h-5 w-5 cursor-pointer hover:text-sky-600" />
        <SkipBack className="h-5 w-5 cursor-pointer hover:text-sky-600" />
        <button className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-600">
          <Play className="h-5 w-5 fill-white" />
        </button>
        <SkipForward className="h-5 w-5 cursor-pointer hover:text-sky-600" />
        <X className="h-5 w-5 cursor-pointer hover:text-sky-600" />
      </div>
    </div>
  )
}
