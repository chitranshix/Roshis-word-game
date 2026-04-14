interface IconProps {
  size?: number
  className?: string
}

/* ── Dare — bullseye target ── */
export function IconDare({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className}>
      <circle cx="10" cy="10" r="8" />
      <circle cx="10" cy="10" r="5" />
      <circle cx="10" cy="10" r="2" />
      <circle cx="10" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ── Trap — spider web (6 spokes + 3 hexagonal rings) ── */
export function IconTrap({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* 6 spokes */}
      <line x1="10" y1="10" x2="10"  y2="2.5"  />
      <line x1="10" y1="10" x2="16.5" y2="6.25" />
      <line x1="10" y1="10" x2="16.5" y2="13.75" />
      <line x1="10" y1="10" x2="10"  y2="17.5" />
      <line x1="10" y1="10" x2="3.5"  y2="13.75" />
      <line x1="10" y1="10" x2="3.5"  y2="6.25" />
      {/* Ring 1 */}
      <polygon points="10,7.5 12.17,8.75 12.17,11.25 10,12.5 7.83,11.25 7.83,8.75" />
      {/* Ring 2 */}
      <polygon points="10,5 14.33,7.5 14.33,12.5 10,15 5.67,12.5 5.67,7.5" />
      {/* Ring 3 */}
      <polygon points="10,2.5 16.5,6.25 16.5,13.75 10,17.5 3.5,13.75 3.5,6.25" />
    </svg>
  )
}

/* ── Leaderboard — three ascending bars ── */
export function IconLeaderboard({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2"  y="11" width="4" height="7" rx="1" />
      <rect x="8"  y="7"  width="4" height="11" rx="1" />
      <rect x="14" y="3"  width="4" height="15" rx="1" />
    </svg>
  )
}

/* ── Star — smiley face inside a star, for starred words ── */
export function IconStar({ size = 18, filled = false, className }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* star outline */}
      <polygon points="10 1.5 12.2 7 18.2 7.6 13.8 11.6 15.2 17.5 10 14.3 4.8 17.5 6.2 11.6 1.8 7.6 7.8 7 10 1.5" fill={filled ? 'currentColor' : 'none'} />
      {/* tiny smiley inside */}
      <circle cx="8.2" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="11.8" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <path d="M8 12 Q10 13.5 12 12" strokeWidth="1.2" />
    </svg>
  )
}

/* ── Daily — sun with rays (daily challenge) ── */
export function IconDaily({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
    </svg>
  )
}

/* ── Profile / person ── */
export function IconProfile({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  )
}
