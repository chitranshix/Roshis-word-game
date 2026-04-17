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
  4: 'MEDIUM',  5: 'MEDIUM',  6: 'MEDIUM',
  7: 'HARD', 8: 'HARD', 9: 'HARD', 10: 'HARD', 11: 'HARD',
}

type WorldKey = 'coast' | 'wild' | 'summit'

const WORLD_COLORS: Record<WorldKey, string> = {
  coast:  '#00cbb8',
  wild:   '#2ecc71',
  summit: '#4a9ef5',
}

const MISSION_WORLD: Record<number, WorldKey> = {
  1: 'coast', 2: 'coast', 3: 'coast',
  4: 'wild',  5: 'wild',  6: 'wild',
  7: 'summit', 8: 'summit', 9: 'summit', 10: 'summit', 11: 'summit',
}

// ── Grid — 4 cols × 5 rows = 20 cells ────────────────────────────
// Missions fill L→R, T→B so they stay findable.

type GridCell = { kind: 'mission'; mission: number } | { kind: 'symbol'; idx: number }

const GRID: GridCell[] = (() => {
  // M = mission slot, S = symbol slot
  const pattern: Array<'M' | 'S'> = [
    'M','S','M','S',
    'S','M','S','M',
    'M','S','M','S',
    'S','M','S','M',
    'M','M','S','M',
  ]
  let m = 0, s = 0
  return pattern.map(p =>
    p === 'M'
      ? { kind: 'mission', mission: ++m }
      : { kind: 'symbol',  idx: ++s }
  )
})()

// ── Symbol colours — 4 distinct hues cycling ─────────────────────
const SYM_COLORS = [
  '#e8304a', // red
  '#f0c000', // yellow
  '#3ecb48', // green
  '#c840e8', // purple
  '#e8304a',
  '#f0c000',
  '#3ecb48',
  '#c840e8',
  '#e8304a',
]

// ── Slot-machine-style symbols ────────────────────────────────────
// Each: solid fill + thick black stroke + white gloss ellipse.
// viewBox "-30 -30 60 60"

function Gloss() {
  return (
    <ellipse cx={-9} cy={-14} rx={8} ry={5}
      fill="white" opacity="0.38"
      transform="rotate(-25,-9,-14)"
    />
  )
}

// Lily pad — simple top-down oval with V-notch + white vein network, no flower
function SymLilypad({ c }: { c: string }) {
  return (
    <g>
      {/* Pad body: near-circle with V-notch at top */}
      <path d="M0,1 L-7,-23 A24,24 0 1,0 7,-23 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      {/* Main vein down */}
      <line x1="0" y1="1" x2="0"   y2="24"  stroke="white" strokeWidth="2"   opacity="0.6"/>
      {/* Side veins radiating out */}
      <line x1="0" y1="1" x2="-23" y2="10"  stroke="white" strokeWidth="1.7" opacity="0.5"/>
      <line x1="0" y1="1" x2="23"  y2="10"  stroke="white" strokeWidth="1.7" opacity="0.5"/>
      <line x1="0" y1="1" x2="-24" y2="-6"  stroke="white" strokeWidth="1.5" opacity="0.42"/>
      <line x1="0" y1="1" x2="24"  y2="-6"  stroke="white" strokeWidth="1.5" opacity="0.42"/>
      <line x1="0" y1="1" x2="-15" y2="22"  stroke="white" strokeWidth="1.3" opacity="0.35"/>
      <line x1="0" y1="1" x2="15"  y2="22"  stroke="white" strokeWidth="1.3" opacity="0.35"/>
    </g>
  )
}

