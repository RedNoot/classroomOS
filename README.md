# classroomOS

## Shy Safari (`shy-safari/`)

A classroom noise monitor for the projector. Shy animals come out one at a time while the
room stays under the volume goal, and run off (or the scene pauses) when it gets too loud.
It is our own take on the idea behind shysafari.com, written from scratch, with a
**Music/Movie mode** added. It will replace the ClassroomOS noise meter.

### Music/Movie mode

Lets you play music or a movie without it counting as class noise.

- Re-opens the microphone with the browser's **echo cancellation** and noise suppression
  on, so sound the computer plays through its speakers is removed before it's measured.
- Measures only the speech band (250 Hz to 4 kHz), so bass that leaks past the
  cancellation doesn't count.
- Pauses judging for a few seconds while the cancellation adapts (when the mode turns on or
  something starts playing).
- Has a built-in player for local video/audio files and YouTube links. Playing something
  switches the mode on automatically.
- Calibration is saved separately for normal mode and Music/Movie mode.

Limits: Chrome and Edge cancel sound from any of their tabs. Sound from other apps (a
desktop music player, a DVD app) can't be fully removed by a browser, so play it in the
browser instead.

### Run it

No build step. Serve the folder and open it:

```sh
cd shy-safari && python3 -m http.server 8000   # then open http://localhost:8000
```

The microphone needs `https://` or `localhost`.

### Tests

```sh
cd shy-safari && node --test test/*.test.mjs
```

### Layout

| File | What it does |
| --- | --- |
| `js/detector.js` | "Too loud?" logic (6 s just over, 1 s far over, 3 s to clear) and level scaling. Pure, no DOM. |
| `js/audio.js` | Mic meter; Music/Movie mode switches echo cancellation and the speech-band filter on. |
| `js/scenes.js` | Savanna, coral reef, forest and polar ice animals, with rarity. |
| `js/backdrops.js` | Scenery for each scene. |
| `js/app.js` | UI: animals, player, settings, calibration, collection. |
