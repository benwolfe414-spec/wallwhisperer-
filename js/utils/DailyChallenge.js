/**
 * DailyChallenge utility
 * Generates a deterministic, date-seeded challenge from available levels.
 * Stores completion state and streak in localStorage.
 */
const DailyChallenge = (() => {
  const STORAGE_KEY = 'fixitfast_daily';

  function todayKey() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  // Simple seeded PRNG (mulberry32)
  function makeRng(seed) {
    let s = seed;
    return function () {
      s |= 0; s = s + 0x6d2b79f5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function dateToSeed(dateStr) {
    // Turn "2026-03-14" into a numeric seed
    return parseInt(dateStr.replace(/-/g, ''), 10);
  }

  function buildDailyLevel(dateStr) {
    const rng = makeRng(dateToSeed(dateStr));

    // Pick a base level to draw from
    const baseLevel = LEVELS[Math.floor(rng() * LEVELS.length)];

    // Shuffle problems and pick 3–5
    const shuffled = [...baseLevel.problems].sort(() => rng() - 0.5);
    const count = 3 + Math.floor(rng() * 3); // 3, 4, or 5
    const selectedProblems = shuffled.slice(0, count);

    // Randomise tap counts slightly for variety
    const problems = selectedProblems.map(p => ({
      ...p,
      taps: Math.max(2, p.taps + Math.floor(rng() * 3) - 1)
    }));

    return {
      ...baseLevel,
      name: `Daily: ${baseLevel.name}`,
      timeLimit: 30 + Math.floor(rng() * 20), // 30–50s
      problems,
      isDaily: true,
      dateStr
    };
  }

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  return {
    getTodayLevel() {
      return buildDailyLevel(todayKey());
    },

    isCompletedToday() {
      const state = getState();
      return state.lastCompleted === todayKey();
    },

    getStreak() {
      return getState().streak || 0;
    },

    completeToday(score) {
      const state = getState();
      const today = todayKey();
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      const streak = state.lastCompleted === yesterday
        ? (state.streak || 0) + 1
        : 1;

      saveState({
        lastCompleted: today,
        streak,
        lastScore: score,
        bestScore: Math.max(score, state.bestScore || 0)
      });

      return streak;
    },

    getBestScore() {
      return getState().bestScore || 0;
    }
  };
})();
