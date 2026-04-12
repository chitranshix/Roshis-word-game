import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DareFlow from './DareFlow'
import type { Dare } from '@/lib/mock'
import type { GREWord } from '@/lib/gre-words'

interface Props { params: Promise<{ id: string }> }

function loadWords(): GREWord[] {
  try {
    const p = path.join(process.cwd(), 'public/data/gre-level-1.json')
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as GREWord[]
  } catch { return [] }
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function DarePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: dbDare } = await supabase
    .from('dares')
    .select('*, from_profile:from_user(name), to_profile:to_user(name)')
    .eq('id', id)
    .single()

  if (!dbDare) notFound()

  const dare: Dare = {
    id: dbDare.id,
    word: dbDare.word,
    from: dbDare.from_profile?.name ?? 'Someone',
    to:   dbDare.to_profile?.name  ?? 'You',
    status: dbDare.status === 'complete'
      ? 'complete'
      : dbDare.to_user === user?.id
        ? 'pending_you'
        : 'pending_them',
    sentAt:      relativeTime(dbDare.created_at),
    yourPoints:  dbDare.to_user === user?.id ? (dbDare.to_points ?? undefined) : (dbDare.from_points ?? undefined),
    theirPoints: dbDare.to_user === user?.id ? (dbDare.from_points ?? undefined) : (dbDare.to_points ?? undefined),
  }

  const words     = loadWords()
  const wordData  = words.find(w => w.word === dbDare.word)
  const sentences = wordData?.sentences ?? []
  const definition = wordData?.definition ?? null

  return (
    <DareFlow
      dare={dare}
      sentences={sentences}
      definition={definition}
      dareId={dbDare.id}
      isChallengee={dbDare.to_user === user?.id}
      hasTrap={dbDare.has_trap ?? false}
      challengerName={dbDare.from_profile?.name ?? 'them'}
    />
  )
}
