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

/** "Yayyyy" — rising vocal-like sweep. Plays on correct answer. */
export function playCorrect() {
  const c = ac()
  if (!c) return
  try {
    const osc    = c.createOscillator()
    const filter = c.createBiquadFilter()
    const gain   = c.createGain()

    // Sawtooth = harmonically rich, voice-like
    osc.type = 'sawtooth'

    // Pitch sweeps up like "yaaaay"
    osc.frequency.setValueAtTime(200, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(460, c.currentTime + 0.22)
    // tiny vibrato tail
    osc.frequency.setValueAtTime(445, c.currentTime + 0.26)
    osc.frequency.setValueAtTime(465, c.currentTime + 0.30)
    osc.frequency.setValueAtTime(445, c.currentTime + 0.34)

    // Filter opens up — mimics mouth opening on "ayyy"
    filter.type = 'lowpass'
    filter.Q.value = 3
    filter.frequency.setValueAtTime(600, c.currentTime)
    filter.frequency.exponentialRampToValueAtTime(2800, c.currentTime + 0.22)

    // Volume envelope
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(0.38, c.currentTime + 0.02)
    gain.gain.setValueAtTime(0.38, c.currentTime + 0.20)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.42)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)

    osc.start()
    osc.stop(c.currentTime + 0.42)
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
