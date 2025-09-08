"use client"

import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-neutral-950 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 dark:bg-neutral-800 rounded-full mb-4 border border-gray-200 dark:border-gray-700">
              <img src="/logo.png" alt="MuslimTime Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-sky-200">About MuslimTime</h1>
            <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
              A modern, serene companion for your daily worship: read the Qur'an, listen to beautiful recitations, and keep track of accurate prayer times — all in one place.
            </p>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl p-6 border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                We aim to make accessing the Qur'an and Islamic essentials easy, beautiful, and distraction‑free. MuslimTime focuses on clarity, speed, and reverence, so you can engage with the Qur'an anywhere, anytime.
              </p>
            </div>
            <div className="rounded-xl p-6 border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold mb-2">What You Can Do</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>Browse all 114 surahs with clear Arabic and translations</li>
                <li>Listen to recitations from renowned reciters</li>
                <li>Track daily prayer times with a clean interface</li>
                <li>Sign in to keep your reading history synced</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Simplicity", desc: "Thoughtful UI that stays out of your way." },
              { title: "Reliability", desc: "Fast loads, accurate data, and offline‑friendly UX." },
              { title: "Respect", desc: "Design and features centered on adab and focus." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-6 border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Ready to begin or continue your journey?</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/explore" className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition">
                Explore the Qur'an
              </Link>
              <Link href="/" className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium bg-white border border-gray-200 text-sky-700 hover:bg-gray-50 transition dark:bg-neutral-900 dark:border-gray-700 dark:text-sky-300 dark:hover:bg-neutral-800">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


