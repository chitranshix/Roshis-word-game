'use client'

import { useState } from 'react'
import Link from 'next/link'
import { completedInLevel, isLevelUnlocked } from '@/lib/progress'
import styles from './LevelHero.module.css'

// ── Data ─────────────────────────────────────────────────────────

const WORDS_PER_LEVEL = 100

export const LEVEL_NAMES: Record<number, string> = {
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

const WORLDS: Record<WorldKey, { color: string; label: string; from: number; to: number }> = {
  coast:  { color: '#2a9d8f', label: 'The Coast',  from: 0, to: 2  },
  wild:   { color: '#5a8a3a', label: 'The Wild',   from: 3, to: 5  },
  summit: { color: '#5272a0', label: 'The Summit', from: 6, to: 10 },
}

interface NodeDef { level: number; col: 0|1|2|3; world: WorldKey; icon: string }

const NODE_DEFS: NodeDef[] = [
  { level: 1,  col: 1, world: 'coast',  icon: 'wave'   },
  { level: 2,  col: 3, world: 'coast',  icon: 'anchor' },
  { level: 3,  col: 2, world: 'coast',  icon: 'boat'   },
  { level: 4,  col: 0, world: 'wild',   icon: 'hill'   },
  { level: 5,  col: 2, world: 'wild',   icon: 'tree'   },
  { level: 6,  col: 3, world: 'wild',   icon: 'fire'   },
  { level: 7,  col: 1, world: 'summit', icon: 'peak'   },
  { level: 8,  col: 3, world: 'summit', icon: 'snow'   },
  { level: 9,  col: 0, world: 'summit', icon: 'gem'    },
  { level: 10, col: 2, world: 'summit', icon: 'book'   },
  { level: 11, col: 1, world: 'summit', icon: 'star'   },
]

// ── SVG map geometry ─────────────────────────────────────────────

const MAP_W   = 390
const MAP_R   = 30
const MAP_ROW = 116
const MAP_TOP = 80
const COLS    = [58, 148, 242, 332]
const MAP_H   = MAP_TOP + (NODE_DEFS.length - 1) * MAP_ROW + 100

function nodeXY(i: number) {
  return { x: COLS[NODE_DEFS[i].col], y: MAP_TOP + i * MAP_ROW }
}

function buildFullPath() {
  return NODE_DEFS.map((_, i) => {
    const { x, y } = nodeXY(i)
    if (i === 0) return `M${x},${y}`
    const p = nodeXY(i - 1)
    const h = MAP_ROW * 0.46
    return `C${p.x},${p.y + h} ${x},${y - h} ${x},${y}`
  }).join(' ')
}

// ── TinyRoshi (hero card corner) ─────────────────────────────────

function TinyRoshi() {
  return (
    <g>
      <path d="M112 82 Q124 80 136 96 Q138 102 134 108 Q126 112 116 96 Q112 90 112 82Z" fill="#2DAF7A" />
      <path d="M84 88 Q78 100 76 114 Q76 120 82 120 Q88 118 92 106 Q92 94 84 88Z" fill="#2DAF7A" />
      <ellipse cx="80" cy="96" rx="38" ry="9" fill="#D4C878" />
      <path d="M38 90 Q34 62 58 44 Q82 28 114 50 Q130 66 122 90Z" fill="#8B6420" />
      <path d="M50 82 Q46 62 66 50 Q86 38 110 56 Q120 68 114 82Z" fill="#A87830" opacity="0.4" />
      <path d="M44 82 Q26 78 8 96 Q6 102 8 108 Q18 116 40 96 Q44 88 44 82Z" fill="#3DBF90" />
      <path d="M42 68 Q34 60 28 56 Q26 50 30 46 Q38 42 46 50 Q50 58 46 68Z" fill="#3DBF90" />
      <g className={styles.miniHeadBob}>
        <circle cx="28" cy="36" r="22" fill="#3DBF90" />
        <circle cx="18" cy="34" r="10" fill="white" />
        <circle cx="38" cy="34" r="10" fill="white" />
        <circle cx="19" cy="35" r="5.5" fill="#1A1A08" className={styles.miniPupil} />
        <circle cx="39" cy="35" r="5.5" fill="#1A1A08" className={styles.miniPupil} />
        <circle cx="21" cy="32" r="2.2" fill="white" className={styles.miniPupil} />
        <circle cx="41" cy="32" r="2.2" fill="white" className={styles.miniPupil} />
        <path d="M18 50 Q28 51 38 45" stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g className={styles.miniLeafChew}>
          <path d="M38 45 Q52 30 62 36 Q58 50 38 45Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1.4" />
          <path d="M38 45 Q52 32 60 37" stroke="#2D8018" strokeWidth="1" fill="none" opacity="0.7" />
        </g>
      </g>
    </g>
  )
}

// ── Hero card world illustrations ────────────────────────────────

const SNOWFLAKES = [
  { x: 10, dur: '3.8s', delay: '0s' }, { x: 28, dur: '5.2s', delay: '1.2s' },
  { x: 48, dur: '4.4s', delay: '0.5s' }, { x: 65, dur: '3.5s', delay: '2.4s' },
  { x: 82, dur: '5.8s', delay: '0.9s' }, { x: 100, dur: '4.1s', delay: '1.8s' },
  { x: 118, dur: '4.9s', delay: '3.1s' }, { x: 133, dur: '3.3s', delay: '0.3s' },
]

function CoastHero() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 0 240 80" fill="none" aria-hidden="true">
      <defs><clipPath id="ch"><rect width="240" height="80"/></clipPath></defs>
      <g clipPath="url(#ch)">
        <g className={styles.waveScroll}>
          <path d="M-80,28 C-60,8 -20,48 0,28 C20,8 60,48 80,28 C100,8 140,48 160,28 C180,8 220,48 240,28 C260,8 300,48 320,28 C340,8 380,48 400,28 L400,80 L-80,80 Z" fill="currentColor" opacity="0.13"/>
          <path d="M-80,28 C-60,8 -20,48 0,28 C20,8 60,48 80,28 C100,8 140,48 160,28 C180,8 220,48 240,28 C260,8 300,48 320,28 C340,8 380,48 400,28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        </g>
        <g className={styles.waveScrollSlow}>
          <path d="M-80,46 C-60,40 -20,52 0,46 C20,40 60,52 80,46 C100,40 140,52 160,46 C180,40 220,52 240,46 C260,40 300,52 320,46 C340,40 380,52 400,46" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
        </g>
      </g>
      <g transform="translate(82,2) scale(0.48)">
        <g className={styles.oceanBob}><TinyRoshi /></g>
      </g>
    </svg>
  )
}

