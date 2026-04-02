import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { word, definition } = await req.json()

  if (!word || !definition) {
    return NextResponse.json({ error: 'Missing word or definition' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: `Word: "${word}". Player's definition: "${definition}". Is this at least partially correct? A single correct synonym (e.g. "clear" for pellucid) counts as yes. Only say "no" if completely wrong or nonsensical. Reply with only "yes" or "no".`,
      },
    ],
  })

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()
    .toLowerCase()

  const correct = text.startsWith('yes')

  return NextResponse.json({ correct })
}
