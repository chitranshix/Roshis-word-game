/**
 * Daily word logic — deterministic random pick per calendar day,
 * shared across all users (seeded by date string).
 * Streak tracking in localStorage.
 */

const STREAK_KEY = 'roshi_streak'

export interface StreakData {
  lastDate: string   // YYYY-MM-DD
  count:    number
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Simple seeded RNG — mulberry32 */
function seededRandom(seed: number): () => number {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/** Pick today's word index from a list of N words */
export function dailyIndex(totalWords: number): number {
  const today  = todayStr()
  const seed   = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rng    = seededRandom(seed)
  return Math.floor(rng() * totalWords)
}

/** Pick today's word name from an array of GRE words (server-side use) */
export function getDailyWordName(words: { word: string }[]): string {
  const today = new Date().toISOString().slice(0, 10)
  const seed  = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const s = seed + 0x6D2B79F5 | 0
  let t = Math.imul(s ^ s >>> 15, 1 | s)
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
  const idx = ((t ^ t >>> 14) >>> 0) % words.length
  return words[idx].word
}

export function getStreak(): StreakData {
  if (typeof window === 'undefined') return { lastDate: '', count: 0 }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : { lastDate: '', count: 0 }
  } catch {
    return { lastDate: '', count: 0 }
  }
}

export function markDailyDone(): StreakData {
  const today    = todayStr()
  const existing = getStreak()

  // Already done today — don't double-count
  if (existing.lastDate === today) return existing

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newCount  = existing.lastDate === yesterday ? existing.count + 1 : 1
  const updated   = { lastDate: today, count: newCount }

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
  } catch { /* storage full */ }

  return updated
}

export function hasDoneToday(): boolean {
  return getStreak().lastDate === todayStr()
}
