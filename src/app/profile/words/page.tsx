'use client'

import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import StarButton from '@/components/ui/StarButton'
import { createClient } from '@/lib/supabase'
import { getStarred } from '@/lib/starred'
import styles from './words.module.css'

interface WordEntry {
  id:         string
  word:       string
  definition: string
  sentence:   string | null
  points:     number
  source:     string
  created_at: string
  revisit:    boolean
}

type Filter = 'all' | 'right' | 'partial' | 'wrong' | 'starred' | 'revisit'

function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return '1d ago'
  return `${diff}d ago`
}

function resultBadge(points: number): { label: string; cls: string } {
  if (points >= 5) return { label: '✓', cls: styles.badgeRight }
  if (points > 0)  return { label: '~', cls: styles.badgePartial }
  return { label: '✗', cls: styles.badgeWrong }
}

function sourceLabel(source: string): string {
  if (source === 'daily') return 'Daily'
  if (source === 'dare')  return 'Dare'
  if (source === 'level') return 'Level'
  return source
}

export default function WordsPage() {
  const [entries, setEntries]     = useState<WordEntry[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<Filter>('all')
  const [starredWords, setStarredWords] = useState<Set<string>>(new Set())
  const [sheet, setSheet]         = useState<WordEntry | null>(null)
  const [, setUserId]             = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage must happen in useEffect
    setStarredWords(new Set(getStarred().map(s => s.word)))

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('point_events')
        .select('id, word, definition, sentence, points, source, created_at, revisit')
        .eq('user_id', user.id)
        .not('word', 'is', null)
        .in('source', ['daily', 'level', 'dare'])
        .order('created_at', { ascending: false })

      // Deduplicate — keep the most recent entry per word
      const seen = new Set<string>()
      const unique: WordEntry[] = []
      for (const row of data ?? []) {
        if (!row.word || seen.has(row.word)) continue
        seen.add(row.word)
        unique.push({
          id:         row.id,
          word:       row.word,
          definition: row.definition ?? '',
          sentence:   row.sentence ?? null,
          points:     row.points ?? 0,
          source:     row.source ?? '',
          created_at: row.created_at,
          revisit:    row.revisit ?? false,
        })
      }
      setEntries(unique)
      setLoading(false)
    })
  }, [])

  const toggleRevisit = useCallback(async (entry: WordEntry) => {
    const supabase = createClient()
    const next = !entry.revisit
    await supabase.from('point_events').update({ revisit: next }).eq('id', entry.id)
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, revisit: next } : e))
    setSheet(prev => prev?.id === entry.id ? { ...prev, revisit: next } : prev)
  }, [])

  const starred = getStarred().map(s => s.word)

  const displayed: WordEntry[] = (() => {
    switch (filter) {
      case 'right':   return entries.filter(e => e.points >= 5)
      case 'partial': return entries.filter(e => e.points > 0 && e.points < 5)
      case 'wrong':   return entries.filter(e => e.points === 0)
      case 'starred': return entries.filter(e => starredWords.has(e.word))
      case 'revisit': return entries.filter(e => e.revisit)
      default:        return entries
    }
  })()

  const revisitCount = entries.filter(e => e.revisit).length

  const filterChips: { key: Filter; label: string }[] = [
    { key: 'all',     label: `All · ${entries.length}` },
    { key: 'right',   label: `✓ Got right · ${entries.filter(e => e.points >= 5).length}` },
    { key: 'partial', label: `~ Partial · ${entries.filter(e => e.points > 0 && e.points < 5).length}` },
    { key: 'wrong',   label: `✗ Got wrong · ${entries.filter(e => e.points === 0).length}` },
    { key: 'starred', label: `★ Starred · ${starred.length}` },
    { key: 'revisit', label: `↩ Revisit · ${revisitCount}` },
  ]

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>
          Words Journal
          {!loading && <span className={styles.count}>{entries.length}</span>}
        </div>

        <div className={styles.filterScroll}>
          <div className={styles.filterRow}>
            {filterChips.map(({ key, label }) => (
              <button
                key={key}
                className={[styles.filterChip, filter === key ? styles.filterActive : ''].join(' ')}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>nothing here yet.</div>
            <div className={styles.emptyHint}>
              {filter === 'starred' ? 'tap ★ on any word after a round.' :
               filter === 'revisit' ? 'mark words for revisit from the detail sheet.' :
               'play a daily or complete a dare to start building your list.'}
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {displayed.map(entry => {
              const badge = resultBadge(entry.points)
              return (
                <button
                  key={entry.id}
                  className={styles.row}
                  onClick={() => setSheet(entry)}
                >
                  <div className={[styles.badge, badge.cls].join(' ')}>{badge.label}</div>
                  <div className={styles.rowInfo}>
                    <div className={styles.word}>{entry.word}</div>
                    <div className={styles.rowMeta}>
                      {sourceLabel(entry.source)} · {daysAgo(entry.created_at)}
                      {entry.revisit && <span className={styles.revisitDot}>↩</span>}
                    </div>
                  </div>
                  <div className={styles.chevron}>›</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Bottom sheet ── */}
      {sheet && (
        <div className={styles.overlay} onClick={() => setSheet(null)}>
          <div className={styles.sheetWrap} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHandle} />

            <div className={styles.sheetHeader}>
              <div className={styles.sheetWord}>{sheet.word}</div>
              <div className={[styles.sheetBadge, resultBadge(sheet.points).cls].join(' ')}>
                {resultBadge(sheet.points).label} {sheet.points > 0 ? `+${sheet.points}` : '0'} pts
              </div>
              <StarButton
                word={sheet.word}
                definition={sheet.definition}
                onToggle={() => {
                  setStarredWords(new Set(getStarred().map(s => s.word)))
                }}
              />
            </div>

            {sheet.sentence && (
              <div className={styles.sheetSection}>
                <div className={styles.sheetLabel}>Sentence used</div>
                <div className={styles.sheetSentence}>{sheet.sentence}</div>
              </div>
            )}

            <div className={styles.sheetSection}>
              <div className={styles.sheetLabel}>Definition</div>
              <div className={styles.sheetDef}>{sheet.definition || '—'}</div>
            </div>

            <button
              className={[styles.revisitBtn, sheet.revisit ? styles.revisitBtnOn : ''].join(' ')}
              onClick={() => toggleRevisit(sheet)}
            >
              <span className={styles.revisitIcon}>↩</span>
              {sheet.revisit ? 'Remove from revisit queue' : 'Add to revisit queue'}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