function WildHero() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 0 240 80" fill="none" aria-hidden="true">
      <path d="M0,80 C20,78 36,52 72,44 C108,36 114,62 144,58 C174,54 184,36 214,32 C244,28 260,56 280,62 L280,80 Z" fill="currentColor" opacity="0.14"/>
      <path d="M0,80 C20,78 36,52 72,44 C108,36 114,62 144,58 C174,54 184,36 214,32 C244,28 260,56 280,62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      <line x1="78" y1="44" x2="78" y2="62" stroke="currentColor" strokeWidth="1.8" opacity="0.32" strokeLinecap="round"/>
      <path d="M67,48 Q78,29 89,48Z" fill="currentColor" opacity="0.24"/>
      <line x1="198" y1="33" x2="198" y2="52" stroke="currentColor" strokeWidth="1.8" opacity="0.32" strokeLinecap="round"/>
      <path d="M187,38 Q198,19 209,38Z" fill="currentColor" opacity="0.24"/>
      <g transform="translate(108,12) scale(0.46)">
        <g className={styles.miniHeadBob}><TinyRoshi /></g>
      </g>
    </svg>
  )
}

function SummitHero() {
  return (
    <svg className={styles.worldSvg} width="240" height="80" viewBox="0 -42 240 122" overflow="visible" fill="none" aria-hidden="true">
      {SNOWFLAKES.map((s, i) => (
        <circle key={i} cx={s.x} cy={-20} r={3.5} fill="#c8e8ff"
          className={styles.snowflake}
          style={{ '--dur': s.dur, '--delay': s.delay } as React.CSSProperties}
        />
      ))}
      <path d="M0,80 C25,78 35,22 65,10 C90,0 92,44 115,50 C138,56 142,14 172,20 C198,26 210,58 240,74 L240,80 Z" fill="currentColor" opacity="0.14"/>
      <path d="M0,80 C25,78 35,22 65,10 C90,0 92,44 115,50 C138,56 142,14 172,20 C198,26 210,58 240,74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      <path d="M46,28 C55,16 60,10 65,10 C70,6 76,10 82,14 L78,19 L74,14 L70,19 L65,14 L60,19 L55,14 L50,19 Z" fill="#c8e8ff" opacity="0.85"/>
      <path d="M152,34 C162,22 168,20 172,20 C178,20 183,24 190,28 L186,33 L182,28 L178,33 L174,28 L170,33 L166,28 L162,33 L158,28 L154,33 Z" fill="#c8e8ff" opacity="0.9"/>
      <g transform="translate(119,-39) scale(0.66)"><TinyRoshi /></g>
    </svg>
  )
}

