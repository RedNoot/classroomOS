# classroomOS

A calm control panel for the classroom projector: timers, name picker, groups,
seating, points, schedule, noise meter and more, in one page. Everything stays
on the teacher's own computer (localStorage); a demo classroom shows it filled
in without touching real data.

## Crash reports and feedback

Crashes are reported automatically, and Settings → 💬 Send feedback sends
bugs and ideas, both through AppReporter (`app-reporter.js`, a copy of the
browser kit from `D:\AppReporter`), which files them in Discord. Every report
is passed through `scrub()` first, so student names never leave the machine;
only the class size is sent. The sample classroom sends no crash reports.

## Run it

`index.html` is the whole app, with no build step. Open it directly, or serve the
folder (`python -m http.server`) for the microphone and offline install, which
need `https://` or `localhost`.

Not in the repo yet: `manifest.json`, `icon.svg`, `icon-192.png` and
`service-worker.js`, which `index.html` links to for installing it as an app.
Without them it still runs; it just can't be installed or work offline.

A copy also runs on the portfolio site (RedNoot/portfolio, `apps/classroom-os/`).
