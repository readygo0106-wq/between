export type BetweenImage = {
  url: string;
  alt: string;
  attribution?: { label: string; href: string };
};

export const localImages = {
  hero: { url: withBasePath("/images/between/passport-table.png"), alt: "旅行途中摊开的地图、相机与随身物品" },
  road: { url: withBasePath("/images/between/road-map.png"), alt: "鞋边摊开的一张旅行路线图" },
  desk: { url: withBasePath("/images/between/travel-desk.png"), alt: "地图上的电脑、相机与咖啡" },
  writing: { url: withBasePath("/images/between/writing-desk.png"), alt: "桌面上的手写信与咖啡" },
  scrapbook: { url: withBasePath("/images/between/scrapbook-cover.png"), alt: "旅行照片与地图组成的手账封面" },
} satisfies Record<string, BetweenImage>;

export function getImage(image: BetweenImage) {
  return image;
}
import { withBasePath } from "@/lib/paths";
