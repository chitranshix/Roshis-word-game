'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import StarButton from '@/components/ui/StarButton'
import { createClient } from '@/lib/supabase'
import styles from './words.module.css'

interface WordEntry { word: string; definition: string }

export default function WordsPage() {
  const [words, setWords]     = useState<WordEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('point_events')
        .select('word, definition')
        .eq('user_id', user.id)
        .not('word', 'is', null)
        .order('created_at', { ascending: false })

      // Deduplicate by word, keep first (most recent) definition
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

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>
          Words learned
          {!loading && <span className={styles.count}>{words.length}</span>}
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : words.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>nothing yet.</div>
            <div className={styles.emptyHint}>play a daily or complete a dare to start building your list.</div>
          </div>
        ) : (
          <div className={styles.list}>
            {words.map(w => (
              <div key={w.word} className={styles.row}>
                <div className={styles.info}>
                  <div className={styles.word}>{w.word}</div>
                  {w.definition
                    ? <div className={styles.def}>{w.definition}</div>
                    : <div className={styles.defMissing}>—</div>
                  }
                </div>
                <StarButton word={w.word} definition={w.definition} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
