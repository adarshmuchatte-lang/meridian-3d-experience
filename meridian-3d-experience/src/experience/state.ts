// Per-frame shared state, written by scroll/mouse handlers, read in useFrame. Never React state.
export const world = {
  progress: 0, // 0..1 scroll through all scenes
  mouseX: 0,
  mouseY: 0,
  hovered: -1,
  reducedMotion: false,
};

export const DISCOVERIES = [
  { id: 0, name: "The Listening Stone", era: "Cycle I", text: "A monolith that hums at dusk. Sand gathers in perfect rings around its base, as if it were breathing.", pos: [-9, 5, -22] as [number, number, number] },
  { id: 1, name: "The Sunken Archive", era: "Cycle III", text: "Basalt tablets etched with star charts no living sky can match. The constellations are from ten thousand years ahead.", pos: [-3, 7.5, -30] as [number, number, number] },
  { id: 2, name: "The Glass Orchard", era: "Cycle IV", text: "Lightning struck the dunes for a century. What grew back was glass, branching like trees, ringing in the wind.", pos: [4, 6, -26] as [number, number, number] },
  { id: 3, name: "The Pilgrim's Shard", era: "Cycle VI", text: "Fragments of the Gate fall slowly, never landing. Travellers follow them for years and are never lost.", pos: [10, 8, -34] as [number, number, number] },
];

// Camera keyframes per scene: [position, lookAt]
export const SHOTS: { p: [number, number, number]; t: [number, number, number] }[] = [
  { p: [0, 3.2, 26], t: [0, 6, -40] }, // 01 arrival
  { p: [-8, 6, 10], t: [0, 8, -40] }, // 02 world
  { p: [0, 7, -6], t: [0, 6.5, -28] }, // 03 exploration
  { p: [0, 12, -52], t: [0, 12, -80] }, // 04 deep dive (through the gate)
  { p: [6, 18, -92], t: [0, 14, -40] }, // 05 discoveries (looking back)
  { p: [0, 30, -130], t: [0, 10, -60] }, // 06 finale
];

export const smooth = (x: number) => x * x * (3 - 2 * x);
