'use client'

/* ──────────────────────────────────────────────────────────────────
   /map-mock — Wireframe: Mission Map redesign
   Not connected to game state. Visit: localhost:3000/map-mock

   Concept:
   · Vertical scroll, single SVG spine
   · 4 columns — nodes placed at different columns, connected by
     an S-curve dashed path (like a winding trail)
   · Each node = a disk; world-themed SVG illustration sits on top
   · Roshi peeks above the current node's disk
   · Three world sections: Coast → Wild → Summit
──────────────────────────────────────────────────────────────── */

const W     = 390    // viewBox width
const R     = 30     // disk radius
const ROW_H = 116    // vertical pitch between node centres
const TOP   = 80     // y of first node centre

// 4 column x-centres (within 390px canvas with 16px side padding)
const COLS = [58, 148, 242, 332]

interface NodeDef {
  level:  number
  col:    0 | 1 | 2 | 3
  name:   string
  world:  'coast' | 'wild' | 'summit'
  icon:   string
}

const NODES: NodeDef[] = [
  { level: 1,  col: 1, name: 'Foundations',    world: 'coast',  icon: 'wave'   },
  { level: 2,  col: 3, name: 'Essentials',      world: 'coast',  icon: 'anchor' },
  { level: 3,  col: 2, name: 'Building Blocks', world: 'coast',  icon: 'boat'   },
  { level: 4,  col: 0, name: 'Expanding',       world: 'wild',   icon: 'hill'   },
  { level: 5,  col: 2, name: 'Intermediate',    world: 'wild',   icon: 'tree'   },
  { level: 6,  col: 3, name: 'Advanced',        world: 'wild',   icon: 'fire'   },
  { level: 7,  col: 1, name: 'Proficient',      world: 'summit', icon: 'peak'   },
  { level: 8,  col: 3, name: 'Expert',          world: 'summit', icon: 'snow'   },
  { level: 9,  col: 0, name: 'Master',          world: 'summit', icon: 'gem'    },
  { level: 10, col: 2, name: 'Scholar',         world: 'summit', icon: 'book'   },
  { level: 11, col: 1, name: 'Virtuoso',        world: 'summit', icon: 'star'   },
]

type World = 'coast' | 'wild' | 'summit'

const WORLDS: Record<World, { color: string; label: string; from: number; to: number }> = {
  coast:  { color: '#2a9d8f', label: 'The Coast',  from: 0, to: 2  },
  wild:   { color: '#5a8a3a', label: 'The Wild',   from: 3, to: 5  },
  summit: { color: '#5272a0', label: 'The Summit', from: 6, to: 10 },
}

const CURRENT = 5   // mock: level 5 is the active mission

// ── Geometry helpers ─────────────────────────────────────────────

function nodeXY(i: number) {
  return { x: COLS[NODES[i].col], y: TOP + i * ROW_H }
}

/** Full S-curve path through every node centre */
function buildFullPath() {
  return NODES.map((_, i) => {
    const { x, y } = nodeXY(i)
    if (i === 0) return `M${x},${y}`
    const prev = nodeXY(i - 1)
    const h = ROW_H * 0.46
    return `C${prev.x},${prev.y + h} ${x},${y - h} ${x},${y}`
  }).join(' ')
}

// ── World-themed SVG illustrations ───────────────────────────────
// Each is centred at (0,0) = disk centre; they float upward.

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
        fill={c} fillOpacity="0.22"
        stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      <line x1="0"     y1="-13" x2="0"      y2="13"/>
      <line x1="-11.3" y1="-6.5" x2="11.3" y2="6.5"/>
      <line x1="-11.3" y1="6.5"  x2="11.3" y2="-6.5"/>
      <line x1="-5"    y1="-13"  x2="0"     y2="-9"/>
      <line x1="5"     y1="-13"  x2="0"     y2="-9"/>
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

// ── Roshi (current node — head peeks above the disk) ─────────────
// Coordinates relative to disk centre (0,0).

function RoshiOnDisk() {
  const headY = -(R + 20)   // head centre floats above disk top edge
  return (
    <g>
      {/* Shell stub visible at disk top */}
      <ellipse cx={0} cy={-(R - 6)} rx={14} ry={8} fill="#8B6420" opacity="0.55"/>
      {/* Neck */}
      <rect x={-6} y={headY + 16} width={12} height={12} rx={5} fill="#3DBF90"/>
      {/* Head */}
      <circle cx={0} cy={headY} r={17} fill="#3DBF90"/>
      {/* Whites */}
      <circle cx={-6}  cy={headY - 2} r={5.5} fill="white"/>
      <circle cx={6}   cy={headY - 2} r={5.5} fill="white"/>
      {/* Pupils */}
      <circle cx={-5.5} cy={headY - 2} r={2.8} fill="#1A1A08"/>
      <circle cx={6.5}  cy={headY - 2} r={2.8} fill="#1A1A08"/>
      {/* Pupil highlights */}
      <circle cx={-4.5} cy={headY - 3.8} r={1.1} fill="white"/>
      <circle cx={7.5}  cy={headY - 3.8} r={1.1} fill="white"/>
      {/* Smile */}
      <path d={`M-5,${headY + 7} Q0,${headY + 12} 5,${headY + 7}`}
        stroke="#1A1A08" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </g>
  )
}

// ── Main ─────────────────────────────────────────────────────────

const TOTAL_H = TOP + (NODES.length - 1) * ROW_H + 100

