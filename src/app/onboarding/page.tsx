'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import RoshiDisplay from '@/components/mascot/RoshiDisplay'
import SpeechBubble from '@/components/ui/SpeechBubble'
import { createClient } from '@/lib/supabase'
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
      "Here's the game —",
      "You dare your friends with a word you know. They dare you back.",
      "No friends? You can play with me.",
    ],
  },
  {
    expression: 'happy',
    lines: [
      "Each dare comes with a word and 4 sentences. 1 of the sentences is correct. (The others exist purely to embarrass you...)",
      "Get the sentence right and you get to define the word. Get that right too and you get points. Fail either one and well... you try again.",
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
  const [page, setPage] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const { resolvedTheme } = useTheme()
  const slide      = SLIDES[page]
  const isLastPage = page === SLIDES.length - 1

  const handleContinue = async () => {
    if (!isLastPage) { setPage(p => p + 1); return }
    if (name.trim().length < 2 || !email.includes('@')) return
    setSending(true)
    // Save name to localStorage so auth/complete can pick it up
    localStorage.setItem('roshi_name', name.trim())
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setSending(false)
    if (!error) setSent(true)
  }

  return (
    <div className={styles.screen}>

      {/* ── Header: full-width, logo left, toggle right ── */}
      <div className={styles.header}>
        <img
          src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
          alt="Roshi's Word Game"
          className={styles.logo}
        />
        <ThemeToggle />
      </div>

      <div className={styles.body}>

        {/* ── Dots — clickable for direct navigation ── */}
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={[styles.dot, i === page ? styles.dotActive : ''].join(' ')}
              onClick={() => setPage(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
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
            sent ? (
              <p className={styles.sentMsg}>Check your email for a magic link ✉️</p>
            ) : (
              <div className={styles.nameCol}>
                <div className={styles.nameRow}>
                  <input
                    className={styles.input}
                    placeholder="Your name..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={20}
                    autoFocus
                  />
                </div>
                <div className={styles.nameRow}>
                  <input
                    className={styles.input}
                    placeholder="Your email..."
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleContinue()}
                  />
                  <Button
                    onClick={handleContinue}
                    disabled={name.trim().length < 2 || !email.includes('@') || sending}
                  >
                    {sending ? '…' : "Let's go!"}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <Button onClick={handleContinue}>Continue</Button>
          )}
        </div>

      </div>

    </div>
  )
}
