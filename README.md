[Uploading README (12).md…]()
<p align="center">
  <img src="assets/readme/hero-meridian.svg" alt="MERIDIAN — The Last Frontier. A glowing circular Gate stands on a dusk horizon between floating basalt monoliths above layered desert dunes." width="100%">
</p>

<p align="center">
  An immersive, scroll-driven 3D journey across a desert of floating monoliths,<br>
  through a mysterious Gate, and into the first night.
</p>

<p align="center">
  <a href="#02--enter-the-frontier">Explore the Project</a> &nbsp;·&nbsp;
  <a href="./meridian-3d-experience">Source Code</a> &nbsp;·&nbsp;
  <a href="#06--run-the-experience">Run Locally</a> &nbsp;·&nbsp;
  <a href="#04--under-the-surface">Architecture</a> &nbsp;·&nbsp;
  <a href="https://github.com/adarshmuchatte-lang/meridian-3d-experience/issues">Report an Issue</a>
</p>

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 01 — The Transmission

Meridian turns so slowly that dusk lasts for a lifetime.

This project is a cinematic web experience built in **React, TypeScript, Three.js and React Three Fiber**. You arrive at the edge of a desert where basalt monoliths drift above the dunes, scroll toward a ring-shaped Gate, pass through it, and watch the sky fall from amber dusk into night. Four of the monoliths still remember: touch them and they tell you what the desert kept.

Everything you see is generated in code. Terrain, sand texture, rocks, the Gate, dust and even the wind sound are procedural. There are no 3D model files, texture files or audio files in the repository.

> **Live demo:** not deployed yet. A link will be added here once a deployment has been verified.

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 02 — Enter the Frontier

The experience is one page, one canvas and six scenes.

1. **Loading.** A title screen tracks three real stages: fonts ready, the 3D scene chunk loaded, and the first frames rendered. When all three finish, an *Enter experience* button appears. Page scroll stays locked until you press it.
2. **Travel.** Scrolling moves a cinematic camera through the world. Headlines reveal with GSAP, and the mouse adds a gentle parallax.
3. **Discover.** Hover or tap a glowing monolith, or pick one from the list, to open its discovery card.
4. **Cross the Gate.** Past the ring the light changes: fog, sky and sun shift from dusk to night, and stars appear.
5. **Finish.** *Begin again* replays the intro. A header toggle starts a procedural wind ambience, which is off until you turn it on.

If WebGL is unavailable, the page shows an illustrated gradient sky instead of the 3D layer and says so.

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 03 — The World

Six scenes, read directly from [`Experience.tsx`](./meridian-3d-experience/src/experience/Experience.tsx) and the camera keyframes in [`state.ts`](./meridian-3d-experience/src/experience/state.ts).

| # | Scene | What happens |
|---|-------|--------------|
| 01 | **The Arrival** | "The last frontier." The camera starts low on the dunes and dollies in toward the distant horizon. |
| 02 | **The World** | "A sea of sand under a stalled sun." Monoliths drift above the dunes. |
| 03 | **The Exploration** | "Touch the stones that glow." The four discovery monoliths become interactive. |
| 04 | **The Deep Dive** | "Through the Gate." The camera passes through the ring and dusk breaks into night. |
| 05 | **The Discoveries** | "What the desert kept." The camera looks back across the dunes while four entries reveal. |
| 06 | **The Finale** | "Every horizon is a door." The camera rises high above the desert. *Begin again* or *Revisit the stones*. |

### What the desert kept

Four interactive monoliths, defined in `DISCOVERIES`:

- **The Listening Stone** (Cycle I). A monolith that hums at dusk.
- **The Sunken Archive** (Cycle III). Basalt tablets etched with star charts from ten thousand years ahead.
- **The Glass Orchard** (Cycle IV). Lightning-fused dunes that grew back as ringing glass.
- **The Pilgrim's Shard** (Cycle VI). Fragments of the Gate that fall slowly and never land.

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 04 — Under the Surface

<p align="center">
  <img src="assets/readme/meridian-architecture.svg" alt="Architecture diagram: the TanStack Start entry chain renders the Experience component, which owns the DOM overlay and GSAP ScrollTrigger and writes a shared world state. A lazily loaded React Three Fiber Scene reads that state every frame. The project is frontend-only." width="100%">
</p>

Meridian is a **frontend-only** application. The server-side code in `src/` is the TanStack Start shell (error handling and CSRF middleware), not an application backend. There are no API routes, databases or authentication flows.

### State that never touches React

Per-frame values live in a plain mutable object, not React state, so scrolling and mouse movement never trigger re-renders of the 3D tree:

```ts
// src/experience/state.ts
export const world = {
  progress: 0, // 0..1 scroll through all scenes
  mouseX: 0,
  mouseY: 0,
  hovered: -1,
  reducedMotion: false,
};
```

