import { Button } from "@/components/ui/button"
import { LayoutGrid } from "lucide-react"

interface LayoutToggleProps {
  onMushafView: () => void
}

export default function LayoutToggle({ onMushafView }: LayoutToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-600 hover:text-sky-600"
      onClick={onMushafView}
    >
      <LayoutGrid className="h-5 w-5" />
    </Button>
  )
} 