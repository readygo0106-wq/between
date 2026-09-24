import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-ivory px-6 text-center"><div><p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">404 · BETWEEN</p><h1 className="mt-5 font-display text-6xl tracking-[-0.06em]">这一页还没有成为一个章节。</h1><p className="mx-auto mt-5 max-w-lg leading-7 text-muted">也许它被移动了，或者你只是走进了一条还不存在的小路。</p><Link className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-ivory" href="/"><ArrowLeft size={16} /> 回到首页</Link></div></main>;
}