GSAP ScrollTrigger scrubs across the `#scenes` container and writes `world.progress`. Scene components read it inside `useFrame`.

### A camera driven by keyframes

Six `SHOTS` (position plus look-at target) are interpolated by a `Director` component. Progress selects the segment, a smoothstep eases it, and the result is damped toward the camera each frame:

```ts
// src/experience/Scene.tsx (Director)
const n = SHOTS.length - 1;
const f = Math.min(world.progress * n, n - 0.0001);
const i = Math.floor(f);
const k = smooth(f - i);
```

The same component runs an opening dolly-in, mouse parallax, and the dusk-to-night transition. Between 45% and 75% of scroll progress it blends fog, background and sun colour, lowers the sun's intensity and disc, and reveals the star field.

### Procedural world

| Element | How it is built |
|---------|-----------------|
| **Dunes** | A 400 × 400 plane (180 segments, 90 on low-power devices) displaced by a sum of sine waves in `duneHeight()`. |
| **Sand** | A 256 px canvas texture painted at runtime with 9,000 speckles and ripple lines, then tiled. |
| **Monoliths** | Perturbed icosahedron geometry, flat-shaded. Each bobs on a sine wave and turns slowly. Discovery monoliths ease their emissive glow on hover and open a card on click. |
| **The Gate** | A metal torus, an unlit emissive inner ring that skips tone mapping, and 12 box segments around the rim. It rotates slowly on its axis. |
| **Dust** | A `Points` cloud, 3,500 particles (1,200 on low-power devices). |
| **Light** | Drei `Environment` with two `Lightformer` panels, a hemisphere light, and a shadow-casting directional sun. |
| **Wind** | Web Audio: looping filtered noise with a slow LFO on a band-pass filter. It starts only on user toggle. |

### Performance and accessibility behaviour

- The 3D scene is code-split with `React.lazy`, and loading progress reflects real stages.
- A "low-power" heuristic (viewport under 768 px, or 4 or fewer logical cores) lowers the pixel-ratio cap, disables antialiasing, and reduces dune and dust detail. Drei's `AdaptiveDpr` is also enabled.
- `prefers-reduced-motion` sets `world.reducedMotion`, which damps monolith motion, Gate rotation, dust drift, camera parallax and reveal offsets.
- `ssr: false` on the index route keeps browser-only APIs (`document`, WebGL, Web Audio) out of server rendering.

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 05 — Engineering the Experience

Versions are the ranges declared in [`package.json`](./meridian-3d-experience/package.json). Every technology below is imported or configured in the source.

| Technology | Version | Role in this repo |
|------------|---------|-------------------|
| **React** | ^19.2 | UI and component model |
| **TypeScript** | ^5.8 | Strict mode, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` |
| **Three.js** | ^0.187 | Geometry, materials, textures, fog and lighting |
| **React Three Fiber** | ^9 | Declarative `Canvas`, `useFrame`, `useThree` |
| **@react-three/drei** | ^10 | `Environment`, `Lightformer`, `Stars`, `AdaptiveDpr` |
| **GSAP + ScrollTrigger** | ^3.15 | Scroll scrubbing and text reveals |
| **TanStack Start / Router** | 1.168 / 1.170 | File-based routing, SSR shell, request middleware |
| **TanStack Query** | ^5.101 | `QueryClient` provided at the root (no queries are defined yet) |
| **Vite** | 8.1.5 | Dev server and build, via `@lovable.dev/vite-tanstack-config` |
| **Nitro** | 3.0 beta | Server build output (dev dependency, used by the shared Vite config) |
| **Tailwind CSS** | ^4.2 | Utility styling, with oklch design tokens in `styles.css` |
| **lucide-react** | ^0.575 | Header icons |
| **Vitest + Testing Library** | ^4.1 | One routing test (`src/test/app-routing.test.tsx`) |
| **ESLint + Prettier** | 9 / 3 | Linting and formatting |

Typography is loaded from Google Fonts in the root route: *Cormorant Garamond* (display), *Manrope* (text) and *JetBrains Mono* (labels).

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 06 — Run the Experience

> **The application lives in a nested folder.** The GitHub repository root contains this README and `meridian-3d-experience/`. Run every command below from that **inner** directory.

### Prerequisites

- **Node.js** 20 or newer (22 recommended, as suggested by the application README).
- **Bun** or **npm**. The committed lockfile is `bun.lock`, so Bun matches it exactly. npm also works but will generate its own lockfile.

### Install and run

```bash
git clone https://github.com/adarshmuchatte-lang/meridian-3d-experience.git
cd meridian-3d-experience/meridian-3d-experience

