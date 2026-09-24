import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProvider } from "@/components/providers/app-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BETWEEN — 两个章节之间",
  description: "一本会陪你一起走的数字 Gap Year 手账。",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="zh-CN">
      <body><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
