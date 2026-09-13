import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Phase-2 pages (kitoblar, ota-onalar, natijalar, biz-haqimizda) get added here.
  return [{ url: SITE.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