// Cherries → twin turtle heads peeking (pair like cherries)
function SymHeads({ c }: { c: string }) {
  return (
    <g>
      {/* Stems */}
      <path d="M-8,-4 Q-4,-20 4,-24 Q10,-20 12,-6"
        stroke="#3a8a20" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Left head */}
      <circle cx={-14} cy={6} r={13} fill={c} stroke="#111" strokeWidth="4"/>
      <circle cx={-18} cy={2} r={3.5} fill="white" stroke="none"/>
      <circle cx={-10} cy={2} r={3.5} fill="white" stroke="none"/>
      <circle cx={-17.5} cy={2} r={1.8} fill="#111"/>
      <circle cx={-9.5}  cy={2} r={1.8} fill="#111"/>
      {/* Right head */}
      <circle cx={14} cy={10} r={13} fill={c} stroke="#111" strokeWidth="4"/>
      <circle cx={10} cy={6}  r={3.5} fill="white" stroke="none"/>
      <circle cx={18} cy={6}  r={3.5} fill="white" stroke="none"/>
      <circle cx={10.5} cy={6} r={1.8} fill="#111"/>
      <circle cx={18.5} cy={6} r={1.8} fill="#111"/>
    </g>
  )
}

// Waves — layered ocean waves
function SymWaves({ c }: { c: string }) {
  return (
    <g>
      {/* Back wave */}
      <path d="M-28,-8 C-20,-22 -10,-22 0,-8 C10,6 20,6 28,-8 L28,10 L-28,10 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round" opacity="0.6"/>
      {/* Front wave */}
      <path d="M-28,6 C-20,-8 -10,-8 0,6 C10,20 20,20 28,6 L28,26 L-28,26 Z"
        fill={c} stroke="#111" strokeWidth="4.5" strokeLinejoin="round"/>
      {/* White foam crests */}
      <path d="M-28,-8 C-23,-16 -17,-16 -12,-8"
        stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75"/>
      <path d="M-2,-8 C3,-16 9,-16 14,-8"
        stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75"/>
      <ellipse cx={-10} cy={-10} rx={8} ry={4} fill="white" opacity="0.2" transform="rotate(-15,-10,-10)"/>
    </g>
  )
}

// Starfish — simple wobbly star + dots + cute eyes
function SymStarfish({ c }: { c: string }) {
  return (
    <g>
      {/* Slightly irregular 5-pointed star body */}
      <path d="M0,-26 C3,-18 5,-13 8,-7 C14,-11 21,-13 23,-8 C18,-3 13,1 12,5 C16,10 19,18 16,22 C11,17 7,11 2,10 C2,17 0,22 0,26 C0,22 -2,17 -2,10 C-7,11 -11,17 -16,22 C-19,18 -16,10 -12,5 C-13,1 -18,-3 -23,-8 C-21,-13 -14,-11 -8,-7 C-5,-13 -3,-18 0,-26 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      {/* Dots near each arm tip */}
      <circle cx={0}   cy={-19} r={2.2} fill="white" opacity="0.65"/>
      <circle cx={17}  cy={-5}  r={2.2} fill="white" opacity="0.65"/>
      <circle cx={11}  cy={15}  r={2.2} fill="white" opacity="0.65"/>
      <circle cx={-11} cy={15}  r={2.2} fill="white" opacity="0.65"/>
      <circle cx={-17} cy={-5}  r={2.2} fill="white" opacity="0.65"/>
      {/* Eyes */}
      <circle cx={-5} cy={1} r={3.8} fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx={5}  cy={1} r={3.8} fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx={-4.5} cy={1} r={2} fill="#111"/>
      <circle cx={5.5}  cy={1} r={2} fill="#111"/>
      <Gloss/>
    </g>
  )
}

// Fish — simple iconic fish
function SymFish({ c }: { c: string }) {
  return (
    <g>
      {/* Tail */}
      <path d="M-12,-14 L-28,0 L-12,14 Z"
        fill={c} stroke="#111" strokeWidth="3.5" strokeLinejoin="round"/>
      {/* Body */}
      <ellipse cx={5} cy={0} rx={19} ry={13}
        fill={c} stroke="#111" strokeWidth="4"/>
      {/* Eye */}
      <circle cx={16} cy={-5} r={4.5} fill="white" stroke="#111" strokeWidth="2"/>
      <circle cx={17} cy={-5} r={2.2} fill="#111"/>
      <circle cx={16} cy={-6} r={1}   fill="white"/>
      <Gloss/>
    </g>
  )
}

