'use client'

import { useState } from 'react'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_MISSION = 100

export const MISSION_NAMES: Record<number, string> = {
  1: 'Foundations',    2: 'Essentials',    3: 'Building Blocks',
  4: 'Expanding',      5: 'Intermediate',  6: 'Advanced',
  7: 'Proficient',     8: 'Expert',        9: 'Master',
  10: 'Scholar',       11: 'Virtuoso',
}

const DIFF: Record<number, string> = {
  1: 'Easy', 2: 'Easy', 3: 'Easy',
  4: 'Medium', 5: 'Medium', 6: 'Medium',
  7: 'Hard', 8: 'Hard', 9: 'Hard', 10: 'Hard', 11: 'Hard',
}

type WorldKey = 'coast' | 'wild' | 'summit'

const WORLDS: Record<WorldKey, { color: string; label: string }> = {
  coast:  { color: '#2a9d8f', label: 'The Coast'  },
  wild:   { color: '#5a8a3a', label: 'The Wild'   },
  summit: { color: '#5272a0', label: 'The Summit' },
}

interface NodeDef { mission: number; col: 0|1|2; world: WorldKey; icon: string }

const NODE_DEFS: NodeDef[] = [
  { mission: 1,  col: 1, world: 'coast',  icon: 'wave'   },
  { mission: 2,  col: 2, world: 'coast',  icon: 'anchor' },
  { mission: 3,  col: 0, world: 'coast',  icon: 'boat'   },
  { mission: 4,  col: 1, world: 'wild',   icon: 'hill'   },
  { mission: 5,  col: 2, world: 'wild',   icon: 'tree'   },
  { mission: 6,  col: 0, world: 'wild',   icon: 'fire'   },
  { mission: 7,  col: 1, world: 'summit', icon: 'peak'   },
  { mission: 8,  col: 2, world: 'summit', icon: 'snow'   },
  { mission: 9,  col: 0, world: 'summit', icon: 'gem'    },
  { mission: 10, col: 1, world: 'summit', icon: 'book'   },
  { mission: 11, col: 2, world: 'summit', icon: 'star'   },
]

// World transitions: after which node index does each new world start
// coast→wild after index 2, wild→summit after index 5
const WORLD_BREAKS = [
  { afterIndex: 2, world: 'wild'   as WorldKey },
  { afterIndex: 5, world: 'summit' as WorldKey },
]

// ── SVG map geometry ─────────────────────────────────────────────

const MAP_W   = 390
const MAP_R   = 44
const MAP_ROW = 152
const MAP_TOP = 100
const COLS    = [82, 195, 308]
const MAP_H   = MAP_TOP + (NODE_DEFS.length - 1) * MAP_ROW + 140

function nodeXY(i: number) {
  return { x: COLS[NODE_DEFS[i].col], y: MAP_TOP + i * MAP_ROW }
}

function buildFullPath() {
  return NODE_DEFS.map((_, i) => {
    const { x, y } = nodeXY(i)
    if (i === 0) return `M${x},${y}`
    const p = nodeXY(i - 1)
    const h = MAP_ROW * 0.48
    return `C${p.x},${p.y + h} ${x},${y - h} ${x},${y}`
  }).join(' ')
}

// ── Mission icons ─────────────────────────────────────────────────
// All drawn at (0,0) centre, sized for MAP_R = 44.

