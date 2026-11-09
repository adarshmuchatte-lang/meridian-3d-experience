# Meridian — The Last Frontier

An immersive, cinematic 3D journey through a vast desert of floating monoliths, atmospheric dunes, and a mysterious Gate. Built with React, TypeScript, Three.js, React Three Fiber, and GSAP.

> **Project status:** Active creative-development project. Features and compatibility should be verified on your target devices before presenting a production guarantee.

## Preview

- **Live demo:** Add your verified deployment URL here after publishing.
- **Screenshots:** Add screenshots from the running application in `docs/screenshots/`.

## Experience

Meridian is a cinematic web experience that guides visitors through six narrative scenes. Scroll to move through the desert world, discover ancient monoliths, approach the Gate, and watch the atmosphere shift from warm dusk toward night.

### Highlights

- Procedurally generated desert terrain and sand texture.
- React Three Fiber / Three.js 3D environment.
- Scroll-driven camera direction and cinematic scene transitions.
- Floating monoliths and an animated Gate.
- Atmospheric dust, stars, and a dusk-to-night palette shift.
- Interactive discoveries and optional procedural wind ambience.
- Responsive rendering and reduced-motion considerations.

## Technology

- React + TypeScript
- TanStack Start and TanStack Router
- Three.js + React Three Fiber + Drei
- GSAP / ScrollTrigger
- Vite, Tailwind CSS, and Vitest

## Getting started

### Requirements

- Node.js 20 or newer (Node.js 22 is recommended).
- npm or Bun. Use the package manager and lockfile you choose consistently.

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Vite prints the local development URL in the terminal. Open it in your browser.

### Production build

```bash
npm run build
npm run preview
```

### Quality checks

```bash
npm run lint
npm test
```

If a script is unavailable or a check fails, inspect the output rather than assuming the check passed.

## Project structure

```text
src/
├── experience/   # 3D scene, experience orchestration, state, and sound
├── components/   # Shared UI components
├── hooks/        # Reusable React hooks
├── lib/          # Shared utilities and error handling
├── routes/       # TanStack Start routes and document shell
├── test/         # Automated tests
└── styles.css    # Global styles and design tokens
public/           # Static assets
```

## Deployment

This project uses TanStack Start and Vite. Vercel can host compatible TanStack Start projects. Import the GitHub repository into Vercel, set the project root to the repository root, use the detected framework/build settings, and deploy. Review the build logs and test the deployed URL before sharing it. If you use another host, confirm that it supports the app's TanStack Start/Nitro output rather than assuming it is a static-only site.

After deployment, replace the live-demo placeholder above with the real URL.

## Accessibility and performance

The project includes reduced-motion handling and responsive rendering considerations. Please verify keyboard access, text contrast, mobile interaction, audio controls, and WebGL fallback behavior in a real browser before claiming full accessibility or device compatibility.

## Credits and licensing

Third-party libraries retain their respective licenses. Confirm the usage rights for any externally sourced fonts, textures, audio, or other assets before redistributing them. No project-wide license is declared here; add a `LICENSE` only after deciding the terms under which you want others to use the project.

---

**Meridian — The Last Frontier**
