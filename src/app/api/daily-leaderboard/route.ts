import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getDailyWordName } from '@/lib/daily'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerSupabase()

  // Load all words to find today's word
  const allWords: { word: string }[] = []
  for (let lvl = 1; lvl <= 11; lvl++) {
    const p = path.join(process.cwd(), `public/data/gre-level-${lvl}.json`)
    if (fs.existsSync(p)) allWords.push(...JSON.parse(fs.readFileSync(p, 'utf-8')))
  }
  const todayWord = getDailyWordName(allWords)

  // Today's date window
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Fetch all daily point_events for today's word
  const { data: events } = await supabase
    .from('point_events')
    .select('user_id, points, created_at')
    .eq('word', todayWord)
    .eq('source', 'daily')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: true })

  if (!events?.length) {
    return NextResponse.json({ word: todayWord, entries: [], total: 0 })
  }

  // Deduplicate: keep best score per user (earliest time as tiebreak — already ordered)
  const byUser = new Map<string, { points: number; created_at: string }>()
  for (const e of events) {
    const existing = byUser.get(e.user_id)
    if (!existing || e.points > existing.points) {
      byUser.set(e.user_id, { points: e.points, created_at: e.created_at })
    }
  }

  // Fetch names
  const userIds = [...byUser.keys()]
  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .in('id', userIds)

  const nameMap = new Map((users ?? []).map(u => [u.id, u.name as string]))

  // Sort: points desc, then time asc
  const sorted = [...byUser.entries()]
    .sort(([, a], [, b]) => b.points - a.points || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(([userId, { points, created_at }], i) => ({
      rank: i + 1,
      userId,
      name: nameMap.get(userId) ?? 'Unknown',
      points,
      completedAt: created_at,
    }))

  return NextResponse.json({ word: todayWord, entries: sorted, total: sorted.length })
}