// Anchor
function SymAnchor({ c }: { c: string }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* Black outline layer */}
      <circle cx={0} cy={-21} r={7.5} fill="#111"/>
      <line x1="0" y1="-13.5" x2="0" y2="16" stroke="#111" strokeWidth="10"/>
      <path d="M-14,7 Q-14,25 0,25 Q14,25 14,7" stroke="#111" strokeWidth="10" fill="none"/>
      <line x1="-12" y1="-21" x2="12" y2="-21" stroke="#111" strokeWidth="10"/>
      {/* Colour layer */}
      <circle cx={0} cy={-21} r={7.5} fill={c}/>
      <line x1="0" y1="-13.5" x2="0" y2="16" stroke={c} strokeWidth="6"/>
      <path d="M-14,7 Q-14,25 0,25 Q14,25 14,7" stroke={c} strokeWidth="6" fill="none"/>
      <line x1="-12" y1="-21" x2="12" y2="-21" stroke={c} strokeWidth="6"/>
      <Gloss/>
    </g>
  )
}

// Lily flower — lotus with layered petals + golden centre
function SymLilyFlower({ c }: { c: string }) {
  return (
    <g>
      {/* Outer ring of 5 petals — wider, lower */}
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse key={i} cx={0} cy={-17} rx={7} ry={13}
          fill={c} stroke="#111" strokeWidth="3"
          transform={`rotate(${a})`} opacity="0.72"
        />
      ))}
      {/* Inner ring of 5 petals — taller, rotated 36° */}
      {[36, 108, 180, 252, 324].map((a, i) => (
        <ellipse key={i + 5} cx={0} cy={-13} rx={6} ry={10}
          fill={c} stroke="#111" strokeWidth="3"
          transform={`rotate(${a})`}
        />
      ))}
      {/* Golden centre */}
      <circle r={9} fill="#FFD700" stroke="#111" strokeWidth="3.5"/>
      <circle r={4.5} fill="#e07000" stroke="#111" strokeWidth="1.5"/>
      <Gloss/>
    </g>
  )
}

// Leaves — three elongated pointed leaves with midrib + side veins
function SymLeaves({ c }: { c: string }) {
  return (
    <g stroke="#111" strokeLinejoin="round">
      {/* Left leaf — lanceolate, angled left */}
      <path d="M0,22 C-6,14 -20,2 -22,-14 C-16,-24 -7,-14 0,22 Z"
        fill={c} fillOpacity="0.75" strokeWidth="3.5"/>
      {/* Left midrib */}
      <path d="M0,22 C-8,8 -16,-6 -22,-14" stroke="white" strokeWidth="1.5" fill="none" opacity="0.55"/>
      {/* Left side veins */}
      <line x1="-7" y1="12" x2="-14" y2="5"   stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="-12" y1="2" x2="-18" y2="-5"  stroke="white" strokeWidth="1" opacity="0.4"/>

      {/* Right leaf — lanceolate, angled right */}
      <path d="M0,22 C6,14 20,2 22,-14 C16,-24 7,-14 0,22 Z"
        fill={c} fillOpacity="0.88" strokeWidth="3.5"/>
      {/* Right midrib */}
      <path d="M0,22 C8,8 16,-6 22,-14" stroke="white" strokeWidth="1.5" fill="none" opacity="0.55"/>
      {/* Right side veins */}
      <line x1="7"  y1="12" x2="14" y2="5"   stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="12" y1="2"  x2="18" y2="-5"  stroke="white" strokeWidth="1" opacity="0.4"/>

      {/* Centre leaf — tall, straight */}
      <path d="M0,24 C-9,12 -7,-10 0,-26 C7,-10 9,12 0,24 Z"
        fill={c} strokeWidth="3.5"/>
      {/* Centre midrib */}
      <line x1="0" y1="24" x2="0" y2="-24" stroke="white" strokeWidth="1.6" opacity="0.55"/>
      {/* Centre side veins */}
      <line x1="0" y1="8"  x2="7"  y2="2"   stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="0" y1="-4" x2="7"  y2="-10" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="0" y1="8"  x2="-7" y2="2"   stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="0" y1="-4" x2="-7" y2="-10" stroke="white" strokeWidth="1" opacity="0.4"/>

      <ellipse cx={-5} cy={-14} rx={4} ry={2.5} fill="white" opacity="0.3" transform="rotate(-20,-5,-14)"/>
    </g>
  )
}

