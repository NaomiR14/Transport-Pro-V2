"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeTest() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Current theme: <strong>{theme}</strong>
      </p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setTheme("light")}
          className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded"
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className="px-2 py-1 text-xs bg-slate-700 text-white hover:bg-slate-600 rounded"
        >
          Dark
        </button>
        <button onClick={() => setTheme("system")} className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded">
          System
        </button>
      </div>
    </div>
  )
}
