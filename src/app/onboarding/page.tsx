'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  const slide      = SLIDES[page]
  const isLastPage = page === SLIDES.length - 1

  const handleContinue = async () => {
    if (!isLastPage) { setPage(p => p + 1); return }
    if (name.trim().length < 2 || !email.includes('@') || password.length < 6) return
    setSending(true)
    setError(null)
    localStorage.setItem('roshi_name', name.trim())
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    if (signUpError) {
      setError(signUpError.message)
      setSending(false)
      return
    }
    if (!data.session) {
      // Email confirmation is still required — shouldn't happen with setting off
      setError('Check your Supabase settings: disable "Confirm email" under Authentication → Providers → Email.')
      setSending(false)
      return
    }
    if (data.user) {
      await supabase.from('users').upsert({ id: data.user.id, name: name.trim(), email: email.trim() })
    }
    setSending(false)
    setSent(true)
    router.replace('/')

    // Magic link OTP (commented out — requires verified domain on Resend)
    // await supabase.auth.signInWithOtp({
    //   email: email.trim(),
    //   options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    // })
  }

  return (
    <div className={styles.screen}>

      {/* ── Header: full-width, logo left, toggle right ── */}
      <div className={styles.header}>
        <img src="/logo-light.png" alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoLight}`} />
        <img src="/logo-dark.png"  alt="Roshi's Word Game" className={`${styles.logo} ${styles.logoDark}`} />
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
              <p className={styles.sentMsg}>You&apos;re in. Loading…</p>
            ) : (
              <div className={styles.nameCol}>
                <input
                  className={[styles.input, name.length > 0 && name.trim().length < 2 ? styles.inputError : ''].join(' ')}
                  placeholder="Your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
                <input
                  className={[styles.input, email.length > 0 && !email.includes('@') ? styles.inputError : ''].join(' ')}
                  placeholder="Your email..."
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input
                  className={[styles.input, password.length > 0 && password.length < 6 ? styles.inputError : ''].join(' ')}
                  placeholder="Password (min 6 chars)..."
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                />
                {error && <p className={styles.errorMsg}>{error}</p>}
                <Button
                  onClick={handleContinue}
                  disabled={name.trim().length < 2 || !email.includes('@') || password.length < 6 || sending}
                >
                  {sending ? '…' : "Let's go!"}
                </Button>
                <p className={styles.loginHint}>Already have an account? <a href="/login" className={styles.loginLink}>Log in</a></p>
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
