"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ListChecks, PenLine, Route, Sun, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navigation = [
  { href: "/today", label: "今天", icon: Sun },
  { href: "/discover", label: "去发现", icon: Compass },
  { href: "/list", label: "我的清单", icon: ListChecks },
  { href: "/capture", label: "留下", icon: PenLine },
  { href: "/journey", label: "我的旅程", icon: Route },
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-ivory pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/94 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-[var(--content-width)] items-center justify-between px-[var(--page-gutter)]">
          <Link aria-label="返回今天" className="font-display text-xl tracking-[-0.04em]" href="/today">BETWEEN<span className="text-postcard">.</span></Link>
          <nav aria-label="主要导航" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => { const active = pathname === item.href || pathname.startsWith(item.href + "/"); return <Link className={cn("rounded-full px-3.5 py-2 text-sm text-muted transition hover:bg-sand/55 hover:text-ink focus-visible:outline-2", active && "bg-sand/65 text-ink")} href={item.href} key={item.href}>{item.label}</Link>; })}
          </nav>
          <Link aria-label="个人设置" className={cn("grid size-10 place-items-center rounded-full border border-ink/15 transition hover:bg-sand", pathname === "/profile" && "bg-ink text-ivory")} href="/profile"><UserRound size={18} /></Link>
        </div>
      </header>
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-8 sm:py-12">{children}</div>
      <nav aria-label="移动端导航" className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-5 rounded-[1.4rem] border border-ink/12 bg-ivory/96 p-1.5 shadow-[var(--soft-shadow)] backdrop-blur-md md:hidden">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return <Link className={cn("flex min-h-13 flex-col items-center justify-center gap-1 rounded-[1rem] text-[10px] text-muted", active && "bg-ink text-ivory")} href={item.href} key={item.href}><Icon aria-hidden="true" size={17} /><span>{item.label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
