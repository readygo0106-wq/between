"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Dices, X } from "lucide-react";

import { ActionCard } from "@/components/product/action-card";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { actionCategories, curatedActions, surpriseActions } from "@/data/actions";
import type { ActionCategory } from "@/types/product";

export default function DiscoverPage() {
  const router = useRouter();
  const { saveCustomAction } = useApp();
  const [category, setCategory] = useState<ActionCategory | "全部">("全部");
  const [surprise, setSurprise] = useState<string | null>(null);
  const actions = useMemo(() => category === "全部" ? curatedActions : curatedActions.filter((action) => action.category === category), [category]);

  const surpriseMe = () => {
    const choices = surpriseActions.filter((item) => item !== surprise);
    setSurprise(choices[Math.floor(Math.random() * choices.length)] ?? surpriseActions[0]);
  };

  const saveSurprise = () => {
    if (!surprise) return;
    saveCustomAction({ title: surprise.split("。")[0], description: surprise, category: "去看看世界", duration: "30 分钟–2 小时" });
    router.push("/list");
  };

  return (
    <main>
      <p className="text-xs font-semibold tracking-[0.18em] text-postcard uppercase">去发现</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div><h1 className="font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.88] tracking-[-0.065em]">今天想往<br />哪边走？</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">先别找最正确的方向。挑一个你愿意靠近一点的地方。</p></div>
        <Button className="mb-1 bg-postcard text-ivory hover:bg-postcard/85" onClick={surpriseMe}><Dices size={17} /> 今天随便带我去一个地方</Button>
      </div>

      {surprise ? <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-passport p-7 text-ivory sm:p-10"><button aria-label="收起随机行动" className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-ivory/25" onClick={() => setSurprise(null)} type="button"><X size={17} /></button><p className="text-xs font-semibold tracking-[0.15em] text-ivory/55 uppercase">今天就试这个</p><p className="mt-5 max-w-3xl font-display text-3xl leading-tight sm:text-5xl">“{surprise}”</p><div className="mt-7 flex flex-wrap gap-3"><Button className="bg-ivory text-ink hover:bg-sky" onClick={saveSurprise}>把它写进我的清单 <ArrowRight size={16} /></Button><Button className="border-ivory/35 text-ivory hover:bg-ivory/10" onClick={surpriseMe} variant="secondary">换一个</Button></div></section> : null}

      <section className="mt-14">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actionCategories.map((item) => <button aria-pressed={category === item.title} className={"group relative min-h-44 overflow-hidden rounded-[1.5rem] text-left " + (category === item.title ? "ring-3 ring-postcard ring-offset-3 ring-offset-ivory" : "")} key={item.title} onClick={() => setCategory(category === item.title ? "全部" : item.title)} type="button"><Image alt="" className="object-cover transition duration-500 group-hover:scale-105" fill sizes="(max-width: 640px) 100vw, 33vw" src={item.image} /><span className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/10 to-transparent" /><span className="absolute inset-x-0 bottom-0 p-5 text-ivory"><strong className="font-display text-2xl font-normal">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-ivory/65">{item.note}</span></span></button>)}
          <button className="min-h-44 rounded-[1.5rem] border border-dashed border-ink/30 p-5 text-left transition hover:bg-sand/45" onClick={surpriseMe} type="button"><Dices size={21} /><strong className="mt-8 block font-display text-2xl font-normal">我也不知道</strong><span className="mt-1 block text-xs leading-5 text-muted">给我一件安全、简单、今天能做的事。</span></button>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{category === "全部" ? "一些可以真的去做的事" : category}</p><h2 className="mt-3 font-display text-4xl tracking-[-0.045em]">有些路，走了以后才知道。</h2></div><button className="text-sm underline underline-offset-4" onClick={() => setCategory("全部")} type="button">查看全部</button></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">{actions.map((action) => <ActionCard action={action} key={action.id} />)}</div>
      </section>
    </main>
  );
}