bun install        # or: npm install
bun run dev        # or: npm run dev
```

Vite prints the local URL in the terminal.

### Scripts

All scripts are defined in `package.json`:

| Command | Purpose |
|---------|---------|
| `dev` | Start the development server |
| `build` | Production build |
| `build:dev` | Build in development mode |
| `preview` | Preview the production build locally |
| `lint` | Run ESLint |
| `format` | Run Prettier (writes changes) |
| `test` | Run Vitest once |
| `test:watch` | Run Vitest in watch mode |

Run a script with `bun run <name>` or `npm run <name>`.

### Deploying to Vercel

Import the GitHub repository and set **Root Directory** to `meridian-3d-experience` (the inner folder), so Vercel finds `package.json`.

Two cautions:

- The shared Vite config (`@lovable.dev/vite-tanstack-config`) documents that its Nitro server build defaults to a **Cloudflare** target. A Vercel deployment has not been verified for this project. If the build output does not suit Vercel, select a Nitro preset (Nitro usually reads `NITRO_PRESET`; check its current documentation).
- The application README says to set the project root to the *repository* root. With the nested layout, the inner folder is the correct Root Directory.

Test the deployed URL before publishing it as a live demo.

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 07 — Explore the Source

```text
meridian-3d-experience/                 repository root
├── README.md
├── assets/readme/                      SVG artwork used by this README
└── meridian-3d-experience/             the application
    ├── package.json · bun.lock · bunfig.toml
    ├── vite.config.ts · vitest.config.ts · tsconfig.json · eslint.config.js
    ├── public/                         meridian-mark.svg · robots.txt
    └── src/
        ├── experience/                 Experience.tsx · Scene.tsx · state.ts · sound.ts
        ├── routes/                     __root.tsx · index.tsx
        ├── components/ui/              UI primitives (not used by the current experience)
        ├── hooks/ · lib/ · types/
        ├── test/                       routing test and setup
        ├── router.tsx · server.ts · start.ts
        └── styles.css                  Tailwind v4 entry and design tokens
```

Where to start reading:

| File | What it holds |
|------|---------------|
| [`src/experience/Experience.tsx`](./meridian-3d-experience/src/experience/Experience.tsx) | The DOM layer: loader, navigation, six scene sections, discovery panel, ScrollTrigger |
| [`src/experience/Scene.tsx`](./meridian-3d-experience/src/experience/Scene.tsx) | The R3F canvas: Director, Dunes, Gate, Monoliths, Dust |
| [`src/experience/state.ts`](./meridian-3d-experience/src/experience/state.ts) | Shared `world` state, `SHOTS` camera keyframes, `DISCOVERIES` content |
| [`src/experience/sound.ts`](./meridian-3d-experience/src/experience/sound.ts) | Procedural wind with the Web Audio API |
| [`src/routes/__root.tsx`](./meridian-3d-experience/src/routes/__root.tsx) | HTML shell, head tags, fonts, providers |
| [`src/routes/index.tsx`](./meridian-3d-experience/src/routes/index.tsx) | The `/` route and its metadata |
| [`src/styles.css`](./meridian-3d-experience/src/styles.css) | Colour tokens, typography helpers, vignette and grain |

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 08 — The Next Horizon

**Completed:** the six-scene scroll journey, procedural terrain and Gate, discovery interactions, dusk-to-night transition, procedural wind, reduced-motion handling, WebGL fallback, and one automated routing test.

**Planned, not yet done:**

- [ ] Deploy and add a verified live-demo link.
- [ ] Capture real screenshots or a short screen recording from the running app (the application README already reserves `docs/screenshots/`).
- [ ] Test on real mobile and low-power devices.
- [ ] Audit keyboard navigation, focus states and text contrast.
- [ ] Broaden automated tests beyond the single routing test.
- [ ] Choose and add a `LICENSE` file. No licence is declared yet.

<p align="center">
  <img src="assets/readme/meridian-divider.svg" alt="" width="100%">
</p>

## 09 — Transmission Complete

<p align="center">
  <img src="assets/readme/meridian-footer.svg" alt="Transmission complete. A small glowing Gate on a dusk horizon above the words: Every horizon is a door." width="100%">
</p>

<p align="center">
  <a href="https://github.com/adarshmuchatte-lang/meridian-3d-experience">Repository</a> &nbsp;·&nbsp;
  <a href="./meridian-3d-experience">Source</a> &nbsp;·&nbsp;
  <a href="https://github.com/adarshmuchatte-lang/meridian-3d-experience/issues">Issues</a>
</p>

<p align="center">
  <sub>Created by <a href="https://github.com/adarshmuchatte-lang">Adarsh Muchatte</a>. Third-party libraries keep their own licences.</sub>
</p>
