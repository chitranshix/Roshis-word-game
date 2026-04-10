'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// After magic link click — ensure user profile exists, then go home
export default function AuthCompletePage() {
  const router = useRouter()

  useEffect(() => {
    async function finish() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      // Check if profile already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existing) {
        // Create profile — name was stored in localStorage during onboarding
        const name = localStorage.getItem('roshi_name') ?? user.email?.split('@')[0] ?? 'Player'
        await supabase.from('users').insert({
          id: user.id,
          name,
          email: user.email!,
        })
      } else {
        // Sync name to localStorage for AppShell
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single()
        if (profile) localStorage.setItem('roshi_name', profile.name)
      }

      router.replace('/')
    }
    finish()
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'var(--font-ui)', color: 'var(--muted)' }}>
      Signing you in…
    </div>
  )
}
