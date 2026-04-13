import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { word, definition } = await req.json()
  if (!word) return NextResponse.json({ error: 'Missing word' }, { status: 400 })

  const supabase = await createServerSupabase()

  // Check cache first
  const { data: cached } = await supabase
    .from('word_commentary')
    .select('commentary')
    .eq('word', word)
    .single()

  if (cached?.commentary) {
    return NextResponse.json({ commentary: cached.commentary })
  }

  // Generate with Haiku
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 120,
    messages: [{
      role: 'user',
      content: `You are Roshi — a slightly indifferent, dry, know-it-all turtle who teaches vocabulary. Write 1-2 sentences about the word "${word}"${definition ? ` (meaning: ${definition})` : ''}. Cover etymology, cultural context, or a famous usage. Be dry and slightly snarky, never enthusiastic or congratulatory. Example tone: "Ephemeral comes from Greek ἐφήμερος — lasting only a day. Fitting that most people discover it and forget it just as quickly." Keep it under 60 words. No emojis.`,
    }],
  })

  const commentary = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()

  // Cache it
  await supabase.from('word_commentary').insert({ word, commentary }).select()

  return NextResponse.json({ commentary })
}
