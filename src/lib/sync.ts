/**
 * Syncs Supabase → localStorage on app load.
 * All existing code (progress.ts, daily.ts, starred.ts) keeps reading from
 * localStorage as before — this just keeps it up to date across devices.
 */
import { createClient } from '@/lib/supabase'
import { saveProgress } from '@/lib/progress'

export async function syncAll(userId: string): Promise<void> {
  if (typeof window === 'undefined') return
  const supabase = createClient()

  const [
    { data: levelEvents },
    { data: dailyEvents },
    { data: starredData },
  ] = await Promise.all([
    supabase
      .from('point_events')
      .select('word, level')
      .eq('user_id', userId)
      .eq('source', 'level')
      .not('word', 'is', null),
    supabase
      .from('point_events')
      .select('created_at')
      .eq('user_id', userId)
      .eq('source', 'daily')
      .order('created_at', { ascending: false }),
    supabase
      .from('starred_words')
      .select('word, definition')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  // ── Level progress ──────────────────────────────────────────────
  if (levelEvents?.length) {
    const completed: Record<number, string[]> = {}
    for (const e of levelEvents) {
      if (!e.word || !e.level) continue
      if (!completed[e.level]) completed[e.level] = []
      if (!completed[e.level].includes(e.word)) completed[e.level].push(e.word)
    }
    saveProgress({ level: 1, completed })
  }

  // ── Streak ──────────────────────────────────────────────────────
  if (dailyEvents) {
    // Deduplicate dates and sort descending
    const dates = [...new Set(dailyEvents.map(e => (e.created_at as string).slice(0, 10)))].sort().reverse()
    const today     = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    let count = 0
    let prev: string | null = null
    for (const d of dates) {
      if (prev === null) {
        if (d !== today && d !== yesterday) break
        count = 1; prev = d
      } else {
        const gap = Math.round((new Date(prev).getTime() - new Date(d).getTime()) / 86400000)
        if (gap === 1) { count++; prev = d } else break
      }
    }
    localStorage.setItem('roshi_streak', JSON.stringify({ lastDate: dates[0] ?? '', count }))
  }

  // ── Starred words ───────────────────────────────────────────────
  if (starredData?.length) {
    localStorage.setItem('roshi_starred', JSON.stringify(
      starredData.map(s => ({ word: s.word, definition: s.definition, starredAt: new Date().toISOString() }))
    ))
  }
}
