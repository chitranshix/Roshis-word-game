/**
 * Web Audio API sound effects — no files, no downloads, works offline.
 * Lazy-init AudioContext on first use (browser requires gesture first).
 */

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Two-tone chime — clean "ding ding" going up. Plays on correct answer. */
export function playCorrect() {
  const c = ac()
  if (!c) return
  try {
    [660, 880].forEach((freq, i) => {
      const t    = c.currentTime + i * 0.13
      const osc  = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.45, t + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.35)
    })
  } catch { /* silent mode / restricted */ }
}

/** ch-ch-ch — 3 filtered noise bursts. Plays on wrong / 0 points. */
export function playWrong() {
  const c = ac()
  if (!c) return
  try {
    for (let i = 0; i < 3; i++) {
      const t       = c.currentTime + i * 0.13
      const bufSize = Math.floor(c.sampleRate * 0.055)
      const buf     = c.createBuffer(1, bufSize, c.sampleRate)
      const data    = buf.getChannelData(0)
      for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1) * 0.35

      const src    = c.createBufferSource()
      src.buffer   = buf

      const hpf        = c.createBiquadFilter()
      hpf.type         = 'highpass'
      hpf.frequency.value = 3200

      const gain = c.createGain()
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.55, t + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055)

      src.connect(hpf)
      hpf.connect(gain)
      gain.connect(c.destination)
      src.start(t)
    }
  } catch { /* silent mode / restricted */ }
}
