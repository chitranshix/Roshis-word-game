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

        {/* ── LEFT FLIPPER (behind shell) ── */}
        <path d="M18 68 Q4 62 2 78 Q6 90 22 84 Q28 80 26 72Z"
          fill="#4AA820" stroke="#1A1A08" strokeWidth="2" />

        {/* ── RIGHT FLIPPER (behind shell) ── */}
        <path d="M82 68 Q96 62 98 78 Q94 90 78 84 Q72 80 74 72Z"
          fill="#4AA820" stroke="#1A1A08" strokeWidth="2" />

        {/* ── SHELL (carapace) ── */}
        <ellipse cx="50" cy="72" rx="36" ry="30" fill="#7A8A18" stroke="#1A1A08" strokeWidth="2.2" />
        {/* dome highlight */}
        <ellipse cx="46" cy="62" rx="18" ry="12" fill="#9AAC24" opacity="0.45" />
        {/* vertebral scutes — center ridge */}
        <path d="M50 44 Q52 58 50 98" stroke="#5A6C10" strokeWidth="1.8" fill="none" />
        {/* costal scute lines — left */}
        <path d="M50 52 Q38 58 22 72" stroke="#5A6C10" strokeWidth="1.4" fill="none" />
        <path d="M50 66 Q38 70 20 80" stroke="#5A6C10" strokeWidth="1.3" fill="none" />
        <path d="M50 80 Q40 82 26 90" stroke="#5A6C10" strokeWidth="1.2" fill="none" />
        {/* costal scute lines — right */}
        <path d="M50 52 Q62 58 78 72" stroke="#5A6C10" strokeWidth="1.4" fill="none" />
        <path d="M50 66 Q62 70 80 80" stroke="#5A6C10" strokeWidth="1.3" fill="none" />
        <path d="M50 80 Q60 82 74 90" stroke="#5A6C10" strokeWidth="1.2" fill="none" />

        {/* ── PLASTRON (belly plate — just the bottom edge) ── */}
        <path d="M24 96 Q50 104 76 96 Q72 102 50 106 Q28 102 24 96Z"
          fill="#C8DC5A" stroke="#1A1A08" strokeWidth="1.8" />

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