export default function MapMock() {
  return (
    <div style={{
      maxWidth: 430,
      margin: '0 auto',
      background: '#f0f0f3',
      minHeight: '100dvh',
    }}>

      {/* Wireframe header */}
      <div style={{
        padding: '14px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#aaa',
        borderBottom: '1px solid #e0e0e6',
      }}>
        Wireframe — Mission Map &nbsp;·&nbsp; current = level {CURRENT}
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${TOTAL_H}`}
        style={{ display: 'block' }}
      >
        {/* ── World section backgrounds ── */}
        {(Object.entries(WORLDS) as [World, typeof WORLDS.coast][]).map(([key, w]) => {
          const y1 = TOP + w.from * ROW_H - ROW_H * 0.5
          const y2 = TOP + w.to   * ROW_H + ROW_H * 0.5
          return (
            <g key={key}>
              <rect x={0} y={y1} width={W} height={y2 - y1}
                fill={w.color} fillOpacity="0.07"/>
              {/* World label — top-right corner of band */}
              <text
                x={W - 16} y={y1 + 18}
                textAnchor="end"
                fontFamily="system-ui, sans-serif"
                fontSize="9" fontWeight="800"
                letterSpacing="1.2"
                fill={w.color} fillOpacity="0.7"
              >
                {w.label.toUpperCase()}
              </text>
              {/* Left border accent */}
              <line x1={8} y1={y1 + 4} x2={8} y2={y2 - 4}
                stroke={w.color} strokeWidth="2.5"
                strokeLinecap="round" opacity="0.3"/>
            </g>
          )
        })}

        {/* ── Trail path (full, dashed grey) ── */}
        <path
          d={buildFullPath()}
          fill="none"
          stroke="#ccc"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="13 10"
        />

        {/* ── Completed trail segments (solid, world-coloured) ── */}
        {NODES.slice(0, CURRENT - 1).map((_, i) => {
          const from = nodeXY(i)
          const to   = nodeXY(i + 1)
          const h    = ROW_H * 0.46
          const wc   = WORLDS[NODES[i].world].color
          return (
            <path key={i}
              d={`M${from.x},${from.y} C${from.x},${from.y + h} ${to.x},${to.y - h} ${to.x},${to.y}`}
              fill="none" stroke={wc} strokeWidth="5"
              strokeLinecap="round" opacity="0.55"
            />
          )
        })}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => {
          const { x, y } = nodeXY(i)
          const wc         = WORLDS[node.world].color
          const isCurrent  = node.level === CURRENT
          const isDone     = node.level <  CURRENT
          const isLocked   = node.level >  CURRENT

          const diskFill   = isCurrent ? '#c86010' : isDone ? wc : '#e4e4ec'
          const diskStroke = isCurrent ? '#fff'    : isDone ? wc : '#d2d2de'
          const IllComp    = ILL[node.icon] as IllFn

          // cols 0,1 → label on RIGHT; cols 2,3 → label on LEFT
          const lblRight = node.col <= 1
          const lblX     = lblRight ? R + 14 : -(R + 14)
          const anchor   = lblRight ? 'start' : 'end'

          return (
            <g key={node.level} transform={`translate(${x},${y})`}>

              {/* Outer pulse ring (current only) */}
              {isCurrent && (
                <>
                  <circle r={R + 14} fill="none"
                    stroke="#c86010" strokeWidth="2" opacity="0.18"/>
                  <circle r={R + 7} fill="none"
                    stroke="#c86010" strokeWidth="2.5" opacity="0.28"/>
                </>
              )}

              {/* Drop shadow */}
              <circle cy={5} r={R}
                fill={isDone ? wc : '#888'} fillOpacity="0.14"/>

              {/* ── Disk ── */}
              <circle r={R}
                fill={diskFill}
                stroke={diskStroke}
                strokeWidth={isCurrent ? 3.5 : 2}
              />

              {/* ── Content on disk ── */}
              {isCurrent ? (
                <RoshiOnDisk/>
              ) : isDone ? (
                /* Checkmark */
                <path d="M-10,0 L-3,8 L10,-8"
                  stroke="white" strokeWidth="3" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                /* World illustration */
                <g opacity={isLocked ? 0.4 : 1}>
                  <IllComp c={isLocked ? '#a4a4b8' : wc}/>
                </g>
              )}

              {/* Level number — bottom of disk */}
              <text y={R - 7}
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                fontSize="9" fontWeight="800"
                letterSpacing="0.04em"
                fill={isCurrent || isDone ? 'rgba(255,255,255,0.55)' : '#c0c0d0'}>
                {node.level}
              </text>

              {/* ── Labels (to the side) ── */}
              <text x={lblX} y={-6}
                textAnchor={anchor}
                fontFamily="system-ui, sans-serif"
                fontSize="13"
                fontWeight={isCurrent ? '800' : '600'}
                fill={isCurrent ? '#c86010' : isLocked ? '#b8b8cc' : '#222230'}>
                {node.name}
              </text>
              <text x={lblX} y={10}
                textAnchor={anchor}
                fontFamily="system-ui, sans-serif"
                fontSize="9" fontWeight="700"
                letterSpacing="0.08em"
                fill={isLocked ? '#c8c8d8' : '#aaaabb'}>
                {['EASY','EASY','EASY','MED','MED','MED',
                  'HARD','HARD','HARD','HARD','HARD'][i]}
              </text>

            </g>
          )
        })}
      </svg>
    </div>
  )
}
