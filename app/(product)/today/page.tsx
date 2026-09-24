"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Footprints, Pause, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { curatedActions, surpriseActions } from "@/data/actions";
import { useApp } from "@/components/providers/app-provider";
import { withBasePath } from "@/lib/paths";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" });

export default function TodayPage() {
  const { data, saveCustomAction, notify } = useApp();
  const now = new Date();
  const doing = data.userActions.find((item) => item.status === "doing");
  const doingAction = doing?.customAction ?? curatedActions.find((item) => item.id === doing?.actionId);
  const duePostcard = data.futurePostcards.find((item) => new Date(item.deliverAt) <= now);

  const takeAWalk = () => {
    const idea = surpriseActions[Math.floor(Math.random() * surpriseActions.length)];
    saveCustomAction({ title: idea.split("。")[0], description: idea, category: "去看看世界", duration: "30 分钟–2 小时" });
  };

  return (
    <main>
      <p className="text-sm text-muted">{dateFormatter.format(now)}</p>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <h1 className="font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.88] tracking-[-0.065em]">今天想<br />怎么过？</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">不需要把今天过得很有意义。挑一件现在做得动的事，或者什么都不做。</p>
        </div>
        <div className="relative hidden min-h-80 overflow-hidden rounded-[2rem] md:block"><Image alt="桌面上的旅行地图、电脑与相机" className="object-cover" fill sizes="45vw" src={withBasePath("/images/between/travel-desk.png")} /></div>
      </div>

      {duePostcard ? <section className="mt-12 rotate-[-0.4deg] rounded-[1.5rem] border border-postcard/25 bg-[#f0dfcf] p-6 sm:p-8"><p className="text-xs font-semibold tracking-[0.16em] text-postcard uppercase">来自过去的一张明信片</p><p className="mt-4 font-display text-3xl leading-tight">“{duePostcard.content}”</p><p className="mt-4 text-sm text-muted">写于 {new Date(duePostcard.createdAt).toLocaleDateString("zh-CN")}</p></section> : null}

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <button className="group min-h-64 rounded-[2rem] bg-passport p-6 text-left text-ivory transition hover:-translate-y-1" onClick={takeAWalk} type="button"><Footprints size={23} /><h2 className="mt-12 font-display text-3xl">随便出去走走</h2><p className="mt-3 leading-7 text-ivory/70">给我一件 30 分钟到 2 小时能做的小事。</p><span className="mt-7 flex items-center gap-2 text-sm font-semibold">带我去一个地方 <ArrowRight className="transition group-hover:translate-x-1" size={16} /></span></button>
        <Link className="group min-h-64 rounded-[2rem] border border-ink/12 bg-white/35 p-6 transition hover:-translate-y-1 hover:border-ink/35" href={doing ? "/list" : "/discover"}><Play size={23} /><h2 className="mt-12 font-display text-3xl">{doingAction ? "继续一件正在做的事" : "找一件想做的事"}</h2><p className="mt-3 line-clamp-2 leading-7 text-muted">{doingAction?.title ?? "有些事，开始以后才知道喜不喜欢。"}</p><span className="mt-7 flex items-center gap-2 text-sm font-semibold">继续 <ArrowRight className="transition group-hover:translate-x-1" size={16} /></span></Link>
        <button className="group min-h-64 rounded-[2rem] bg-sand/55 p-6 text-left transition hover:-translate-y-1" onClick={() => notify("今天不想做什么也没关系。你可以直接把页面关掉。")} type="button"><Pause size={23} /><h2 className="mt-12 font-display text-3xl">今天不想做什么</h2><p className="mt-3 leading-7 text-muted">不安排，不复盘，也不用向谁解释。</p><span className="mt-7 flex items-center gap-2 text-sm font-semibold">就停在这里 <Sparkles size={15} /></span></button>
      </section>

      <section className="mt-16 grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-2">
        <div><p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">你上次停在这里</p>{doingAction ? <div className="mt-5"><h2 className="font-display text-4xl">{doingAction.title}</h2><p className="mt-3 leading-7 text-muted">{doingAction.description}</p><Button asChild className="mt-6"><Link href="/list">继续 <ArrowRight size={16} /></Link></Button></div> : <div className="mt-5"><h2 className="font-display text-3xl">还没有正在做的事。</h2><p className="mt-3 text-muted">去清单里挑一件，不需要一次完成。</p></div>}</div>
        <div><p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">最近留下的东西</p>{data.captures.length ? <div className="mt-5 space-y-4">{data.captures.slice(0, 3).map((capture) => <article className="border-b border-ink/10 pb-4" key={capture.id}><p className="text-sm text-muted">{capture.date}{capture.location ? " · " + capture.location : ""}</p><p className="mt-2 line-clamp-2 leading-7">{capture.text}</p></article>)}</div> : <p className="mt-5 leading-7 text-muted">还没有也没关系。等你真有一刻想留下时，再来。</p>}<Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4" href="/capture">去留下 <ArrowRight size={15} /></Link></div>
      </section>
    </main>
  );
}
