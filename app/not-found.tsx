import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="relative mb-12">
          {/* Decorative elements */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-2xl" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-600/20 dark:bg-blue-500/20 rounded-full blur-xl" />
          
          {/* Main content */}
          <h1 className="text-8xl font-arabic mb-4 text-blue-600 dark:text-blue-400 relative">
            ٤٠٤
          </h1>
          <div className="text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Page Not Found
          </div>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              "And Allah knows, while you do not know"
            </p>
            <p className="text-sm italic text-gray-500 dark:text-gray-500">
              (Al-Baqarah: 216)
            </p>
          </div>
        </div>
        
        <Link href="/" className="inline-block">
          <Button 
            variant="outline" 
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 