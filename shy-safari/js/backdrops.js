// Simple scenery drawn over each scene's sky/ground gradient.

const svg = (body) =>
  `<svg viewBox="0 0 1000 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const acacia = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-4 0 L-2 -60 L-24 -78 L-20 -82 L0 -68 L2 -88 L8 -88 L6 -66 L28 -82 L31 -78 L6 -58 L4 0Z" fill="#6b4a2e"/>
    <ellipse cx="0" cy="-88" rx="70" ry="14" fill="#6c8a3c"/>
    <ellipse cx="-20" cy="-96" rx="40" ry="10" fill="#7c9a48"/>
  </g>`;

const pine = (x, y, s, c = "#2f6b3a") => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-5" y="-20" width="10" height="20" fill="#5b3a22"/>
    <path d="M0 -150 L40 -60 L22 -60 L50 -20 L-50 -20 L-22 -60 L-40 -60Z" fill="${c}"/>
  </g>`;

const coral = (x, y, s, c) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
    <path d="M-6 0 C-8 -30 -30 -40 -28 -70 C-20 -72 -18 -50 -8 -46 C-10 -70 -2 -90 6 -92 C10 -80 4 -60 8 -48 C18 -60 22 -80 32 -78 C34 -50 14 -36 10 0Z"/>
  </g>`;

const seaweed = (x, y, h) =>
  `<path d="M${x} ${y} C${x - 12} ${y - h * 0.3} ${x + 12} ${y - h * 0.6} ${x} ${y - h}" stroke="#2d8f5a" stroke-width="7" fill="none" stroke-linecap="round"/>`;

export const BACKDROPS = {
  savanna: svg(`
    <circle cx="790" cy="140" r="60" fill="#f5a83c" opacity="0.9"/>
    <path d="M0 330 C150 300 300 310 420 325 S700 300 1000 320 L1000 360 L0 360Z" fill="#d9b06a" opacity="0.6"/>
    ${acacia(180, 360, 1.4)}${acacia(820, 350, 1.1)}${acacia(560, 345, 0.7)}
    <path d="M0 480 C200 460 420 470 600 490 S900 470 1000 480 L1000 600 L0 600Z" fill="#c98f3e" opacity="0.5"/>
  `),
  reef: svg(`
    <g opacity="0.25" fill="#fff">
      <path d="M100 0 L160 0 L60 400 L30 400Z"/><path d="M420 0 L470 0 L380 380 L350 380Z"/><path d="M760 0 L820 0 L720 420 L690 420Z"/>
    </g>
    <path d="M0 540 C200 515 420 525 600 540 S900 520 1000 530 L1000 600 L0 600Z" fill="#e9d8a6"/>
    ${coral(120, 545, 1.3, "#ff7a8a")}${coral(260, 540, 0.9, "#ffb347")}${coral(860, 540, 1.4, "#c77dff")}${coral(700, 548, 0.8, "#ff7a8a")}
    ${seaweed(60, 550, 120)}${seaweed(340, 545, 90)}${seaweed(920, 545, 140)}${seaweed(560, 550, 70)}
  `),
  forest: svg(`
    ${pine(60, 380, 1.6, "#3d7a48")}${pine(250, 370, 1.2, "#468a52")}${pine(780, 375, 1.5, "#3d7a48")}${pine(940, 380, 1.9, "#2f6b3a")}
    <path d="M0 375 C200 360 400 365 600 372 S900 362 1000 370 L1000 600 L0 600Z" fill="#5b9b5b"/>
    ${pine(-20, 600, 2.6, "#2a5e33")}${pine(1030, 600, 2.8, "#2a5e33")}
    <ellipse cx="500" cy="560" rx="260" ry="14" fill="#4c8a4c" opacity="0.5"/>
  `),
  arctic: svg(`
    <path d="M0 330 L120 220 L210 300 L330 180 L460 320 L1000 320 L1000 340 L0 340Z" fill="#b7d3e8"/>
    <path d="M600 330 L720 230 L800 290 L900 210 L1000 300 L1000 340 L600 340Z" fill="#a6c6de"/>
    <path d="M0 336 L1000 336 L1000 380 L0 380Z" fill="#5d8fb3" opacity="0.6"/>
    <path d="M0 370 C200 360 500 365 700 372 S900 365 1000 370 L1000 600 L0 600Z" fill="#f8fbff"/>
    <path d="M60 460 L320 450 L300 470 L80 478Z" fill="#dcebf5"/><path d="M640 520 L900 512 L880 532 L660 538Z" fill="#dcebf5"/>
  `),
};
