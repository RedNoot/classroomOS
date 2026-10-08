// Decides when the room is "too loud". Pure logic, no DOM or audio, so it can
// be unit-tested and reused by ClassroomOS.
//
// Short noises (a dropped book, a knock) don't count: the room has to stay
// over the goal for a while first. Just over the goal takes ~6 s, far over
// takes ~1 s. Once it's loud, it takes 3 s of calm to clear.

const SLOW_TRIGGER_S = 6;
const FAST_TRIGGER_S = 1;
const FAR_OVER = 25; // level points over the goal that count as "much louder"
const DECAY_S = 3; // a full charge drains in this long when under the goal
const CLEAR_S = 3;

export function createDetector() {
  let charge = 0; // 0..1, reaches 1 => loud
  let loud = false;
  let calmFor = 0;
  let graceLeft = 0;

  return {
    // Ignore input for a while, e.g. while echo cancellation settles after
    // Music/Movie mode turns on or a video starts.
    suspend(seconds) {
      graceLeft = Math.max(graceLeft, seconds);
    },

    get settling() {
      return graceLeft > 0;
    },

    get loud() {
      return loud;
    },

    reset() {
      charge = 0;
      loud = false;
      calmFor = 0;
    },

    // level and goal are on the same 0..100 scale; dt in seconds.
    update(level, goal, dt) {
      if (graceLeft > 0) {
        graceLeft = Math.max(0, graceLeft - dt);
        level = 0;
      }
      const over = level - goal;

      if (over > 0) {
        const t = Math.min(1, over / FAR_OVER);
        const triggerS = SLOW_TRIGGER_S + (FAST_TRIGGER_S - SLOW_TRIGGER_S) * t;
        charge = Math.min(1, charge + dt / triggerS);
        calmFor = 0;
      } else {
        charge = Math.max(0, charge - dt / DECAY_S);
        if (loud) calmFor += dt;
      }

      if (!loud && charge >= 1) {
        loud = true;
        calmFor = 0;
      } else if (loud && calmFor >= CLEAR_S) {
        loud = false;
        charge = 0;
        calmFor = 0;
      }
      return loud;
    },
  };
}

// Turns a smoothed dBFS reading into the 0..100 scale the goal uses.
// `cal` is { floorDb, spanDb } from calibration.
export function dbToLevel(db, cal) {
  const v = ((db - cal.floorDb) / cal.spanDb) * 100;
  return Math.max(0, Math.min(100, v));
}

// Builds calibration from a quiet sample and an optional talking sample, so
// silence sits near 5 and normal partner talk sits near 60.
export function calibrationFrom(silentDb, talkDb) {
  const floorDb = silentDb - 3;
  let spanDb = 50;
  if (talkDb != null && talkDb > silentDb + 6) {
    spanDb = (talkDb - floorDb) / 0.6;
  }
  return { floorDb, spanDb };
}

export const DEFAULT_CALIBRATION = { floorDb: -65, spanDb: 50 };