// Pearl — oyster shell with pearl
function SymPearl({ c }: { c: string }) {
  return (
    <g>
      {/* Shell */}
      <path d="M-24,2 Q-22,-16 0,-20 Q22,-16 24,2 Q14,10 0,8 Q-14,10 -24,2 Z"
        fill={c} stroke="#111" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M-24,2 Q-12,-6 0,-4 Q12,-6 24,2"
        stroke="#111" strokeWidth="3" fill="none"/>
      {/* Pearl */}
      <circle cx={0} cy={18} r={11} fill="white" stroke="#111" strokeWidth="3.5"/>
      <ellipse cx={-4} cy={13} rx={4} ry={2.5} fill="white" opacity="0.7"/>
      <Gloss/>
    </g>
  )
}

const SYM_FNS = [
  SymLilypad, SymHeads, SymWaves, SymStarfish, SymFish,
  SymAnchor, SymLilyFlower, SymLeaves, SymPearl,
]

// ── Mission cell number + labels ──────────────────────────────────

function MissionFace({
  mission, numColor, diffColor, diff,
}: {
  mission: number
  numColor: string
  diffColor: string
  diff: string
}) {
  const isDouble = mission >= 10
  const fs = isDouble ? 48 : 60
  const ny = isDouble ? 68  : 72
  return (
    <>
      {/* "MISSION" label above number */}
      <text x="50" y="14" textAnchor="middle"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize="9" fontWeight="800"
        letterSpacing="0.14em"
        fill={diffColor}
      >MISSION</text>
      {/* Number — outline pass */}
      <text x="50" y={ny} textAnchor="middle"
        fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
        fontSize={fs} fontWeight="900"
        stroke="#000" strokeWidth="14" strokeLinejoin="round"
        fill="none"
      >{mission}</text>
      {/* Number — fill pass */}
      <text x="50" y={ny} textAnchor="middle"
        fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
        fontSize={fs} fontWeight="900"
        fill={numColor}
      >{mission}</text>
      {/* Difficulty label */}
      <text x="50" y="93" textAnchor="middle"
        fontFamily="Nunito, system-ui, sans-serif"
        fontSize="11" fontWeight="800"
        letterSpacing="0.08em"
        fill={diffColor}
      >{diff}</text>
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

      {/* Header */}
      <div className={styles.machineHeader}>
        <span className={styles.machineDiamond}/>
        <span className={styles.machineTitle}>Missions</span>
        <span className={styles.machineDiamond}/>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {GRID.map((cell, i) => {

          // ── Symbol cell ──
          if (cell.kind === 'symbol') {
            const color = SYM_COLORS[(cell.idx - 1) % SYM_COLORS.length]
            const SymFn = SYM_FNS[(cell.idx - 1) % SYM_FNS.length]
            return (
              <div key={i} className={styles.cell}>
                <svg viewBox="-30 -30 60 60" className={styles.symSvg}>
                  <SymFn c={color}/>
                </svg>
              </div>
            )
          }

          // ── Mission cell ──
          const { mission } = cell
          const world      = MISSION_WORLD[mission]
          const wc         = WORLD_COLORS[world]
          const isCurrent  = mission === currentMission
          const isDone     = mission <  currentMission
          const isLocked   = mission >  currentMission
          const numColor = isCurrent
            ? '#FFD700'
            : isDone
              ? wc
              : '#666'

          const diffLabel = DIFF[mission]

          const diffColor = isCurrent
            ? '#e8a800'
            : isDone
              ? wc
              : 'var(--muted)'

          return (
            <div key={i}
              className={[
                styles.cell,
                styles.missionCell,
                isCurrent ? styles.current : '',
              ].filter(Boolean).join(' ')}
              style={{ opacity: isLocked ? 0.55 : 1 }}
              onClick={isLocked ? undefined : () => { window.location.href = `/play/${mission}` }}
            >
              <svg viewBox="0 0 100 100" className={styles.numSvg}>
                <MissionFace
                  mission={mission}
                  numColor={numColor}
                  diffColor={diffColor}
                  diff={diffLabel}
                />
              </svg>
            </div>
          )
        })}
      </div>

    </div>
  )
}
