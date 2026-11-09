// Procedural desert wind (no audio files). Starts only on user toggle.
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;

export function setWind(on: boolean) {
  if (!ctx) {
    ctx = new AudioContext();
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass"; filter.frequency.value = 400; filter.Q.value = 0.8;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(filter.frequency);
    gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(); lfo.start();
  }
  if (ctx.state === "suspended") void ctx.resume();
  gain!.gain.setTargetAtTime(on ? 0.35 : 0, ctx.currentTime, 0.6);
}
