// Static front-facing Roshi for screen moments (result, onboarding)
import type { RoshiExpression } from './Roshi'
import styles from './RoshiDisplay.module.css'

export default function RoshiDisplay({ expression = 'idle', size = 120 }: {
  expression?: RoshiExpression
  size?: number
}) {
  return (
    <div className={[styles.wrapper, styles[expression]].join(' ')} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">

        {/* ── REAR FLIPPERS — short, round, peek below shell ── */}
        <path d="M30 96 Q18 100 16 110 Q24 116 36 108 Q40 102 34 96Z"
          fill="#4AA820" stroke="#1A1A08" strokeWidth="1.8" />
        <path d="M70 96 Q82 100 84 110 Q76 116 64 108 Q60 102 66 96Z"
          fill="#4AA820" stroke="#1A1A08" strokeWidth="1.8" />

        {/* ── FRONT FLIPPERS — long paddles, wing-like, behind shell ── */}
        <path d="M16 72 Q2 66 -2 80 Q2 92 18 88 Q26 82 22 72Z"
          fill="#5CB828" stroke="#1A1A08" strokeWidth="2" />
        <path d="M84 72 Q98 66 102 80 Q98 92 82 88 Q74 82 78 72Z"
          fill="#5CB828" stroke="#1A1A08" strokeWidth="2" />

        {/* ── SHELL — wide flat streamlined oval, aquatic not domed ── */}
        <ellipse cx="50" cy="76" rx="38" ry="26" fill="#7A8A18" stroke="#1A1A08" strokeWidth="2.2" />
        {/* subtle highlight */}
        <ellipse cx="46" cy="66" rx="16" ry="10" fill="#9AAC24" opacity="0.4" />
        {/* scute pattern: vertebral center + 2 costal lines each side + 1 horizontal */}
        <path d="M50 52 Q51 76 50 100" stroke="#5A6C10" strokeWidth="1.6" fill="none" />
        <path d="M50 60 Q38 66 20 74" stroke="#5A6C10" strokeWidth="1.3" fill="none" />
        <path d="M50 76 Q38 80 20 86" stroke="#5A6C10" strokeWidth="1.2" fill="none" />
        <path d="M50 60 Q62 66 80 74" stroke="#5A6C10" strokeWidth="1.3" fill="none" />
        <path d="M50 76 Q62 80 80 86" stroke="#5A6C10" strokeWidth="1.2" fill="none" />
        <path d="M20 78 Q50 74 80 78" stroke="#5A6C10" strokeWidth="1.1" fill="none" />

        {/* ── PLASTRON — cream belly plate at the base ── */}
        <ellipse cx="50" cy="98" rx="22" ry="7" fill="#C8DC5A" stroke="#1A1A08" strokeWidth="1.6" />

        {/* ── HEAD GROUP (bobs independently) ── */}
        <g className={expression === 'idle' ? styles.headBob : ''}>

          {/* ── NECK ── */}
          <ellipse cx="50" cy="44" rx="12" ry="10" fill="#5CB828" stroke="#1A1A08" strokeWidth="2.2" />

          {/* ── HEAD ── */}
          <circle cx="50" cy="26" r="22" fill="#5CB828" stroke="#1A1A08" strokeWidth="2.2" />

          {/* ── EYES ── */}
          {expression === 'happy' ? <>
            <path d="M34 20 Q42 10 50 20" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M50 20 Q58 10 66 20" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </> : expression === 'disappointed' ? <>
            <path d="M28 14 Q42 22 50 18" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M50 18 Q58 22 72 14" stroke="#1A1A08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="38" cy="26" r="9"   fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="62" cy="26" r="9"   fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="38" cy="28" r="5"   fill="#1A1A08" />
            <circle cx="62" cy="28" r="5"   fill="#1A1A08" />
            <path d="M72 10 Q76 5 74 11 Q79 6 78 13" stroke="#E84040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </> : <>
            <circle cx="38" cy="24" r="10"  fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="62" cy="24" r="10"  fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="39" cy="25" r="5.5" fill="#1A1A08" className={styles.pupilL} />
            <circle cx="63" cy="25" r="5.5" fill="#1A1A08" className={styles.pupilR} />
            <circle cx="41" cy="22" r="2.2" fill="white" className={styles.pupilL} />
            <circle cx="65" cy="22" r="2.2" fill="white" className={styles.pupilR} />
          </>}

          {/* ── MOUTH ── */}
          {expression === 'happy' ? <>
            <path d="M34 38 Q50 52 66 38" stroke="#1A1A08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </> : expression === 'disappointed' ? <>
            <path d="M36 42 Q44 34 50 38 Q56 42 64 34" stroke="#1A1A08" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </> : <>
            {/* smirk — short, sharp uptick at right, ends at (63,36) */}
            <path d="M42 42 Q52 43 63 36" stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* leaf anchored exactly at mouth corner (63,36) */}
            <g className={styles.leafChew}>
              <path d="M63 36 Q80 18 92 24 Q88 42 63 36Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1.4" />
              <path d="M63 36 Q80 20 90 25" stroke="#2D8018" strokeWidth="1" fill="none" opacity="0.7" />
            </g>
          </>}

        </g>

      </svg>
    </div>
  )
}
