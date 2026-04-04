'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Roshi.module.css'

export type RoshiExpression = 'idle' | 'happy' | 'disappointed'

const TURTLE_W  = 130
const IDLE_SPD  = 0.65
const HAPPY_SPD = 5
const SW = 2.2   // stroke width

export default function Roshi({ expression = 'idle' }: { expression?: RoshiExpression }) {
  const [x, setX]               = useState(-TURTLE_W)
  const [facingRight, setFacing] = useState(true)
  const [bonking, setBonking]    = useState(false)

  const xRef      = useRef(-TURTLE_W)
  const dirRef    = useRef(1)
  const rafRef    = useRef(0)
  const bonkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (expression === 'disappointed') {
      cancelAnimationFrame(rafRef.current)
      return
    }
    const speed = expression === 'happy' ? HAPPY_SPD : IDLE_SPD

    const tick = () => {
      const maxX = window.innerWidth - TURTLE_W
      xRef.current += dirRef.current * speed

      if (xRef.current >= maxX) {
        xRef.current = maxX
        if (dirRef.current === 1) {
          dirRef.current = -1
          setFacing(false)
          setBonking(true)
          clearTimeout(bonkTimer.current)
          bonkTimer.current = setTimeout(() => setBonking(false), 400)
        }
      } else if (xRef.current <= 0) {
        xRef.current = 0
        if (dirRef.current === -1) {
          dirRef.current = 1
          setFacing(true)
          setBonking(true)
          clearTimeout(bonkTimer.current)
          bonkTimer.current = setTimeout(() => setBonking(false), 400)
        }
      }

      setX(xRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(bonkTimer.current)
    }
  }, [expression])

  const cls = [styles.wrapper, styles[expression], bonking ? styles.bonk : ''].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      style={{ left: x, transform: `scaleX(${facingRight ? 1 : -1})` }}
      aria-hidden="true"
    >
      {/* Faithful to reference image 2: side-view, dome shell, olive+green, big eyes */}
      <svg viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" overflow="visible">

        {/* ── TAIL ── */}
        <ellipse cx="18" cy="64" rx="12" ry="7" fill="#5CB828" stroke="#1A1A08" strokeWidth={SW}
          transform="rotate(-30,18,64)" />

        {/* ── BACK LEGS ── */}
        <ellipse className={styles.legBL} cx="30" cy="76" rx="16" ry="9" fill="#5CB828" stroke="#1A1A08" strokeWidth={SW}
          transform="rotate(18,30,76)" />
        <ellipse className={styles.legBR} cx="50" cy="80" rx="15" ry="8" fill="#4AA820" stroke="#1A1A08" strokeWidth={SW}
          transform="rotate(5,50,80)" />

        {/* ── SHELL — domed, olive-brown, faithful to ref ── */}
        <path
          d="M20,64 C16,32 38,6 80,4 C122,2 138,30 136,62 C134,74 22,74 20,64 Z"
          fill="#8A9A1E" stroke="#1A1A08" strokeWidth={SW}
        />
        {/* shell highlight */}
        <ellipse cx="74" cy="32" rx="32" ry="20" fill="#A8BC28" opacity="0.5" />
        {/* crack lines — irregular, like ref image */}
        <path d="M80,6 Q86,28 80,58"     stroke="#5A6C10" strokeWidth="2"   fill="none" />
        <path d="M46,16 Q60,38 56,66"    stroke="#5A6C10" strokeWidth="1.8" fill="none" />
        <path d="M114,16 Q100,38 104,66" stroke="#5A6C10" strokeWidth="1.8" fill="none" />
        <path d="M30,46 Q80,38 130,46"   stroke="#5A6C10" strokeWidth="1.6" fill="none" />
        <path d="M50,24 Q80,18 110,24"   stroke="#5A6C10" strokeWidth="1.3" fill="none" opacity="0.7" />

        {/* ── BELLY BAND — yellow-green strip at shell base ── */}
        <path
          d="M20,64 C22,72 134,72 136,62 C134,76 22,76 20,64 Z"
          fill="#C8DC5A" stroke="#1A1A08" strokeWidth={SW}
        />

        {/* ── FRONT LEGS ── */}
        <ellipse className={styles.legFR} cx="115" cy="80" rx="15" ry="8" fill="#5CB828" stroke="#1A1A08" strokeWidth={SW}
          transform="rotate(-5,115,80)" />
        <ellipse className={styles.legFL} cx="132" cy="76" rx="16" ry="9" fill="#4AA820" stroke="#1A1A08" strokeWidth={SW}
          transform="rotate(-18,132,76)" />

        {/* ── NECK — thick rounded, like ref ── */}
        <path d="M130,56 Q144,46 152,30" stroke="#5CB828" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M130,56 Q144,46 152,30" stroke="#1A1A08" strokeWidth={SW} fill="none" strokeLinecap="round" />

        {/* ── HEAD ── */}
        <g className={[styles.head, bonking ? styles.bonkHead : ''].filter(Boolean).join(' ')}>
          <circle cx="156" cy="24" r="17" fill="#5CB828" stroke="#1A1A08" strokeWidth={SW} />

          {/* ── EYES — big white circles with pupils, just like ref ── */}
          {expression === 'happy' ? <>
            {/* squint arcs */}
            <path d="M146 18 Q152 10 158 18" stroke="#1A1A08" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M160 16 Q165 8 170 16" stroke="#1A1A08" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="147" cy="31" rx="6" ry="3.5" fill="#F0A0B8" opacity="0.6" />
            <ellipse cx="164" cy="29" rx="5"  ry="3"   fill="#F0A0B8" opacity="0.6" />
          </> : expression === 'disappointed' ? <>
            {/* angry brows */}
            <path d="M144 14 Q152 20 158 16" stroke="#1A1A08" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M160 14 Q166 20 172 16" stroke="#1A1A08" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <circle cx="151" cy="24" r="7.5" fill="white" stroke="#1A1A08" strokeWidth="1.5" />
            <circle cx="164" cy="22" r="6.5" fill="white" stroke="#1A1A08" strokeWidth="1.5" />
            <circle cx="152" cy="26" r="4"   fill="#1A1A08" />
            <circle cx="165" cy="24" r="3.5" fill="#1A1A08" />
            <path d="M162 10 Q166 5 164 11 Q169 7 168 13" stroke="#E84040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </> : <>
            {/* idle — big eyes, heavy lids, slightly sleepy */}
            <circle cx="150" cy="22" r="8.5" fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            <circle cx="164" cy="20" r="7.5" fill="white" stroke="#1A1A08" strokeWidth="1.8" />
            {/* droopy upper lids */}
            <path d="M141 19 Q150 13 159 19" fill="#5CB828" stroke="#1A1A08" strokeWidth="1.5" />
            <path d="M156 17 Q164 11 172 17" fill="#5CB828" stroke="#1A1A08" strokeWidth="1.5" />
            {/* rolling pupils */}
            <circle className={styles.pupilL} cx="151" cy="24" r="4.5" fill="#1A1A08" />
            <circle className={styles.pupilR} cx="165" cy="22" r="4"   fill="#1A1A08" />
            <circle cx="153" cy="21" r="1.8" fill="white" />
            <circle cx="167" cy="19" r="1.5" fill="white" />
          </>}

          {/* ── MOUTH ── */}
          {expression === 'happy' ? <>
            <path d="M144 35 Q156 48 168 35" fill="#8B2035" stroke="#1A1A08" strokeWidth="1.5" />
            <path d="M144 35 Q156 40 168 35" fill="white" />
            <path d="M150 42 Q156 48 162 42" fill="#E8446A" />
          </> : expression === 'disappointed' ? <>
            <path d="M146 36 Q153 29 159 33 Q164 37 170 30"
              stroke="#1A1A08" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </> : <>
            {/* lazy smirk */}
            <path d="M148 35 Q157 42 167 35" stroke="#1A1A08" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* leaf sticking out */}
            <g className={styles.leaf}>
              <path d="M155 36 Q166 25 175 29 Q172 39 155 36Z" fill="#4DB330" stroke="#2D8018" strokeWidth="1" />
              <path d="M157 34 Q165 26 172 30" stroke="#2D8018" strokeWidth="0.7" fill="none" opacity="0.7" />
            </g>
          </>}
        </g>

      </svg>
    </div>
  )
}
