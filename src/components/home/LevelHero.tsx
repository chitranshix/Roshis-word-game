'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getProgress, completedInLevel } from '@/lib/progress'
import styles from './LevelHero.module.css'

const WORDS_PER_LEVEL = 100

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Foundations',   2: 'Essentials',    3: 'Building Blocks',
  4: 'Expanding',     5: 'Intermediate',  6: 'Advanced',
  7: 'Proficient',    8: 'Expert',        9: 'Master',
  10: 'Scholar',      11: 'Virtuoso',
}

const LEVEL_DIFFICULTY: Record<number, { label: string; cls: string }> = {
  1: { label: 'Easy',   cls: 'easy'   },
  2: { label: 'Easy',   cls: 'easy'   },
  3: { label: 'Easy',   cls: 'easy'   },
  4: { label: 'Medium', cls: 'medium' },
  5: { label: 'Medium', cls: 'medium' },
  6: { label: 'Medium', cls: 'medium' },
  7: { label: 'Hard',   cls: 'hard'   },
  8: { label: 'Hard',   cls: 'hard'   },
  9: { label: 'Hard',   cls: 'hard'   },
  10: { label: 'Hard',  cls: 'hard'   },
  11: { label: 'Hard',  cls: 'hard'   },
}

export default function LevelHero() {
  const [progress] = useState(() => getProgress())
  const currentLevel = progress.level
  const completed    = completedInLevel(currentLevel).length
  const remaining    = WORDS_PER_LEVEL - completed
  const pct          = Math.round((completed / WORDS_PER_LEVEL) * 100)
  const isDone       = completed === WORDS_PER_LEVEL
  const href         = isDone ? `/play/${currentLevel + 1}` : `/play/${currentLevel}`
  const btnLabel     = isDone ? `Start Level ${currentLevel + 1}` : completed === 0 ? 'Start' : 'Continue'
  const diff         = LEVEL_DIFFICULTY[currentLevel]

  return (
    <div className={styles.wrap}>

      {/* ── Hero card ── */}
      <Link href={href} className={styles.heroLink}>
        <div className={styles.heroCard}>

          {/* top row: level + difficulty tag */}
          <div className={styles.heroHeader}>
            <div className={styles.heroMeta}>
              <span className={styles.levelNum}>Level {currentLevel}</span>
              <span className={styles.dot}>·</span>
              <span className={styles.levelTitle}>{LEVEL_NAMES[currentLevel]}</span>
            </div>
            <span className={[styles.diffTag, styles[diff.cls]].join(' ')}>{diff.label}</span>
          </div>

          {/* stat row */}
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span className={styles.statVal}>{completed}</span>
              <span className={styles.statLabel}>Solved</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statVal}>{remaining}</span>
              <span className={styles.statLabel}>Remaining</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statVal}>{WORDS_PER_LEVEL}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>

          {/* progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.pct}>{pct}%</span>
          </div>

          <div className={styles.playBtn}>{btnLabel} →</div>

        </div>
      </Link>

      {/* ── Level strip ── */}
      <div className={styles.stripWrap}>
        <div className={styles.levelStrip}>
          {Array.from({ length: 11 }, (_, i) => i + 1).map(level => {
            const done     = completedInLevel(level).length
            const isActive = level === currentLevel
            const isLocked = level > currentLevel
            const isFull   = done === WORDS_PER_LEVEL
            const d        = LEVEL_DIFFICULTY[level]

            return (
              <div
                key={level}
                className={[
                  styles.pill,
                  isActive ? styles.pillActive : '',
                  isLocked ? styles.pillLocked : '',
                  isFull   ? styles.pillDone   : '',
                ].filter(Boolean).join(' ')}
              >
                <span className={styles.pillNum}>L{level}</span>
                <span className={styles.pillName}>{LEVEL_NAMES[level]}</span>
                {!isLocked && !isFull && (
                  <span className={[styles.pillDiff, styles[d.cls]].join(' ')}>{d.label}</span>
                )}
                {isFull   && <span className={styles.pillCheck}>✓</span>}
                {isLocked && <span className={styles.pillLockIcon}>🔒</span>}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
