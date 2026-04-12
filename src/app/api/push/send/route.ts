import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServerSupabase } from '@/lib/supabase-server'

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  const { toUserId, title, body, url } = await req.json()
  if (!toUserId) return NextResponse.json({ error: 'Missing toUserId' }, { status: 400 })

  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', toUserId)
    .single()

  if (!data?.subscription) return NextResponse.json({ ok: false, reason: 'no_subscription' })

  try {
    await webpush.sendNotification(
      data.subscription as webpush.PushSubscription,
      JSON.stringify({ title, body, url }),
    )
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode
    // 404/410 = subscription expired, clean it up
    if (status === 404 || status === 410) {
      await supabase.from('push_subscriptions').delete().eq('user_id', toUserId)
    }
    return NextResponse.json({ ok: false, reason: 'send_failed' })
  }
}
