import { createFileRoute } from "@tanstack/react-router";
import Experience from "@/experience/Experience";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meridian — The Last Frontier" },
      { name: "description", content: "An immersive cinematic journey across a vast desert of floating monoliths, through the Gate, and into the first night." },
      { property: "og:title", content: "Meridian — The Last Frontier" },
      { property: "og:description", content: "Explore an atmospheric 3D desert, ancient monoliths, and a mysterious Gate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#141024" },
    ],
  }),
  component: Experience,
});
