'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import StarButton from '@/components/ui/StarButton'
import { createClient } from '@/lib/supabase'
import { getStarred, isStarred } from '@/lib/starred'
import styles from './words.module.css'

interface WordEntry { word: string; definition: string }

type Filter = 'all' | 'starred'

export default function WordsPage() {
  const [words, setWords]       = useState<WordEntry[]>([])
  const [starred, setStarred]   = useState<WordEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('all')

  useEffect(() => {
    // Load starred from localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setStarred(getStarred().map(s => ({ word: s.word, definition: s.definition })))

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('point_events')
        .select('word, definition')
        .eq('user_id', user.id)
        .not('word', 'is', null)
        .order('created_at', { ascending: false })

      const seen = new Set<string>()
      const unique: WordEntry[] = []
      for (const row of data ?? []) {
        if (!row.word || seen.has(row.word)) continue
        seen.add(row.word)
        unique.push({ word: row.word, definition: row.definition ?? '' })
      }
      setWords(unique)
      setLoading(false)
    })
  }, [])

  const displayed = filter === 'starred' ? starred : words

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>
          Words
          {!loading && <span className={styles.count}>{displayed.length}</span>}
        </div>

        <div className={styles.filterRow}>
          <button
            className={[styles.filterChip, filter === 'all' ? styles.filterActive : ''].join(' ')}
            onClick={() => setFilter('all')}
          >
            All · {words.length}
          </button>
          <button
            className={[styles.filterChip, filter === 'starred' ? styles.filterActive : ''].join(' ')}
            onClick={() => setFilter('starred')}
          >
            ★ Starred · {starred.length}
          </button>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>
              {filter === 'starred' ? 'nothing starred yet.' : 'nothing yet.'}
            </div>
            <div className={styles.emptyHint}>
              {filter === 'starred'
                ? 'tap ★ on any word after a round.'
                : 'play a daily or complete a dare to start building your list.'}
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {displayed.map(w => (
              <div key={w.word} className={styles.row}>
                <div className={styles.info}>
                  <div className={styles.word}>{w.word}</div>
                  {w.definition
                    ? <div className={styles.def}>{w.definition}</div>
                    : <div className={styles.defMissing}>—</div>
                  }
                </div>
                <StarButton
                  word={w.word}
                  definition={w.definition}
                  onToggle={() => setStarred(getStarred().map(s => ({ word: s.word, definition: s.definition })))}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
