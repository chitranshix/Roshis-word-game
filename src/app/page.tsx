import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import LevelHero from '@/components/home/LevelHero'
import { MOCK_DARES, MOCK_PLAYER } from '@/lib/mock'
import styles from './page.module.css'

export default function Home() {
  const pendingDares = MOCK_DARES.filter(d => d.status === 'pending_you')
  const otherDares   = MOCK_DARES.filter(d => d.status !== 'pending_you')

  return (
    <AppShell>
      <div className={styles.page}>

        <LevelHero />

        {/* ── Your turn — compact avatar chips ── */}
        {pendingDares.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Your turn</span>
              <span className={styles.sectionBadge}>{pendingDares.length}</span>
            </div>
            <div className={styles.chipRow}>
              {pendingDares.map(dare => (
                <Link key={dare.id} href={`/dare/${dare.id}`} className={styles.chip}>
                  <img
                    className={styles.avatar}
                    src={`https://api.dicebear.com/9.x/thumbs/svg?backgroundColor=transparent&seed=${encodeURIComponent(dare.from)}`}
                    alt={dare.from}
                  />
                  <span className={styles.chipName}>{dare.from}</span>
                  <span className={styles.chipDot} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Dares ── */}
        {otherDares.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Dares</span>
            </div>
            <div className={styles.dareList}>
              {otherDares.slice(0, 3).map(dare => {
                const isWaiting  = dare.status === 'pending_them'
                const isComplete = dare.status === 'complete'
                const fromLine   = isWaiting ? `You → ${dare.to}` : `${dare.from} → you`
                const pts        = dare.yourPoints ?? dare.theirPoints
                const who        = dare.yourPoints ? 'You' : dare.to
                const seed       = isWaiting ? dare.to : dare.from

                return (
                  <div key={dare.id} className={[styles.dareRow, isComplete ? styles.dimmed : ''].join(' ')}>
                    <img
                      className={styles.avatarSm}
                      src={`https://api.dicebear.com/9.x/thumbs/svg?backgroundColor=transparent&seed=${encodeURIComponent(seed)}`}
                      alt={seed}
                    />
                    <div className={styles.dareInfo}>
                      <span className={styles.dareWord}>{dare.word}</span>
                      <span className={styles.dareMeta}>{fromLine} · {dare.sentAt}</span>
                    </div>
                    {isWaiting  && <span className={`${styles.tag} ${styles.tagMuted}`}>Waiting</span>}
                    {isComplete && <span className={`${styles.tag} ${styles.tagDone}`}>{who} +{pts}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      <Link href="/dare/new" className={styles.fab}>+ Dare someone</Link>

    </AppShell>
  )
}
