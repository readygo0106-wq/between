"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Compass, Heart } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import { withBasePath } from "@/lib/paths";

const thoughts = [
  "别人都在往前走，我是不是停太久了？",
  "我知道自己不喜欢现在这样，但不知道喜欢什么。",
  "好不容易有时间了，反而不知道该干嘛。",
  "我想出去看看，又怕这一年最后什么都没留下。",
  "如果最后还是没有找到答案怎么办？",
];

const ways = [
  { number: "01", title: "去一个没去过的地方", copy: "不是为了找到自己。只是看看别处的人怎么生活。", image: withBasePath("/images/between/road-map.png") },
  { number: "02", title: "做一个一直想做的小东西", copy: "网站、短片、摄影集、播客，或者一门很小的生意。", image: withBasePath("/images/between/travel-desk.png") },
  { number: "03", title: "认识一个走在不同路上的人", copy: "问问他普通的一天怎么过，又是怎么走到这里的。", image: withBasePath("/images/between/writing-desk.png") },
  { number: "04", title: "跟着好奇心走一天", copy: "不用有用，也不用马上变成一个方向。", image: withBasePath("/images/between/scrapbook-cover.png") },
  { number: "05", title: "认真休息一阵", copy: "Gap Year 也不是另一份全职工作。", image: withBasePath("/images/between/passport-table.png") },
];

export default function LandingPage() {
  const { data, toggleResonantNote } = useApp();
  return (
    <main className="overflow-hidden bg-ivory">
      <header className="absolute inset-x-0 top-0 z-20">
        <nav aria-label="首页导航" className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-[var(--page-gutter)] text-ivory">
          <Link className="font-display text-xl tracking-[-0.04em]" href="/">BETWEEN.</Link>
          <Link className="rounded-full border border-ivory/40 bg-ink/10 px-4 py-2 text-sm backdrop-blur-sm transition hover:bg-ivory hover:text-ink" href="/today">进入我的 BETWEEN</Link>
        </nav>
      </header>

      <section className="relative bg-ink text-ivory">
        <div className="mx-auto grid min-h-[92svh] max-w-[90rem] md:grid-cols-2">
          <div className="order-2 flex items-center px-[var(--page-gutter)] py-14 md:order-1 md:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.23em] text-ivory/65 uppercase">A PLACE BETWEEN CHAPTERS</p>
            <h1 className="mt-6 font-display text-[clamp(3rem,7vw,6.3rem)] leading-[0.86] tracking-[-0.06em]">不知道下一站去哪，<br /><em className="font-normal text-sky">也可以先出发。</em></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-ivory/78 sm:text-lg">毕业、离职、Gap Year、转行，或者只是暂时不想继续原来的生活。这里不替你规划人生，陪你把这段时间真正过一遍。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ivory px-6 text-sm font-semibold text-ink transition hover:bg-sky" href="/today">开始我的 BETWEEN <ArrowRight size={16} /></Link>
              <a className="inline-flex min-h-12 items-center rounded-full border border-ivory/40 px-6 text-sm transition hover:bg-ivory/10" href="#ways">先随便看看</a>
            </div>
          </div>
          </div>
          <div className="relative order-1 min-h-[44svh] md:order-2 md:min-h-[92svh]">
            <Image alt="旅行途中摊开的地图、相机与随身物品" className="object-cover" fill loading="eager" sizes="(max-width: 768px) 100vw, 50vw" src={withBasePath("/images/between/passport-table.png")} />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/15 md:bg-gradient-to-r md:from-ink/25 md:to-transparent" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[82rem] px-[var(--page-gutter)] py-24 sm:py-32">
        <p className="text-xs font-semibold tracking-[0.2em] text-postcard uppercase">最近怎么样？</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.96] tracking-[-0.055em]">最近，你是不是也想过这些？</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {thoughts.map((thought, index) => {
            const selected = data.resonantNotes.includes(thought);
            return <button aria-pressed={selected} className={"group flex min-h-40 items-start justify-between gap-5 rounded-[1.2rem] border p-6 text-left text-lg leading-8 transition sm:p-8 " + (selected ? "rotate-0 border-sage bg-sage text-ivory" : index % 2 ? "-rotate-[0.5deg] border-ink/12 bg-white/50 hover:rotate-0 hover:border-ink/35" : "rotate-[0.45deg] border-ink/12 bg-[#efe5cf] hover:rotate-0 hover:border-ink/35")} key={thought} onClick={() => toggleResonantNote(thought)} type="button"><span>“{thought}”</span><span className={"grid size-8 shrink-0 place-items-center rounded-full border " + (selected ? "border-ivory/50" : "border-ink/15")}><Check className={selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"} size={15} /></span></button>;
          })}
        </div>
        <p className="mt-6 text-sm text-muted">点一下，只是把这句话留在这里。不会立刻分析你。</p>
      </section>

      <section className="bg-[#e8dfcf] py-24 sm:py-32" id="ways">
        <div className="mx-auto max-w-[90rem] px-[var(--page-gutter)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-xs font-semibold tracking-[0.2em] text-passport uppercase">HOW TO SPEND THE TIME</p><h2 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.96] tracking-[-0.055em]">这一年，不一定非要有一个宏大的答案。</h2></div>
            <p className="max-w-sm text-sm leading-7 text-muted">左右滑一滑。哪件事让你有一点想出门，就从那里开始。</p>
          </div>
          <div className="-mx-[var(--page-gutter)] mt-12 flex snap-x gap-5 overflow-x-auto px-[var(--page-gutter)] pb-5 [scrollbar-width:none]">
            {ways.map((way) => <article className="group relative min-h-[34rem] w-[82vw] max-w-[27rem] shrink-0 snap-center overflow-hidden rounded-[2rem] bg-ink text-ivory sm:w-[28rem]" key={way.number}><Image alt="" className="object-cover transition duration-700 group-hover:scale-[1.03]" fill sizes="(max-width: 640px) 82vw, 28rem" src={way.image} /><div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/12 to-ink/5" /><div className="absolute inset-x-0 bottom-0 p-7 sm:p-8"><p className="font-display text-xl text-ivory/60">{way.number}</p><h3 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.045em]">{way.title}</h3><p className="mt-4 leading-7 text-ivory/72">{way.copy}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[82rem] gap-10 px-[var(--page-gutter)] py-24 sm:py-32 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem]"><Image alt="桌面上的手写信、笔记本与咖啡" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 55vw" src={withBasePath("/images/between/writing-desk.png")} /></div>
        <div>
          <Heart className="text-postcard" size={26} />
          <h2 className="mt-8 font-display text-[clamp(3rem,6vw,5.6rem)] leading-[0.94] tracking-[-0.055em]">你不需要现在就知道答案。</h2>
          <p className="mt-6 text-xl leading-8 text-muted">先去过一点生活。走过的路、做过的小事和想留下的话，会慢慢变成你的这一章。</p>
          <Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-ivory transition hover:bg-passport" href="/today">开始我的 BETWEEN <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-ink/10 px-[var(--page-gutter)] py-8"><div className="mx-auto flex max-w-[82rem] flex-wrap items-center justify-between gap-3"><p className="font-display text-xl">BETWEEN.</p><p className="flex items-center gap-2 text-sm text-muted"><Compass size={15} /> 一本会陪你一起走的数字手账</p></div></footer>
    </main>
  );
}
