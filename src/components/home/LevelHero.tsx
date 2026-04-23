'use client'

import { useState } from 'react'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_MISSION = 100

export const MISSION_NAMES: Record<number, string> = {
  1: 'Foundations',  2: 'Essentials',   3: 'Building Blocks',
  4: 'Expanding',    5: 'Intermediate', 6: 'Advanced',
  7: 'Proficient',   8: 'Expert',       9: 'Master',
  10: 'Scholar',     11: 'Virtuoso',
}

const DIFF: Record<number, string> = {
  1: 'EASY', 2: 'EASY', 3: 'EASY',
  4: 'MEDIUM', 5: 'MEDIUM', 6: 'MEDIUM',
  7: 'HARD', 8: 'HARD', 9: 'HARD', 10: 'HARD', 11: 'HARD',
}

// ── Grid — 4 cols × 5 rows = 20 cells ────────────────────────────
// Missions fill L→R, T→B. Symbol slots are empty rhythm tiles.

type GridCell = { kind: 'mission'; mission: number } | { kind: 'symbol' }

const GRID: GridCell[] = (() => {
  const pattern: Array<'M' | 'S'> = [
    'M','S','M','S',
    'S','M','S','M',
    'M','S','M','S',
    'S','M','S','M',
    'M','M','S','M',
  ]
  let m = 0
  return pattern.map(p =>
    p === 'M'
      ? { kind: 'mission', mission: ++m }
      : { kind: 'symbol' }
  )
})()

// ── Mission face ──────────────────────────────────────────────────

function MissionFace({ mission, isCurrent }: {
  mission: number
  isCurrent: boolean
}) {
  const textColor   = isCurrent ? '#ffffff' : 'var(--text)'
  const mutedColor  = isCurrent ? 'rgba(255,255,255,0.65)' : 'var(--muted)'
  const isDouble    = mission >= 10
  const fs          = isDouble ? 46 : 56
  const ny          = isDouble ? 65 : 69

  return (
    <>
      <text x="50" y="15" textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="8" fontWeight="700"
        letterSpacing="0.13em"
        fill={mutedColor}
      >MISSION</text>

      <text x="50" y={ny} textAnchor="middle"
        fontFamily="Impact, 'Arial Narrow Bold', sans-serif"
        fontSize={fs} fontWeight="900"
        fill={textColor}
      >{mission}</text>

      <text x="50" y="93" textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="9.5" fontWeight="700"
        letterSpacing="0.08em"
        fill={mutedColor}
      >{DIFF[mission]}</text>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function LevelHero() {
  const [currentMission] = useState(() => {
    for (let m = 1; m <= 11; m++) {
      if (isLevelUnlocked(m) && completedInLevel(m).length < WORDS_PER_MISSION) return m
    }
    return 11
  })

  return (
    <div className={styles.machine}>

      <div className={styles.machineHeader}>
        <span className={styles.machineTitle}>Missions</span>
      </div>

      <div className={styles.grid}>
        {GRID.map((cell, i) => {

          // ── Empty rhythm tile ──
          if (cell.kind === 'symbol') {
            return <div key={i} className={`${styles.cell} ${styles.symbolCell}`} />
          }

          // ── Mission tile ──
          const { mission } = cell
          const isCurrent = mission === currentMission
          const isLocked  = mission >  currentMission

          return (
            <div key={i}
              className={[
                styles.cell,
                styles.missionCell,
                isCurrent ? styles.current : '',
              ].filter(Boolean).join(' ')}
              style={{ opacity: isLocked ? 0.3 : 1 }}
              onClick={isLocked ? undefined : () => { window.location.href = `/play/${mission}` }}
            >
              <svg viewBox="0 0 100 100" className={styles.numSvg}>
                <MissionFace mission={mission} isCurrent={isCurrent} />
              </svg>
            </div>
          )
        })}
      </div>

    </div>
  )
}
