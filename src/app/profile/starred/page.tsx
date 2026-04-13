'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { getStarred, toggleStar } from '@/lib/starred'
import type { StarredWord } from '@/lib/starred'
import styles from './starred.module.css'

export default function StarredPage() {
  const [words, setWords] = useState<StarredWord[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setWords(getStarred())
  }, [])

  const unstar = async (word: string, definition: string) => {
    await toggleStar(word, definition)
    setWords(getStarred())
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>Starred words</div>

        {words.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>nothing starred yet.</div>
            <div className={styles.emptyHint}>tap ★ on any word after a round.</div>
          </div>
        ) : (
          <div className={styles.list}>
            {words.map(w => (
              <div key={w.word} className={styles.row}>
                <div className={styles.info}>
                  <div className={styles.word}>{w.word}</div>
                  <div className={styles.def}>{w.definition}</div>
                </div>
                <button
                  className={styles.unstar}
                  onClick={() => unstar(w.word, w.definition)}
                  aria-label="Remove star"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
