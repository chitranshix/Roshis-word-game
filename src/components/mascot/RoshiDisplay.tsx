// Static front-facing Roshi for screen moments (result, onboarding)
import type { RoshiExpression } from './Roshi'
import styles from './RoshiDisplay.module.css'

export default function RoshiDisplay({ expression = 'idle', size = 120 }: {
  expression?: RoshiExpression
  size?: number
}) {
  return (
    <div className={[styles.wrapper, styles[expression]].join(' ')} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">

        {/* ── FRONT LEGS ── */}
        <ellipse cx="28" cy="80" rx="16" ry="9" fill="#5CB828" stroke="#1A1A08" strokeWidth="2.2"
          transform="rotate(-30,28,80)" />
        <ellipse cx="72" cy="80" rx="16" ry="9" fill="#5CB828" stroke="#1A1A08" strokeWidth="2.2"
          transform="rotate(30,72,80)" />

        {/* ── BACK LEGS ── */}
        <ellipse cx="20" cy="92" rx="14" ry="7" fill="#4AA820" stroke="#1A1A08" strokeWidth="2"
          transform="rotate(-15,20,92)" />
        <ellipse cx="80" cy="92" rx="14" ry="7" fill="#4AA820" stroke="#1A1A08" strokeWidth="2"
          transform="rotate(15,80,92)" />

        {/* ── SHELL ── */}
        <ellipse cx="50" cy="68" rx="38" ry="32" fill="#8A9A1E" stroke="#1A1A08" strokeWidth="2.2" />
        <ellipse cx="44" cy="58" rx="20" ry="14" fill="#A8BC28" opacity="0.5" />
        {/* cracks */}
        <path d="M50,40 Q54,58 50,86"     stroke="#5A6C10" strokeWidth="1.8" fill="none" />
        <path d="M28,50 Q38,64 34,84"     stroke="#5A6C10" strokeWidth="1.5" fill="none" />
        <path d="M72,50 Q62,64 66,84"     stroke="#5A6C10" strokeWidth="1.5" fill="none" />
        <path d="M18,68 Q50,62 82,68"     stroke="#5A6C10" strokeWidth="1.4" fill="none" />

        {/* ── BELLY ── */}
        <ellipse cx="50" cy="92" rx="38" ry="10" fill="#C8DC5A" stroke="#1A1A08" strokeWidth="2" />

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
            {/* smirk — left corner down, right corner up */}
            <path d="M36 43 Q44 44 52 40 Q58 37 62 38" stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* leaf sticking out right corner — big */}
            <g className={styles.leafChew}>
              <path d="M60 40 Q78 22 90 28 Q86 46 60 40Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1.4" />
              <path d="M62 40 Q78 24 88 29" stroke="#2D8018" strokeWidth="1" fill="none" opacity="0.7" />
            </g>
          </>}

        </g>

      </svg>
    </div>
  )
}
