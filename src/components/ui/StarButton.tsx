'use client'

import { useState, useEffect } from 'react'
import { isStarred, toggleStar } from '@/lib/starred'
import styles from './StarButton.module.css'

interface Props {
  word:       string
  definition: string
}

export default function StarButton({ word, definition }: Props) {
  const [starred, setStarred] = useState(false)

  useEffect(() => {
    setStarred(isStarred(word))
  }, [word])

  const handle = async () => {
    const now = await toggleStar(word, definition)
    setStarred(now)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  return (
    <button
      className={[styles.btn, starred ? styles.active : ''].join(' ')}
      onClick={handle}
      aria-label={starred ? 'Unstar word' : 'Star word'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </button>
  )
}
