/**
 * SoundManager — programmatic sound effects via Web Audio API.
 * No audio files required; all sounds are synthesised.
 */
const SoundManager = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Resume on first user gesture
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone({ type = 'sine', freq = 440, gain = 0.3, duration = 0.08, rampDown = true, delay = 0 } = {}) {
    if (muted) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const vol = c.createGain();
      osc.connect(vol);
      vol.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      vol.gain.setValueAtTime(gain, c.currentTime + delay);
      if (rampDown) vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + duration + 0.01);
    } catch (e) { /* silently ignore audio errors */ }
  }

  return {
    tap() {
      playTone({ type: 'square', freq: 320, gain: 0.15, duration: 0.05 });
    },

    fix() {
      // Ascending double-tone "ding"
      playTone({ freq: 523, gain: 0.25, duration: 0.12 });
      playTone({ freq: 784, gain: 0.3,  duration: 0.18, delay: 0.1 });
    },

    levelComplete() {
      // Short fanfare: C E G C
      [262, 330, 392, 523].forEach((f, i) => {
        playTone({ freq: f, gain: 0.3, duration: 0.18, delay: i * 0.14 });
      });
    },

    fail() {
      // Descending sad tone
      playTone({ type: 'sawtooth', freq: 300, gain: 0.2, duration: 0.25 });
      playTone({ type: 'sawtooth', freq: 200, gain: 0.2, duration: 0.35, delay: 0.2 });
    },

    tick() {
      playTone({ type: 'square', freq: 880, gain: 0.1, duration: 0.04 });
    },

    urgentTick() {
      playTone({ type: 'square', freq: 1100, gain: 0.15, duration: 0.06 });
    },

    unlock() {
      [392, 494, 587, 784].forEach((f, i) => {
        playTone({ freq: f, gain: 0.25, duration: 0.14, delay: i * 0.1 });
      });
    },

    toggleMute() {
      muted = !muted;
      return muted;
    },

    isMuted() {
      return muted;
    }
  };
})();
