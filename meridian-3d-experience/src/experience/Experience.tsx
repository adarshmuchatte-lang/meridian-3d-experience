import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Volume2, VolumeX, RotateCcw, X } from "lucide-react";
import { world, DISCOVERIES } from "./state";
import { setWind } from "./sound";

const Scene = lazy(() => import("./Scene"));
gsap.registerPlugin(ScrollTrigger);

const NAV = [
  ["01", "Arrival", "arrival"], ["02", "World", "world"], ["03", "Explore", "explore"],
  ["04", "The Gate", "gate"], ["05", "Discoveries", "discoveries"], ["06", "Finale", "finale"],
] as const;

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

export default function Experience() {
  const [stages, setStages] = useState({ fonts: false, scene: false, frame: false });
  const [shown, setShown] = useState(0);
  const [entered, setEntered] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [sound, setSound] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  const done = Object.values(stages).filter(Boolean).length;
  const target = Math.round((done / 3) * 100);

  useEffect(() => {
    world.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ok = hasWebGL();
    setWebgl(ok);
    document.fonts.ready.then(() => setStages((s) => ({ ...s, fonts: true })));
    import("./Scene").then(() => setStages((s) => ({ ...s, scene: true })));
    if (!ok) setStages({ fonts: true, scene: true, frame: true });
    const mm = (e: PointerEvent) => { world.mouseX = e.clientX / innerWidth - 0.5; world.mouseY = e.clientY / innerHeight - 0.5; };
    addEventListener("pointermove", mm);
    return () => removeEventListener("pointermove", mm);
  }, []);

  // animate the percentage toward real progress
  useEffect(() => {
    if (shown >= target) return;
    const id = setTimeout(() => setShown((v) => Math.min(target, v + Math.max(2, Math.ceil((target - v) / 6)))), 30);
    return () => clearTimeout(id);
  }, [shown, target]);

  const onReady = useCallback(() => setStages((s) => ({ ...s, frame: true })), []);

  // lock scroll until entered
  useEffect(() => { document.documentElement.style.overflow = entered ? "" : "hidden"; }, [entered]);

  useEffect(() => {
    if (!entered || !root.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "#scenes", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (st) => { world.progress = st.progress; setActive(Math.min(5, Math.floor(st.progress * 5.999))); },
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el.children, {
          y: world.reducedMotion ? 0 : 60, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
        });
      });
      gsap.from(".hero-char", { yPercent: 110, duration: 1.6, ease: "expo.out", stagger: 0.06, delay: 0.2 });
    }, root);
    return () => ctx.revert();
  }, [entered]);

  const enter = () => { setEntered(true); };
  const replay = () => {
    window.scrollTo({ top: 0 });
    setEntered(false);
    setSelected(null);
  };
  const toggleSound = () => { const n = !sound; setSound(n); setWind(n); };
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: world.reducedMotion ? "auto" : "smooth" });

  const sel = selected !== null ? DISCOVERIES[selected] : null;

  return (
    <div ref={root} className="relative text-foreground">
      {/* 3D layer */}
      <div className="fixed inset-0 z-0" data-scene-ready={stages.frame ? "" : undefined}>
        {webgl ? (
          <Suspense fallback={null}><Scene onSelect={(i) => setSelected(i)} onReady={onReady} /></Suspense>
        ) : (
          <div className="h-full w-full fallback-sky" />
        )}
        <div className="pointer-events-none absolute inset-0 vignette" />
        <div className="pointer-events-none absolute inset-0 grain" />
      </div>

      {/* Loader / intro */}
      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-all duration-[1600ms] ${entered ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/20 to-background/90" />
        <div className="relative text-center px-6">
          <p className="label mb-6">An expedition in six scenes</p>
          <h1 className="font-display text-[18vw] leading-[0.85] md:text-[11rem] italic">Meridian</h1>
          <p className="mx-auto mt-6 max-w-md text-sm text-foreground/70">Beyond the last road lies a desert where stone floats and the sun never fully sets.</p>
          <div className="mt-12 h-14 flex items-center justify-center">
            {shown < 100 ? (
              <div className="w-56">
                <div className="label flex justify-between"><span>Loading world</span><span>{shown}%</span></div>
                <div className="mt-2 h-px bg-foreground/20"><div className="h-px bg-primary transition-all" style={{ width: `${shown}%` }} /></div>
              </div>
            ) : (
              <button onClick={enter} className="enter-btn">Enter experience</button>
            )}
          </div>
          {!webgl && <p className="label mt-6 text-primary">3D isn't supported on this device — showing the illustrated edition.</p>}
        </div>
      </div>

      {/* Nav */}
      <header className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-10 transition-opacity duration-1000 ${entered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button onClick={() => go("arrival")} className="font-display text-2xl italic">Meridian</button>
        <nav className="hidden md:flex gap-6">
          {NAV.map(([n, l, id], i) => (
            <button key={id} onClick={() => go(id)} className={`label transition-colors ${active === i ? "text-primary" : "text-foreground/60 hover:text-foreground"}`}>{n} {l}</button>
          ))}
        </nav>
        <div className="flex gap-2">
          <button onClick={toggleSound} aria-label={sound ? "Mute wind" : "Play wind"} className="icon-btn">{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
          <button onClick={replay} aria-label="Replay intro" className="icon-btn"><RotateCcw size={16} /></button>
        </div>
      </header>

      {/* Scroll scenes */}
      <main id="scenes" className={`relative z-10 pointer-events-none transition-opacity duration-1000 ${entered ? "opacity-100" : "opacity-0"}`}>
        <section id="arrival" className="flex min-h-[110vh] flex-col justify-end px-6 pb-24 md:px-16">
          <p className="label mb-4">Scene 01 — The Arrival</p>
          <h2 className="font-display text-[15vw] leading-[0.85] md:text-[10rem]">
            {"The last".split("").map((c, i) => <span key={i} className="inline-block overflow-hidden align-bottom"><span className="hero-char inline-block">{c === " " ? "\u00A0" : c}</span></span>)}
            <br /><em className="text-primary">{"frontier".split("").map((c, i) => <span key={i} className="inline-block overflow-hidden align-bottom"><span className="hero-char inline-block">{c}</span></span>)}</em>
          </h2>
          <p className="mt-6 label text-foreground/60">Scroll to travel ↓</p>
        </section>

        <section id="world" className="flex min-h-[130vh] items-center px-6 md:px-16">
          <div data-reveal className="max-w-2xl ml-auto">
            <p className="label mb-6">Scene 02 — The World</p>
            <h3 className="font-display text-5xl md:text-8xl leading-[0.9]">A sea of sand<br />under a <em className="text-primary">stalled</em> sun.</h3>
            <p className="mt-8 max-w-md text-foreground/75">Meridian turns so slowly that dusk lasts for a lifetime. Across its dunes, monoliths of basalt drift a few metres above the ground, held by a force no instrument has named.</p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-foreground/15 pt-6 max-w-md">
              {[["412", "Days of dusk"], ["7.2k", "Floating stones"], ["1", "Gate"]].map(([n, l]) => (
                <div key={l}><div className="font-display text-4xl">{n}</div><div className="label mt-1 text-foreground/60">{l}</div></div>
              ))}
            </div>
          </div>
        </section>

        <section id="explore" className="flex min-h-[140vh] items-end px-6 pb-32 md:px-16">
          <div data-reveal className="max-w-xl">
            <p className="label mb-6">Scene 03 — The Exploration</p>
            <h3 className="font-display text-5xl md:text-7xl leading-[0.9]">Touch the stones<br />that <em className="text-primary">glow</em>.</h3>
            <p className="mt-6 text-foreground/75">Four monoliths ahead still remember. Hover or tap one in the scene, or pick it here.</p>
            <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
              {DISCOVERIES.map((d) => (
                <button key={d.id} onClick={() => setSelected(d.id)} onMouseEnter={() => (world.hovered = d.id)} onMouseLeave={() => (world.hovered = -1)} className="chip">{d.name}</button>
              ))}
            </div>
          </div>
        </section>

        <section id="gate" className="flex min-h-[200vh] flex-col justify-center px-6 md:px-16">
          <div data-reveal className="mx-auto text-center max-w-4xl">
            <p className="label mb-6">Scene 04 — The Deep Dive</p>
            <h3 className="font-display text-6xl md:text-[9rem] leading-[0.85]">Through<br /><em className="text-primary">the Gate</em></h3>
            <p className="mx-auto mt-8 max-w-md text-foreground/75">Pass the ring and the dusk breaks. On the far side it is night — the first night Meridian has seen in four hundred days.</p>
          </div>
        </section>

        <section id="discoveries" className="min-h-[150vh] px-6 py-32 md:px-16">
          <div data-reveal className="max-w-6xl mx-auto">
            <p className="label mb-6">Scene 05 — The Discoveries</p>
            <h3 className="font-display text-5xl md:text-8xl leading-[0.9] mb-20">What the<br />desert <em className="text-primary">kept</em>.</h3>
          </div>
          <div className="max-w-6xl mx-auto space-y-24">
            {DISCOVERIES.map((d, i) => (
              <article key={d.id} data-reveal className={`grid md:grid-cols-12 gap-6 items-baseline ${i % 2 ? "md:text-right" : ""}`}>
                <div className={`font-display text-8xl md:text-[10rem] text-primary/30 leading-none md:col-span-3 ${i % 2 ? "md:order-2 md:col-start-10" : ""}`}>0{i + 1}</div>
                <div className={`md:col-span-7 ${i % 2 ? "md:col-start-3 md:order-1" : ""}`}>
                  <p className="label text-foreground/60">{d.era}</p>
                  <h4 className="font-display text-4xl md:text-6xl mt-2">{d.name}</h4>
                  <p className="mt-4 text-foreground/75 max-w-lg inline-block">{d.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="finale" className="flex min-h-[130vh] flex-col items-center justify-center px-6 text-center">
          <div data-reveal>
            <p className="label mb-6">Scene 06 — The Finale</p>
            <h3 className="font-display text-6xl md:text-[10rem] leading-[0.85]">Every horizon<br /><em className="text-primary">is a door.</em></h3>
            <div className="pointer-events-auto mt-12 flex flex-wrap justify-center gap-4">
              <button onClick={replay} className="enter-btn">Begin again</button>
              <button onClick={() => go("explore")} className="chip">Revisit the stones</button>
            </div>
          </div>
        </section>
      </main>

      {/* Discovery panel */}
      <aside className={`fixed bottom-6 right-6 left-6 md:left-auto z-30 md:w-96 transition-all duration-700 ${sel ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}>
        {sel && (
          <div className="panel p-6">
            <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-4 top-4 text-foreground/60 hover:text-foreground"><X size={16} /></button>
            <p className="label text-primary">{sel.era} · Discovery 0{sel.id + 1}</p>
            <h4 className="font-display text-3xl mt-2">{sel.name}</h4>
            <p className="mt-3 text-sm text-foreground/75">{sel.text}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
