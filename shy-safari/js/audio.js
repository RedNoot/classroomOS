// Microphone level meter with a Music/Movie mode.
//
// Normal mode asks the browser for the raw microphone (no echo cancellation,
// noise suppression or auto gain) so the level is honest.
//
// Music/Movie mode re-opens the microphone with the browser's acoustic echo
// cancellation on. The browser then removes whatever it is playing through
// the speakers from the mic signal, so a movie or song played in Shy Safari
// (or, in Chrome and Edge, any browser tab) isn't counted as class noise.
// Noise suppression is on too, and the level is measured only in the speech
// band, which keeps the bass and rumble that leaks past cancellation out.

const SPEECH_LOW_HZ = 250;
const SPEECH_HIGH_HZ = 4000;

export class MicMeter {
  constructor() {
    this.ctx = null;
    this.stream = null;
    this.source = null;
    this.analyser = null;
    this.filters = [];
    this.buf = null;
    this.movieMode = false;
    this.smoothedDb = -100;
    this.echoCancelling = false;
  }

  async start(movieMode) {
    this.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    await this.#open(movieMode);
  }

  async setMovieMode(on) {
    if (on === this.movieMode && this.stream) return;
    await this.#open(on);
  }

  async #open(movieMode) {
    const processing = movieMode;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: processing,
        noiseSuppression: processing,
        autoGainControl: false,
      },
      video: false,
    });

    this.#close();
    this.stream = stream;
    this.movieMode = movieMode;

    const track = stream.getAudioTracks()[0];
    const settings = track?.getSettings?.() ?? {};
    this.echoCancelling = movieMode && settings.echoCancellation !== false;

    this.source = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.buf = new Float32Array(this.analyser.fftSize);

    // Always drop HVAC rumble and desk thumps; in Music/Movie mode also keep
    // only the speech band.
    const chain = [biquad(this.ctx, "highpass", movieMode ? SPEECH_LOW_HZ : 80)];
    if (movieMode) chain.push(biquad(this.ctx, "lowpass", SPEECH_HIGH_HZ));
    this.filters = chain;

    let node = this.source;
    for (const f of chain) {
      node.connect(f);
      node = f;
    }
    node.connect(this.analyser);
  }

  #close() {
    this.source?.disconnect();
    for (const f of this.filters) f.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source = null;
    this.filters = [];
    this.stream = null;
  }

  // Smoothed level in dBFS: fast attack, slower release.
  readDb(dt) {
    if (!this.analyser) return -100;
    this.analyser.getFloatTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
    const rms = Math.sqrt(sum / this.buf.length);
    const db = 20 * Math.log10(rms + 1e-9);
    const tau = db > this.smoothedDb ? 0.08 : 0.5;
    const a = 1 - Math.exp(-dt / tau);
    this.smoothedDb += (db - this.smoothedDb) * a;
    return this.smoothedDb;
  }

  stop() {
    this.#close();
    this.ctx?.close();
    this.ctx = null;
  }
}

function biquad(ctx, type, frequency) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = 0.707;
  return f;
}
