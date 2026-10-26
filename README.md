# classroomOS

A calm control panel for the classroom projector: timers, name picker, groups,
seating, points, schedule, noise meter and more, in one page. Everything stays
on the teacher's own computer (localStorage); a demo classroom shows it filled
in without touching real data.

## Run it

`index.html` is the whole app, with no build step. Open it directly, or serve the
folder (`python -m http.server`) for the microphone and offline install, which
need `https://` or `localhost`.

Not in the repo yet: `manifest.json`, `icon.svg`, `icon-192.png` and
`service-worker.js`, which `index.html` links to for installing it as an app.
Without them it still runs; it just can't be installed or work offline.

## Handwriting sheets

`handwriting.html` makes printable Victorian Modern Cursive sheets: a row of
letters to trace, with arrows and a green start dot showing the direction of
each stroke, then an empty dotted-thirds row beneath to practise. Pick letter
families, one page per letter, capitals, numbers or your own words, choose a
size, and print (A4).

Ready-to-print PDFs of the main sets are in `handwriting-sheets/`.

A copy also runs on the portfolio site (RedNoot/portfolio, `apps/classroom-os/`).
