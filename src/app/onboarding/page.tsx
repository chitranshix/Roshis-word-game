'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import type { RoshiExpression } from '@/components/mascot/Roshi'
import styles from './page.module.css'

interface Slide {
  expression: RoshiExpression
  lines: string[]
}

const SLIDES: Slide[] = [
  {
    expression: 'idle',
    lines: [
      "Hii, I'm Roshi.",
      "I know a great many words. You probably don't. But I suppose I can help with that.",
    ],
  },
  {
    expression: 'idle',
    lines: [
      "So here's the game —",
      "You dare your friends with a word you know. They dare you back.",
      "No friends? You can play with me.",
    ],
  },
  {
    expression: 'happy',
    lines: [
      "Each dare comes with a word and 4 sentences. 1 of the sentences is correct. The others exist purely to embarrass you.",
      "Get the sentence right and you get to define the word. Get that right too and you get points. Fail either one and well... what can I do... you try again.",
    ],
  },
  {
    expression: 'idle',
    lines: [
      "Now, what should I call you?",
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [name, setName] = useState('')

  const slide      = SLIDES[page]
  const isLastPage = page === SLIDES.length - 1

  const handleContinue = () => {
    if (isLastPage) {
      if (name.trim().length < 2) return
      localStorage.setItem('roshi_name', name.trim())
      router.push('/')
    } else {
      setPage(p => p + 1)
    }
  }

  return (
    <div className={styles.screen}>

      {/* ── Header: logo left, toggle right ── */}
      <div className={styles.header}>
        <div className={styles.logo}>Roshi&apos;s Word Game</div>
        <div className={styles.headerRight}>
          <ThemeToggle />
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Nav row: back left, dots right ── */}
        <div className={styles.navRow}>
          {page > 0 ? (
            <button className={styles.backBtn} onClick={() => setPage(p => p - 1)} aria-label="Back">
              ←
            </button>
          ) : <span />}
          <div className={styles.dots}>
            {SLIDES.map((_, i) => (
              <div key={i} className={[styles.dot, i === page ? styles.dotActive : ''].join(' ')} />
            ))}
          </div>
        </div>

        {/* Only the bubble changes — Roshi and button stay fixed below */}
        <div className={styles.bubbleWrap}>
          <SpeechBubble key={page} className={styles.bubbleAnim} tail="bottom-right">
            {slide.lines.map((line, i) => (
              <p key={i} className={styles.bubbleLine}>{line}</p>
            ))}
          </SpeechBubble>
        </div>

        {/* Fixed bottom section — never shifts */}
        <div className={styles.bottomSection}>
          <div className={styles.mascotArea}>
            <RoshiDisplay expression={slide.expression} size={130} />
          </div>

          {isLastPage ? (
            <div className={styles.nameRow}>
              <input
                className={styles.input}
                placeholder="Your name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleContinue()}
                autoFocus
                maxLength={20}
              />
              <Button onClick={handleContinue} disabled={name.trim().length < 2}>
                Let&apos;s go
              </Button>
            </div>
          ) : (
            <Button onClick={handleContinue}>Continue</Button>
          )}
        </div>

      </div>

    </div>
  )
}
