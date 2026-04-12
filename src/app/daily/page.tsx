import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import DailyClient from './DailyClient'
import type { GREWord } from '@/lib/gre-words'

export const dynamic = 'force-dynamic'

/** Pick today's word — seeded by date so it's consistent all day */
function dailyWord(words: GREWord[]): GREWord {
  const today = new Date().toISOString().slice(0, 10)
  const seed  = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  // mulberry32 one step
  const s = seed + 0x6D2B79F5 | 0
  let t = Math.imul(s ^ s >>> 15, 1 | s)
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
  const idx = ((t ^ t >>> 14) >>> 0) % words.length
  return words[idx]
}

export default function DailyPage() {
  let words: GREWord[]
  try {
    // Pull from all levels combined for variety
    const allWords: GREWord[] = []
    for (let lvl = 1; lvl <= 11; lvl++) {
      const p = path.join(process.cwd(), `public/data/gre-level-${lvl}.json`)
      if (fs.existsSync(p)) {
        allWords.push(...JSON.parse(fs.readFileSync(p, 'utf-8')))
      }
    }
    words = allWords
  } catch {
    notFound()
  }

  const word = dailyWord(words!)
  return <DailyClient word={word} />
}
