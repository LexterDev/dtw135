const Audio = (() => {
  let ctx = null

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  }

  function beep(freq, type, duration, vol = 0.25) {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  }

  function seq(notes) {
    notes.forEach(({ freq, type, dur, delay, vol }) => {
      setTimeout(() => beep(freq, type, dur, vol || 0.25), delay)
    })
  }

  const sounds = {
    click: () => beep(880, 'sine', 0.08),

    locked: () => beep(200, 'sine', 0.15),

    error: () => {
      beep(300, 'sawtooth', 0.15, 0.3)
      setTimeout(() => beep(150, 'sawtooth', 0.15, 0.3), 160)
    },

    complete: () => seq([
      { freq: 523, type: 'square', dur: 0.1,  delay: 0 },
      { freq: 659, type: 'square', dur: 0.1,  delay: 110 },
      { freq: 784, type: 'square', dur: 0.1,  delay: 220 },
      { freq: 1047, type: 'square', dur: 0.25, delay: 330 },
    ]),

    stageClear: () => seq([
      { freq: 523,  type: 'square', dur: 0.09, delay: 0 },
      { freq: 659,  type: 'square', dur: 0.09, delay: 100 },
      { freq: 784,  type: 'square', dur: 0.09, delay: 200 },
      { freq: 1047, type: 'square', dur: 0.09, delay: 300 },
      { freq: 784,  type: 'square', dur: 0.09, delay: 400 },
      { freq: 1047, type: 'square', dur: 0.09, delay: 500 },
      { freq: 1175, type: 'square', dur: 0.09, delay: 600 },
      { freq: 1319, type: 'square', dur: 0.25, delay: 700 },
    ]),
  }

  return {
    init,
    play(event) {
      try {
        init()
        if (sounds[event]) sounds[event]()
      } catch(e) {
        console.warn('Audio error:', e)
      }
    }
  }
})()
