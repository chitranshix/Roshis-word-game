'use client'

import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import styles from './practice.module.css'

export default function PracticePage() {
  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.heading}>Practice</div>

        {/* Words Journal — available now */}
        <Link href="/profile/words" className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
              <line x1="7" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
              <line x1="7" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.featureBody}>
            <div className={styles.featureTitle}>Words Journal</div>
            <div className={styles.featureDesc}>Every word you&apos;ve played — with results and definitions.</div>
          </div>
          <div className={styles.featureChevron}>›</div>
        </Link>

        <div className={styles.comingSoonLabel}>Coming next</div>

        {/* Swipe Review */}
        <div className={styles.comingSoonCard}>
          <div className={styles.comingSoonIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.9"/>
              <path d="M8 10l-3 2 3 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10l3 2-3 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.featureBody}>
            <div className={styles.comingSoonTitle}>Swipe Review</div>
            <div className={styles.featureDesc}>Swipe through words you&apos;ve played. Lock in what you know.</div>
          </div>
          <div className={styles.comingSoonPill}>Soon</div>
        </div>

        {/* Roshi Stories */}
        <div className={styles.comingSoonCard}>
          <div className={styles.comingSoonIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H8l-4 4V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.featureBody}>
            <div className={styles.comingSoonTitle}>Roshi Stories</div>
            <div className={styles.featureDesc}>Short stories narrated by Roshi. Define each word as you read.</div>
          </div>
          <div className={styles.comingSoonPill}>Soon</div>
        </div>

      </div>
    </AppShell>
  )
}