function IconWave({ c }: { c: string }) {
  return (
    <g stroke={c} strokeLinecap="round" fill="none">
      <path d="M-19,2 C-12,-11 -5,15 3,2 C11,-11 16,11 22,2" strokeWidth="3.5"/>
      <path d="M-19,11 C-12,5 -5,18 3,11 C11,5 16,16 22,11" strokeWidth="2" opacity="0.45"/>
    </g>
  )
}
function IconAnchor({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3" fill="none" strokeLinecap="round">
      <circle cx={0} cy={-12} r={5}/>
      <line x1="0" y1="-7" x2="0" y2="13"/>
      <path d="M-11,4 Q-11,16 0,16 Q11,16 11,4"/>
      <line x1="-8" y1="-12" x2="8" y2="-12"/>
    </g>
  )
}
function IconBoat({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <path d="M-16,10 Q0,18 16,10" fill={c} fillOpacity="0.2"/>
      <line x1="0" y1="-13" x2="0" y2="10"/>
      <path d="M0,-13 L16,6 L0,6 Z" fill={c} fillOpacity="0.3" strokeLinejoin="round"/>
    </g>
  )
}
function IconHill({ c }: { c: string }) {
  return (
    <g>
      <path d="M-22,12 Q-10,-11 0,-1 Q10,-11 22,12 Z"
        fill={c} fillOpacity="0.25" stroke={c} strokeWidth="2.8"
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M-22,17 C-6,9 6,13 22,17"
        stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
    </g>
  )
}
function IconTree({ c }: { c: string }) {
  return (
    <g stroke={c} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="0,-18 -13,0 13,0"  fill={c} fillOpacity="0.25" strokeWidth="2.2"/>
      <polygon points="0,-8 -17,10 17,10" fill={c} fillOpacity="0.18" strokeWidth="2.2"/>
      <line x1="0" y1="10" x2="0" y2="17" strokeWidth="3"/>
    </g>
  )
}
function IconFire({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-18 Q13,-3 8,8 Q5,17 0,15 Q-5,17 -8,8 Q-13,-3 0,-18 Z"
        fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M0,-6 Q7,3 4,10 Q0,13 -4,10 Q-7,3 0,-6 Z"
        fill={c} fillOpacity="0.5"/>
    </g>
  )
}
function IconPeak({ c }: { c: string }) {
  return (
    <g>
      <path d="M-22,14 L0,-17 L22,14 Z"
        fill={c} fillOpacity="0.2" stroke={c} strokeWidth="2.8" strokeLinejoin="round"/>
      <path d="M-9,-4 L0,-17 L9,-4 L6,-1 L-6,-1 Z"
        fill="white" fillOpacity="0.9"/>
    </g>
  )
}
function IconSnow({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="3" strokeLinecap="round">
      <line x1="0"     y1="-16" x2="0"     y2="16"/>
      <line x1="-13.9" y1="-8"  x2="13.9"  y2="8"/>
      <line x1="-13.9" y1="8"   x2="13.9"  y2="-8"/>
      <line x1="-6"    y1="-16" x2="0"     y2="-11"/>
      <line x1="6"     y1="-16" x2="0"     y2="-11"/>
    </g>
  )
}
function IconGem({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-16 L13,-4 L8,14 L-8,14 L-13,-4 Z"
        fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/>
      <line x1="-13" y1="-4" x2="13" y2="-4" stroke={c} strokeWidth="2"/>
      <line x1="-13" y1="-4" x2="0"  y2="14" stroke={c} strokeWidth="1.2" opacity="0.4"/>
      <line x1="13"  y1="-4" x2="0"  y2="14" stroke={c} strokeWidth="1.2" opacity="0.4"/>
    </g>
  )
}
function IconBook({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round">
      <path d="M-14,-13 L-14,13 Q0,10 0,13 Q0,10 14,13 L14,-13 Q0,-10 0,-13 Q0,-10 -14,-13 Z"
        fill={c} fillOpacity="0.18"/>
      <line x1="0" y1="-13" x2="0" y2="13"/>
      <line x1="-9" y1="-5" x2="-3" y2="-5" opacity="0.5"/>
      <line x1="-9" y1="1"  x2="-3" y2="1"  opacity="0.5"/>
      <line x1="-9" y1="7"  x2="-3" y2="7"  opacity="0.5"/>
    </g>
  )
}
function IconStar({ c }: { c: string }) {
  return (
    <path d="M0,-17 L4,-6 L16,-6 L7,2 L11,13 L0,6 L-11,13 L-7,2 L-16,-6 L-4,-6 Z"
      fill={c} fillOpacity="0.25" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/>
  )
}
function IconLock() {
  return (
    <g stroke="var(--muted)" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x={-9} y={-2} width={18} height={14} rx={3} fill="var(--muted)" fillOpacity="0.15"/>
      <path d="M-6,-2 L-6,-7 Q-6,-15 0,-15 Q6,-15 6,-7 L6,-2"/>
      <circle cx={0} cy={6} r={2.5} fill="var(--muted)" stroke="none"/>
    </g>
  )
}

type IllFn = ({ c }: { c: string }) => React.ReactNode
const ICONS: Record<string, IllFn> = {
  wave: IconWave, anchor: IconAnchor, boat: IconBoat, hill: IconHill,
  tree: IconTree, fire: IconFire,    peak: IconPeak, snow: IconSnow,
  gem: IconGem,  book: IconBook,     star: IconStar,
}

// ── Main component ────────────────────────────────────────────────