const TIER_HEROES = { coast: CoastHero, wild: WildHero, summit: SummitHero }

// ── Roshi on map disk (current node) ─────────────────────────────
// Coords relative to disk centre (0,0). Head floats above disk edge.

function RoshiOnDisk() {
  const headY = -(MAP_R + 18)
  return (
    <g>
      <ellipse cx={0} cy={-(MAP_R - 5)} rx={12} ry={7} fill="#8B6420" opacity="0.5"/>
      <rect x={-5.5} y={headY + 16} width={11} height={11} rx={4} fill="#3DBF90"/>
      <circle cx={0} cy={headY} r={16} fill="#3DBF90"/>
      <circle cx={-6}   cy={headY - 2} r={5}   fill="white"/>
      <circle cx={6}    cy={headY - 2} r={5}   fill="white"/>
      <circle cx={-5.5} cy={headY - 2} r={2.5} fill="#1A1A08"/>
      <circle cx={6.5}  cy={headY - 2} r={2.5} fill="#1A1A08"/>
      <circle cx={-4.5} cy={headY - 3.5} r={1} fill="white"/>
      <circle cx={7.5}  cy={headY - 3.5} r={1} fill="white"/>
      <path d={`M-5,${headY + 6} Q0,${headY + 10} 5,${headY + 6}`}
        stroke="#1A1A08" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </g>
  )
}

// ── Disk illustrations ────────────────────────────────────────────
// Each centred at (0,0), floating upward from disk centre.

