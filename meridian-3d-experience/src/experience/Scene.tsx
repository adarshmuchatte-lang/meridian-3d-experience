import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Stars, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { world, SHOTS, DISCOVERIES, smooth } from "./state";

const DUSK = { fog: new THREE.Color("#c98a5a"), sun: new THREE.Color("#ffb070"), sky: new THREE.Color("#d8956a") };
const NIGHT = { fog: new THREE.Color("#141024"), sun: new THREE.Color("#8fa4ff"), sky: new THREE.Color("#0c0a18") };

function duneHeight(x: number, z: number) {
  return Math.sin(x * 0.08) * 1.6 + Math.sin(z * 0.05 + x * 0.03) * 2.4 + Math.sin(x * 0.21 + z * 0.17) * 0.5 + Math.cos(z * 0.012) * 3;
}

function sandTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#b9805a";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 150 + Math.random() * 80;
    g.fillStyle = `rgba(${v},${v * 0.72},${v * 0.5},0.35)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  for (let y = 0; y < 256; y += 6) {
    g.strokeStyle = "rgba(90,50,30,0.12)";
    g.beginPath();
    for (let x = 0; x <= 256; x += 8) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 30);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Dunes({ low }: { low: boolean }) {
  const geo = useMemo(() => {
    const seg = low ? 90 : 180;
    const g = new THREE.PlaneGeometry(400, 400, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setY(i, duneHeight(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, [low]);
  const tex = useMemo(() => sandTexture(), []);
  useEffect(() => () => { geo.dispose(); tex.dispose(); }, [geo, tex]);
  return (
    <mesh geometry={geo} position={[0, -2, -60]} receiveShadow>
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function rockGeo(seed: number, detail = 2) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i);
    const n = 1 + Math.sin(v.x * 3 + seed) * 0.12 + Math.cos(v.y * 4 + seed * 2) * 0.1;
    v.multiplyScalar(n);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function Monolith({ i, pos, scale, onSelect }: { i: number; pos: [number, number, number]; scale: [number, number, number]; onSelect?: (i: number) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const geo = useMemo(() => rockGeo(i * 1.7), [i]);
  const interactive = !!onSelect;
  useFrame((s, d) => {
    const t = s.clock.elapsedTime;
    if (!ref.current || !mat.current) return;
    const m = world.reducedMotion ? 0.2 : 1;
    ref.current.position.y = pos[1] + Math.sin(t * 0.4 + i) * 0.6 * m;
    ref.current.rotation.y += d * 0.05 * m;
    const target = interactive && world.hovered === i ? 2.2 : interactive ? 0.35 : 0;
    mat.current.emissiveIntensity += (target - mat.current.emissiveIntensity) * Math.min(1, d * 6);
  });
  return (
    <mesh
      ref={ref}
      geometry={geo}
      position={pos}
      scale={scale}
      castShadow
      onPointerOver={(e) => { if (!interactive) return; e.stopPropagation(); world.hovered = i; document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { if (!interactive) return; world.hovered = -1; document.body.style.cursor = ""; }}
      onClick={(e) => { if (!onSelect) return; e.stopPropagation(); onSelect(i); }}
    >
      <meshStandardMaterial ref={mat} color="#3a2a24" roughness={0.75} metalness={0.15} emissive="#ff8a3d" emissiveIntensity={0} flatShading />
    </mesh>
  );
}

function Gate() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current && !world.reducedMotion) ref.current.rotation.z += d * 0.03; });
  return (
    <group ref={ref} position={[0, 12, -66]}>
      <mesh castShadow>
        <torusGeometry args={[11, 1.1, 24, 96]} />
        <meshStandardMaterial color="#2a1f1c" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh>
        <torusGeometry args={[9.4, 0.08, 8, 128]} />
        <meshBasicMaterial color="#ffc28a" toneMapped={false} />
      </mesh>
      {Array.from({ length: 12 }).map((_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.cos(a) * 13, Math.sin(a) * 13, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[1.8, 0.5, 0.5]} />
            <meshStandardMaterial color="#4a3428" roughness={0.6} metalness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 120;
      a[i * 3 + 1] = Math.random() * 40;
      a[i * 3 + 2] = 30 - Math.random() * 180;
    }
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((s) => {
    if (!ref.current || world.reducedMotion) return;
    ref.current.position.x = Math.sin(s.clock.elapsedTime * 0.05) * 6;
    ref.current.rotation.y = s.clock.elapsedTime * 0.004;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.12} color="#ffd9b0" transparent opacity={0.7} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Director({ onReady }: { onReady: () => void }) {
  const { camera, scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const sunDisc = useRef<THREE.Mesh>(null);
  const stars = useRef<THREE.Group>(null);
  const pos = useMemo(() => new THREE.Vector3(...SHOTS[0]!.p), []);
  const look = useMemo(() => new THREE.Vector3(...SHOTS[0]!.t), []);
  const tmpP = useMemo(() => new THREE.Vector3(), []);
  const tmpT = useMemo(() => new THREE.Vector3(), []);
  const fogC = useMemo(() => new THREE.Color(), []);
  const frames = useRef(0);
  const intro = useRef(0);

  useEffect(() => {
    scene.fog = new THREE.Fog(DUSK.fog, 20, 160);
    scene.background = DUSK.sky.clone();
  }, [scene]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (++frames.current === 3) onReady();
    intro.current = Math.min(1, intro.current + dt * 0.12);
    const n = SHOTS.length - 1;
    const f = Math.min(world.progress * n, n - 0.0001);
    const i = Math.floor(f);
    const k = smooth(f - i);
    tmpP.fromArray(SHOTS[i]!.p).lerp(new THREE.Vector3(...SHOTS[i + 1]!.p), k);
    tmpT.fromArray(SHOTS[i]!.t).lerp(new THREE.Vector3(...SHOTS[i + 1]!.t), k);
    // opening dolly-in
    tmpP.z += (1 - smooth(intro.current)) * 14;
    tmpP.y += (1 - smooth(intro.current)) * 2;
    // parallax
    const px = world.reducedMotion ? 0 : 1.6;
    tmpP.x += world.mouseX * px;
    tmpP.y += -world.mouseY * px * 0.5;
    const ease = 1 - Math.exp(-dt * 3);
    pos.lerp(tmpP, ease);
    look.lerp(tmpT, ease);
    camera.position.copy(pos);
    camera.lookAt(look);

    // dusk -> night after the gate
    const night = smooth(THREE.MathUtils.clamp((world.progress - 0.45) / 0.3, 0, 1));
    fogC.copy(DUSK.fog).lerp(NIGHT.fog, night);
    (scene.fog as THREE.Fog).color.copy(fogC);
    (scene.background as THREE.Color).copy(DUSK.sky).lerp(NIGHT.sky, night);
    if (sun.current) {
      sun.current.color.copy(DUSK.sun).lerp(NIGHT.sun, night);
      sun.current.intensity = 2.6 - night * 1.6;
    }
    if (sunDisc.current) sunDisc.current.position.y = 14 - night * 26;
    if (stars.current) stars.current.visible = night > 0.05;
  });

  return (
    <>
      <hemisphereLight args={["#ffd2a8", "#3a2018", 0.6]} />
      <directionalLight ref={sun} position={[-30, 25, -80]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-60} shadow-camera-right={60} shadow-camera-top={60} shadow-camera-bottom={-60} />
      <mesh ref={sunDisc} position={[-30, 14, -170]}>
        <circleGeometry args={[9, 48]} />
        <meshBasicMaterial color="#ffe1b8" fog={false} toneMapped={false} />
      </mesh>
      <group ref={stars}><Stars radius={180} depth={40} count={2500} factor={5} fade speed={0.4} /></group>
    </>
  );
}

const BG_ROCKS: { p: [number, number, number]; s: [number, number, number] }[] = [
  { p: [-26, 10, -50], s: [3, 9, 3] },
  { p: [24, 13, -58], s: [2.5, 11, 2.5] },
  { p: [-18, 22, -90], s: [5, 4, 5] },
  { p: [30, 20, -100], s: [4, 6, 4] },
  { p: [-40, 6, -120], s: [6, 14, 5] },
  { p: [14, 28, -120], s: [3, 3, 3] },
  { p: [-8, 3, -10], s: [1.2, 3, 1.2] },
  { p: [12, 2, 4], s: [1.6, 2.4, 1.6] },
];

export default function Scene({ onSelect, onReady }: { onSelect: (i: number) => void; onReady: () => void }) {
  const low = typeof window !== "undefined" && (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);
  return (
    <Canvas
      shadows
      dpr={[1, low ? 1.25 : 1.75]}
      camera={{ fov: 50, near: 0.1, far: 400, position: SHOTS[0]!.p }}
      gl={{ antialias: !low, powerPreference: "high-performance" }}
      onPointerMissed={() => (world.hovered = -1)}
    >
      <AdaptiveDpr pixelated />
      <Director onReady={onReady} />
      <Environment resolution={64}>
        <Lightformer intensity={1.5} position={[0, 5, 0]} scale={[10, 10, 1]} color="#ffcfa0" />
        <Lightformer intensity={0.8} color="#7a8cff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <Dunes low={low} />
      <Gate />
      {BG_ROCKS.map((r, i) => <Monolith key={i} i={i + 10} pos={r.p} scale={r.s} />)}
      {DISCOVERIES.map((d) => <Monolith key={d.id} i={d.id} pos={d.pos} scale={[1.4, 2.6, 1.4]} onSelect={onSelect} />)}
      <Dust count={low ? 1200 : 3500} />
    </Canvas>
  );
}
