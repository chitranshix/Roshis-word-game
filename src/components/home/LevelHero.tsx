'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getProgress, completedInLevel } from '@/lib/progress'
import styles from './LevelHero.module.css'

const WORDS_PER_LEVEL = 100
const DOTS = 10

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Foundations',   2: 'Essentials',    3: 'Building Blocks',
  4: 'Expanding',     5: 'Intermediate',  6: 'Advanced',
  7: 'Proficient',    8: 'Expert',        9: 'Master',
  10: 'Scholar',      11: 'Virtuoso',
}

export default function LevelHero() {
  const [progress] = useState(() => getProgress())
  const currentLevel = progress.level
  const completed    = completedInLevel(currentLevel).length
  const isDone       = completed === WORDS_PER_LEVEL
  const filledDots   = Math.min(Math.floor(completed / (WORDS_PER_LEVEL / DOTS)), DOTS)
  const href         = isDone ? `/play/${currentLevel + 1}` : `/play/${currentLevel}`
  const btnLabel     = isDone ? `Start Level ${currentLevel + 1} →` : completed === 0 ? 'Start playing →' : 'Continue →'

  return (
    <div className={styles.wrap}>

      {/* ── Active level — full width hero card ── */}
      <Link href={href} className={styles.heroLink}>
        <div className={styles.heroCard}>
          <div className={styles.heroTop}>
            <div>
              <div className={styles.levelEyebrow}>Level {currentLevel}</div>
              <div className={styles.levelName}>{LEVEL_NAMES[currentLevel]}</div>
            </div>
            <div className={styles.wordCount}>
              <span className={styles.wordCountNum}>{completed}</span>
              <span className={styles.wordCountOf}> / {WORDS_PER_LEVEL}</span>
            </div>
          </div>

          <div className={styles.dots}>
            {Array.from({ length: DOTS }).map((_, i) => (
              <div key={i} className={[styles.dot, i < filledDots ? styles.dotFilled : ''].join(' ')} />
            ))}
          </div>

          <div className={styles.playBtn}>{btnLabel}</div>
        </div>
      </Link>

      {/* ── All levels strip — horizontal scroll ── */}
      <div className={styles.levelStrip}>
        {Array.from({ length: 11 }, (_, i) => i + 1).map(level => {
          const done     = completedInLevel(level).length
          const isActive = level === currentLevel
          const isLocked = level > currentLevel
          const isFull   = done === WORDS_PER_LEVEL

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
              <span className={styles.pillLevel}>L{level}</span>
              <span className={styles.pillName}>{LEVEL_NAMES[level]}</span>
              {isLocked && <span className={styles.pillLock}>🔒</span>}
              {isFull   && <span className={styles.pillCheck}>✓</span>}
            </div>
          )
        })}
      </div>

    </div>
  )
}
