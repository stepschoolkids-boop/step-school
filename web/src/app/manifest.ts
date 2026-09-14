import type { MetadataRoute } from "next";
import { ASSETS } from "@/content/assets";
import { SITE } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    lang: "uz",
    background_color: "#050a17",
    theme_color: "#050a17",
    icons: [{ src: ASSETS.brand.logoMark.src, sizes: "512x512", type: "image/png" }],
  };
}
