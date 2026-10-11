import { test } from "node:test";
import assert from "node:assert/strict";
import { createDetector, dbToLevel, calibrationFrom, DEFAULT_CALIBRATION } from "../js/detector.js";
import { youTubeId } from "../js/youtube.js";
import { SCENES, pickAnimal } from "../js/scenes.js";

// Feed a constant level for `seconds` in 0.1 s steps; return seconds until loud (or null).
function timeToLoud(det, level, goal, seconds) {
  for (let t = 0; t < seconds; t += 0.1) if (det.update(level, goal, 0.1)) return t + 0.1;
  return null;
}

test("a short noise doesn't trigger", () => {
  const d = createDetector();
  assert.equal(timeToLoud(d, 90, 40, 0.5), null);
  assert.equal(timeToLoud(d, 10, 40, 5), null);
  assert.equal(d.loud, false);
});

test("just over the goal takes ~6 s, far over takes ~1 s", () => {
  const slow = timeToLoud(createDetector(), 41, 40, 10);
  const fast = timeToLoud(createDetector(), 80, 40, 10);
  assert.ok(slow > 5 && slow < 6.5, `slow=${slow}`);
  assert.ok(fast > 0.8 && fast < 1.3, `fast=${fast}`);
});

test("clears after 3 s of calm", () => {
  const d = createDetector();
  timeToLoud(d, 90, 40, 3);
  assert.equal(d.loud, true);
  for (let t = 0; t < 2.5; t += 0.1) d.update(10, 40, 0.1);
  assert.equal(d.loud, true);
  for (let t = 0; t < 0.7; t += 0.1) d.update(10, 40, 0.1);
  assert.equal(d.loud, false);
});

test("suspend ignores input while settling (Music/Movie mode)", () => {
  const d = createDetector();
  d.suspend(4);
  assert.equal(d.settling, true);
  assert.equal(timeToLoud(d, 95, 40, 3.9), null);
  assert.ok(timeToLoud(d, 95, 40, 3) !== null);
});

test("calibration maps silence low and talking near 60", () => {
  const cal = calibrationFrom(-60, -30);
  assert.ok(Math.abs(dbToLevel(-60, cal) - 6) < 1);
  assert.ok(Math.abs(dbToLevel(-30, cal) - 60) < 0.5);
  assert.equal(dbToLevel(-200, DEFAULT_CALIBRATION), 0);
  assert.equal(dbToLevel(0, DEFAULT_CALIBRATION), 100);
});

test("calibration with no readings returns null instead of NaN", () => {
  assert.equal(calibrationFrom(undefined, undefined), null);
  assert.equal(calibrationFrom(NaN, -30), null);
  // A missing talk sample falls back to the default span.
  assert.deepEqual(calibrationFrom(-60, undefined), { floorDb: -63, spanDb: 50 });
});

test("youTubeId handles common links", () => {
  assert.equal(youTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10"), "dQw4w9WgXcQ");
  assert.equal(youTubeId("https://youtu.be/dQw4w9WgXcQ?si=x"), "dQw4w9WgXcQ");
  assert.equal(youTubeId("https://m.youtube.com/shorts/abc_123"), "abc_123");
  assert.equal(youTubeId("https://evil-youtube.com/watch?v=x"), null);
  assert.equal(youTubeId("not a link"), null);
});

test("every scene has unique animal ids and rare ones are rarer", () => {
  for (const [id, s] of Object.entries(SCENES)) {
    const ids = s.animals.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, id);
  }
  let rare = 0;
  for (let i = 0; i < 20000; i++) if (pickAnimal("savanna").rarity === "rare") rare++;
  assert.ok(rare / 20000 < 0.06, `rare share ${rare / 20000}`);
});