export default function LevelHero() {
  const [currentMission] = useState(() => {
    for (let m = 1; m <= 11; m++) {
      if (isLevelUnlocked(m) && completedInLevel(m).length < WORDS_PER_MISSION) return m
    }
    return 11
  })

  const fullPath = buildFullPath()

  return (
    <div className={styles.wrap}>

      <p className={styles.mapLabel}>Missions</p>

      <div className={styles.mapWrap}>
        <svg
          width="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ display: 'block' }}
        >
          {/* ── Trail — grey base ── */}
          <path
            d={fullPath}
            fill="none"
            stroke="var(--surface2)"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* ── Trail — completed segments, world-coloured ── */}
          {NODE_DEFS.slice(0, currentMission - 1).map((_, i) => {
            const from = nodeXY(i)
            const to   = nodeXY(i + 1)
            const h    = MAP_ROW * 0.48
            const wc   = WORLDS[NODE_DEFS[i].world].color
            return (
              <path key={i}
                d={`M${from.x},${from.y} C${from.x},${from.y + h} ${to.x},${to.y - h} ${to.x},${to.y}`}
                fill="none" stroke={wc} strokeWidth="20"
                strokeLinecap="round" opacity="0.65"
              />
            )
          })}

          {/* ── World section banners ── */}
          {WORLD_BREAKS.map(({ afterIndex, world }) => {
            const from = nodeXY(afterIndex)
            const to   = nodeXY(afterIndex + 1)
            const by   = (from.y + to.y) / 2
            const bx   = MAP_W / 2
            const wc   = WORLDS[world].color
            const bw   = 160
            const bh   = 32
            return (
              <g key={world}>
                {/* Banner pill */}
                <rect x={bx - bw / 2} y={by - bh / 2} width={bw} height={bh}
                  rx={bh / 2}
                  fill={wc} fillOpacity="0.12"
                  stroke={wc} strokeWidth="1.5" strokeOpacity="0.35"
                />
                {/* World label */}
                <text
                  x={bx} y={by + 5}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="10" fontWeight="800"
                  letterSpacing="0.1em"
                  fill={wc} fillOpacity="0.8"
                >
                  {WORLDS[world].label.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* ── Nodes ── */}
          {NODE_DEFS.map((nd, i) => {
            const { x, y }  = nodeXY(i)
            const wc         = WORLDS[nd.world].color
            const isCurrent  = nd.mission === currentMission
            const isDone     = nd.mission <  currentMission
            const isLocked   = nd.mission >  currentMission
            const done       = completedInLevel(nd.mission).length
            const pct        = Math.round((done / WORDS_PER_MISSION) * 100)
            const IconComp   = ICONS[nd.icon] as IllFn

            // Fill color per state
            const fill = isCurrent
              ? 'var(--accent)'
              : isDone
                ? wc
                : 'var(--surface2)'

            return (
              <g key={nd.mission} transform={`translate(${x},${y})`}
                style={{ cursor: isLocked ? 'default' : 'pointer' }}
                onClick={isLocked ? undefined : () => { window.location.href = `/play/${nd.mission}` }}
              >
                {/* Outer glow ring — current only */}
                {isCurrent && (
                  <>
                    <circle r={MAP_R + 12} fill="none"
                      stroke="var(--accent)" strokeWidth="2" opacity="0.12"/>
                    <circle r={MAP_R + 6} fill="none"
                      stroke="var(--accent)" strokeWidth="2.5" opacity="0.22"/>
                  </>
                )}

                {/* Node circle */}
                <circle r={MAP_R}
                  fill={fill}
                  fillOpacity={isLocked ? 0.45 : 1}
                />

                {/* Inner content */}
                {isLocked ? (
                  <IconLock/>
                ) : isDone ? (
                  // Checkmark
                  <path d="M-14,0 L-4,11 L14,-11"
                    stroke="white" strokeWidth="4" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"
                    opacity="0.9"
                  />
                ) : (
                  // Current mission — show icon
                  <g opacity="1">
                    <IconComp c="white"/>
                  </g>
                )}

                {/* Mission number chip — bottom of circle */}
                <text y={MAP_R - 10}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="10" fontWeight="800"
                  letterSpacing="0.04em"
                  fill={isLocked ? 'var(--muted)' : 'rgba(255,255,255,0.6)'}
                >
                  {nd.mission}
                </text>

                {/* Label: mission name */}
                <text y={MAP_R + 20}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="13"
                  fontWeight={isCurrent ? '800' : '600'}
                  fill={isCurrent ? 'var(--accent)' : isLocked ? 'var(--muted)' : 'var(--text)'}
                  opacity={isLocked ? 0.55 : 1}
                >
                  {MISSION_NAMES[nd.mission]}
                </text>

                {/* Label: difficulty / progress */}
                <text y={MAP_R + 35}
                  textAnchor="middle"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="10" fontWeight="700"
                  letterSpacing="0.06em"
                  fill={isCurrent ? 'var(--accent)' : isLocked ? 'var(--border)' : 'var(--muted)'}
                  opacity={isLocked ? 0.55 : 0.8}
                >
                  {isCurrent && pct > 0 ? `${pct}% DONE` : DIFF[nd.mission].toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