function IllWave({ c }: { c: string }) {
  return (
    <g>
      <path d="M-16,2 C-9,-9 -3,13 3,2 C9,-9 13,8 18,2"
        stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M-16,9 C-9,4 -3,16 3,9 C9,4 13,14 18,9"
        stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
    </g>
  )
}
function IllAnchor({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round">
      <circle cx={0} cy={-10} r={4}/>
      <line x1="0" y1="-6" x2="0" y2="10"/>
      <path d="M-9,3 Q-9,13 0,13 Q9,13 9,3"/>
      <line x1="-6.5" y1="-10" x2="6.5" y2="-10"/>
    </g>
  )
}
function IllBoat({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2" strokeLinecap="round">
      <path d="M-13,8 Q0,15 13,8" fill={c} fillOpacity="0.18"/>
      <line x1="0" y1="-11" x2="0" y2="8"/>
      <path d="M0,-11 L13,5 L0,5 Z" fill={c} fillOpacity="0.28" strokeLinejoin="round"/>
    </g>
  )
}
function IllHill({ c }: { c: string }) {
  return (
    <g>
      <path d="M-19,10 Q-8,-8 0,-1 Q8,-8 19,10 Z"
        fill={c} fillOpacity="0.22" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M-19,14 C-5,7 5,11 19,14"
        stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35"/>
    </g>
  )
}
function IllTree({ c }: { c: string }) {
  return (
    <g stroke={c} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="0,-15 -11,0 11,0"  fill={c} fillOpacity="0.22" strokeWidth="1.8"/>
      <polygon points="0,-7 -14,8 14,8"   fill={c} fillOpacity="0.15" strokeWidth="1.8"/>
      <line x1="0" y1="8" x2="0" y2="14" strokeWidth="2.5"/>
    </g>
  )
}
function IllFire({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-15 Q11,-2 7,7 Q4,14 0,13 Q-4,14 -7,7 Q-11,-2 0,-15 Z"
        fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M0,-5 Q6,2 3,8 Q0,10 -3,8 Q-6,2 0,-5 Z"
        fill={c} fillOpacity="0.45"/>
    </g>
  )
}
function IllPeak({ c }: { c: string }) {
  return (
    <g>
      <path d="M-19,11 L0,-14 L19,11 Z"
        fill={c} fillOpacity="0.18" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M-8,-4 L0,-14 L8,-4 L5,-2 L-5,-2 Z"
        fill="white" fillOpacity="0.88"/>
    </g>
  )
}
function IllSnow({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="0"      y1="-13" x2="0"      y2="13"/>
      <line x1="-11.3"  y1="-6.5" x2="11.3" y2="6.5"/>
      <line x1="-11.3"  y1="6.5"  x2="11.3" y2="-6.5"/>
      <line x1="-5"     y1="-13"  x2="0"     y2="-9"/>
      <line x1="5"      y1="-13"  x2="0"     y2="-9"/>
    </g>
  )
}
function IllGem({ c }: { c: string }) {
  return (
    <g>
      <path d="M0,-13 L11,-3 L6,11 L-6,11 L-11,-3 Z"
        fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="-11" y1="-3" x2="11" y2="-3" stroke={c} strokeWidth="1.5"/>
      <line x1="-11" y1="-3" x2="0"  y2="11" stroke={c} strokeWidth="1"  opacity="0.4"/>
      <line x1="11"  y1="-3" x2="0"  y2="11" stroke={c} strokeWidth="1"  opacity="0.4"/>
    </g>
  )
}
function IllBook({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round">
      <path d="M-12,-11 L-12,11 Q0,8 0,11 Q0,8 12,11 L12,-11 Q0,-8 0,-11 Q0,-8 -12,-11 Z"
        fill={c} fillOpacity="0.16"/>
      <line x1="0" y1="-11" x2="0" y2="11"/>
      <line x1="-8" y1="-4" x2="-3" y2="-4" opacity="0.5"/>
      <line x1="-8" y1="0"  x2="-3" y2="0"  opacity="0.5"/>
    </g>
  )
}
function IllStar({ c }: { c: string }) {
  return (
    <path d="M0,-14 L3,-5 L13,-5 L6,1 L9,11 L0,5 L-9,11 L-6,1 L-13,-5 L-3,-5 Z"
      fill={c} fillOpacity="0.22" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
  )
}

type IllFn = ({ c }: { c: string }) => React.ReactNode
const ILL: Record<string, IllFn> = {
  wave: IllWave, anchor: IllAnchor, boat: IllBoat, hill: IllHill,
  tree: IllTree, fire: IllFire,    peak: IllPeak, snow: IllSnow,
  gem: IllGem,  book: IllBook,     star: IllStar,
}

// ── Main component ────────────────────────────────────────────────

