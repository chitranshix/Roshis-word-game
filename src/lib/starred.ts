import { createClient } from '@/lib/supabase'

const KEY = 'roshi_starred'

export interface StarredWord {
  word:       string
  definition: string
  starredAt:  string  // ISO date
}

export function getStarred(): StarredWord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function isStarred(word: string): boolean {
  return getStarred().some(w => w.word === word)
}

export async function toggleStar(word: string, definition: string): Promise<boolean> {
  const current = getStarred()
  const idx     = current.findIndex(w => w.word === word)
  const adding  = idx < 0

  // Update localStorage immediately (fast)
  if (adding) {
    localStorage.setItem(KEY, JSON.stringify([
      { word, definition, starredAt: new Date().toISOString() },
      ...current,
    ]))
  } else {
    localStorage.setItem(KEY, JSON.stringify(current.filter((_, i) => i !== idx)))
  }

  // Sync to Supabase in background
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    if (adding) {
      await supabase.from('starred_words').upsert({ user_id: user.id, word, definition }, { onConflict: 'user_id,word' })
    } else {
      await supabase.from('starred_words').delete().eq('user_id', user.id).eq('word', word)
    }
  }

  return adding
}
