'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import styles from './ThemeToggle.module.css'

function MountainIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 14 L12.5 4 L18 14Z" fill="currentColor" opacity="0.9" />
      <path d="M2 14 L6.5 7 L11 14Z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function OceanIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 5 Q4.5 2 8 5 Q11.5 8 15 5 Q18.5 2 19 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M1 9 Q4.5 6 8 9 Q11.5 12 15 9 Q18.5 6 19 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M1 13 Q4.5 10 8 13 Q11.5 16 15 13 Q18.5 10 19 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className={styles.placeholder} />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to land (light)' : 'Switch to water (dark)'}
      title={isDark ? 'Play on land' : 'Play in water'}
    >
      <span className={[styles.option, !isDark ? styles.active : ''].join(' ')}>
        <MountainIcon />
      </span>
      <span className={[styles.option, isDark ? styles.active : ''].join(' ')}>
        <OceanIcon />
      </span>
    </button>
  )
}