export default function LevelHero() {
  const [currentLevel] = useState(() => {
    for (let lvl = 1; lvl <= 11; lvl++) {
      if (isLevelUnlocked(lvl) && completedInLevel(lvl).length < WORDS_PER_LEVEL) return lvl
    }
    return 11
  })

  const completed   = completedInLevel(currentLevel).length
  const remaining   = WORDS_PER_LEVEL - completed
  const pct         = Math.round((completed / WORDS_PER_LEVEL) * 100)
  const currentND   = NODE_DEFS[currentLevel - 1]
  const currentTier = WORLDS[currentND.world]
  const HeroIll     = TIER_HEROES[currentND.world]

  return (
    <div className={styles.wrap}>

      {/* ── Active mission hero card ── */}
      <Link href={`/play/${currentLevel}`} className={styles.heroLink}>
        <div className={styles.heroCard} style={{ borderTopColor: currentTier.color }}>
          <div className={styles.heroBody}>
            <div className={styles.heroLeft}>
              <div className={styles.heroEyebrow} style={{ color: currentTier.color }}>
                Mission {currentLevel}
                <span className={styles.heroEyebrowDot}>·</span>
                {DIFF[currentLevel]}
              </div>
              <div className={styles.heroTitle}>{LEVEL_NAMES[currentLevel]}</div>
              <div className={styles.heroStats}>
                <span className={styles.heroStatNum}>{remaining}</span>
                <span className={styles.heroStatLabel}> words left</span>
                {completed > 0 && <span className={styles.heroStatSub}> · {pct}%</span>}
              </div>
            </div>
            <div style={{ color: currentTier.color }}>
              <HeroIll />
            </div>
          </div>
          <div className={styles.playBtn}>
            {completed === 0 ? 'Begin Mission' : 'Continue'}
          </div>
        </div>
      </Link>

      {/* ── Mission path map ── */}
      <div className={styles.mapLabel}>All missions</div>

      <div className={styles.mapWrap}>
        <svg
          width="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ display: 'block' }}
        >
          {/* World section backgrounds */}
          {(Object.entries(WORLDS) as [WorldKey, typeof WORLDS.coast][]).map(([key, w]) => {
            const y1 = MAP_TOP + w.from * MAP_ROW - MAP_ROW * 0.5
            const y2 = MAP_TOP + w.to   * MAP_ROW + MAP_ROW * 0.5
            return (
              <g key={key}>
                <rect x={0} y={y1} width={MAP_W} height={y2 - y1}
                  fill={w.color} fillOpacity="0.07"/>
                <line x1={10} y1={y1 + 6} x2={10} y2={y2 - 6}
                  stroke={w.color} strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
                <text
                  x={MAP_W - 14} y={y1 + 18}
                  textAnchor="end"
                  fontFamily="var(--font-ui), system-ui, sans-serif"
                  fontSize="8" fontWeight="800"
                  letterSpacing="1.2"
                  fill={w.color} fillOpacity="0.65"
                >
                  {w.label.toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* Trail — full dashed grey */}
          <path
            d={buildFullPath()}
            fill="none"
            stroke="var(--surface2)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="13 10"
          />

          {/* Trail — completed portion coloured */}
          {NODE_DEFS.slice(0, currentLevel - 1).map((_, i) => {
            const from = nodeXY(i)
            const to   = nodeXY(i + 1)
            const h    = MAP_ROW * 0.46
            const wc   = WORLDS[NODE_DEFS[i].world].color
            return (
              <path key={i}
                d={`M${from.x},${from.y} C${from.x},${from.y + h} ${to.x},${to.y - h} ${to.x},${to.y}`}
                fill="none" stroke={wc} strokeWidth="5"
                strokeLinecap="round" opacity="0.55"
              />
            )
          })}

          {/* Nodes */}
          {NODE_DEFS.map((nd, i) => {
            const { x, y }   = nodeXY(i)
            const wc          = WORLDS[nd.world].color
            const isCurrent   = nd.level === currentLevel
            const isDone      = nd.level <  currentLevel
            const isLocked    = nd.level >  currentLevel
            const done        = completedInLevel(nd.level).length
            const nodePct     = Math.round((done / WORDS_PER_LEVEL) * 100)

            const diskFill = isCurrent ? 'var(--accent)' : isDone ? wc : 'var(--surface2)'
            const IllComp  = ILL[nd.icon] as IllFn

            // cols 0,1 → label right; cols 2,3 → label left
            const lblRight = nd.col <= 1
            const lblX     = lblRight ? MAP_R + 14 : -(MAP_R + 14)
            const anchor   = lblRight ? 'start' : 'end'

            return (
              <g key={nd.level}>
                <g transform={`translate(${x},${y})`}
                   style={{ cursor: isLocked ? 'default' : 'pointer' }}
                   onClick={isLocked ? undefined : () => { window.location.href = `/play/${nd.level}` }}
                >
                  {/* Pulse rings */}
                  {isCurrent && (
                    <>
                      <circle r={MAP_R + 13} fill="none"
                        stroke="var(--accent)" strokeWidth="2" opacity="0.15"/>
                      <circle r={MAP_R + 7} fill="none"
                        stroke="var(--accent)" strokeWidth="2.5" opacity="0.25"/>
                    </>
                  )}

                  {/* Coin rim — offset circle below gives depth illusion */}
                  <circle cy={6} r={MAP_R}
                    fill={isCurrent ? '#7a4800' : isDone ? wc : '#aaa'}
                    fillOpacity={isCurrent ? 0.6 : isDone ? 0.5 : 0.25}
                  />

                  {/* Disk face */}
                  <circle r={MAP_R} fill={diskFill}/>

                  {/* Top-face highlight (light sheen) */}
                  <ellipse
                    cx={0} cy={-(MAP_R * 0.48)}
                    rx={MAP_R * 0.58} ry={MAP_R * 0.2}
                    fill="white" fillOpacity="0.16"
                  />

                  {/* Content — illustrations scaled up and lifted to emerge above disk rim */}
                  {isCurrent ? (
                    <RoshiOnDisk/>
                  ) : isDone ? (
                    <path d="M-10,0 L-3,8 L10,-8"
                      stroke="white" strokeWidth="3" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <g transform="translate(0,-12) scale(1.55)"
                       opacity={isLocked ? 0.55 : 1}>
                      <IllComp c={wc}/>
                    </g>
                  )}

                  {/* Level number badge */}
                  <text y={MAP_R - 7}
                    textAnchor="middle"
                    fontFamily="var(--font-ui), system-ui, sans-serif"
                    fontSize="9" fontWeight="800"
                    fill={isCurrent || isDone ? 'rgba(255,255,255,0.55)' : 'var(--muted)'}
                    letterSpacing="0.04em">
                    {nd.level}
                  </text>

                  {/* Mission name */}
                  <text x={lblX} y={-6}
                    textAnchor={anchor}
                    fontFamily="var(--font-ui), system-ui, sans-serif"
                    fontSize="13"
                    fontWeight={isCurrent ? '800' : '600'}
                    fill={isCurrent ? 'var(--accent)' : isLocked ? 'var(--muted)' : 'var(--text)'}>
                    {LEVEL_NAMES[nd.level]}
                  </text>

                  {/* Sub — difficulty or progress */}
                  <text x={lblX} y={11}
                    textAnchor={anchor}
                    fontFamily="var(--font-ui), system-ui, sans-serif"
                    fontSize="9" fontWeight="700"
                    letterSpacing="0.07em"
                    fill={isLocked ? 'var(--border)' : 'var(--muted)'}
                    fillOpacity={isLocked ? 1 : 0.8}>
                    {isCurrent && nodePct > 0
                      ? `${nodePct}%`
                      : DIFF[nd.level].toUpperCase()}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
