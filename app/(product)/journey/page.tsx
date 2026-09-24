"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { curatedActions } from "@/data/actions";
import { withBasePath } from "@/lib/paths";

export default function JourneyPage() {
  const { data, deleteCapture, generateStageReflection, savePostcard } = useApp();
  const [postcard, setPostcard] = useState("");
  const [deliverAt, setDeliverAt] = useState(() => { const date = new Date(); date.setMonth(date.getMonth() + 3); return date.toISOString().slice(0, 10); });
  const [reflectionError, setReflectionError] = useState("");
  const journeyStarted = [...data.captures.map((item) => item.createdAt), ...data.userActions.map((item) => item.createdAt)].sort()[0];
  const doneActions = data.userActions.filter((item) => item.status === "done");
  const events = useMemo(() => [
    ...data.captures.map((capture) => ({ id: capture.id, date: capture.date, kind: "capture" as const, capture })),
    ...doneActions.map((item) => ({ id: item.id, date: item.completedAt ?? item.updatedAt, kind: "action" as const, item, action: item.customAction ?? curatedActions.find((action) => action.id === item.actionId) })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [data.captures, doneActions]);

  const reflect = () => {
    const result = generateStageReflection();
    if (!result) setReflectionError("现在还没留下足够多的东西。再过一阵回来看看。");
  };

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-7"><div><p className="text-xs font-semibold tracking-[0.18em] text-postcard uppercase">我的旅程</p><h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] tracking-[-0.06em]">我的 BETWEEN</h1><p className="mt-5 text-sm tracking-[0.12em] text-muted uppercase">{journeyStarted ? new Date(journeyStarted).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" }) : "从今天"} — 现在</p></div><Button asChild><Link href="/capture"><Plus size={16} /> 留下今天</Link></Button></div>

      {events.length ? <section className="relative mt-14 max-w-4xl before:absolute before:bottom-0 before:left-[1.18rem] before:top-3 before:w-px before:bg-ink/16 sm:before:left-[8.9rem]">{events.map((event, index) => <article className="relative grid gap-4 pb-12 pl-14 sm:grid-cols-[7rem_1fr] sm:gap-10 sm:pl-0" key={event.kind + event.id}><div className="absolute left-[0.86rem] top-2 z-10 size-3 rounded-full border-2 border-ivory bg-postcard sm:left-[8.58rem]" /><time className="text-sm text-muted sm:text-right">{new Date(event.date).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</time><div className={"overflow-hidden rounded-[1.7rem] border border-ink/10 " + (index % 2 ? "bg-[#eee5d4]" : "bg-white/35")}>{event.kind === "capture" ? <>{event.capture.imageUrl ? <div className="relative aspect-[16/10]"><Image alt="旅程记录照片" className="object-cover" fill unoptimized={event.capture.imageUrl.startsWith("data:")} sizes="(max-width: 640px) 100vw, 48rem" src={event.capture.imageUrl} /></div> : null}<div className="p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted">{event.capture.type}{event.capture.id.startsWith("demo-") ? " · 演示内容" : ""}</p><p className="mt-3 whitespace-pre-wrap text-lg leading-8">{event.capture.text}</p></div><button aria-label="删除这条记录" className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-postcard/10 hover:text-postcard" onClick={() => { if (window.confirm("要删除这条记录吗？删除后无法恢复。")) deleteCapture(event.capture.id); }} type="button"><Trash2 size={16} /></button></div>{event.capture.location ? <p className="mt-5 flex items-center gap-2 text-sm text-muted"><MapPin size={14} /> {event.capture.location}</p> : null}{event.capture.tags.length ? <div className="mt-4 flex flex-wrap gap-2">{event.capture.tags.map((tag) => <span className="rounded-full bg-sand/60 px-3 py-1 text-xs" key={tag}>{tag}</span>)}</div> : null}</div></> : <div className="p-5 sm:p-7"><p className="text-xs font-semibold tracking-[0.14em] text-sage uppercase">做过一件事{event.item.id.startsWith("demo-") ? " · 演示内容" : ""}</p><h2 className="mt-3 font-display text-3xl">{event.action?.title}</h2><p className="mt-3 leading-7 text-muted">{event.action?.whatYouMightLeaveWith}</p></div>}</div></article>)}
        <div className="relative grid pl-14 sm:grid-cols-[7rem_1fr] sm:gap-10 sm:pl-0"><div className="absolute left-[0.67rem] top-0 z-10 rounded-full bg-ink px-3 py-1.5 text-[10px] font-semibold tracking-widest text-ivory sm:left-[7.35rem]">YOU ARE HERE</div><span /><p className="pt-12 font-display text-3xl">路还在继续。</p></div>
      </section> : <section className="mt-14 grid gap-8 rounded-[2rem] bg-sand/45 p-7 sm:p-10 lg:grid-cols-[0.7fr_1fr] lg:items-center"><div className="relative min-h-72 overflow-hidden rounded-[1.4rem]"><Image alt="一本旅行手账、护照与相机" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 35vw" src={withBasePath("/images/between/passport-table.png")} /></div><div><h2 className="font-display text-4xl">这里还没有发生过什么。</h2><p className="mt-4 max-w-lg leading-7 text-muted">这很好。等你做过一件事、去过一个地方，或者只是想留下一句话，这条路才会开始长成你的样子。</p><Button asChild className="mt-6"><Link href="/capture">留下第一件事 <ArrowRight size={16} /></Link></Button></div></section>}

      {data.journeyStamps.length ? <section className="mt-20 border-t border-ink/10 pt-10"><p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">路上留下的印章</p><div className="mt-6 flex flex-wrap gap-4">{data.journeyStamps.map((stamp) => <div className="grid min-h-32 min-w-32 rotate-[-3deg] place-items-center rounded-full border-2 border-dashed border-postcard p-5 text-center text-postcard" key={stamp.id}><div><p className="font-display text-lg leading-tight">{stamp.label}</p><p className="mt-2 text-[10px] tracking-wider">{new Date(stamp.date).toLocaleDateString("zh-CN")}</p></div></div>)}</div></section> : null}

      <section className="mt-20 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-passport p-7 text-ivory sm:p-9"><Sparkles size={22} /><p className="mt-8 text-xs font-semibold tracking-[0.15em] text-ivory/55 uppercase">阶段回顾</p><h2 className="mt-3 font-display text-4xl">最近好像发生了不少事。</h2>{data.stageReflection ? <div className="mt-6"><p className="leading-8 text-ivory/78">{data.stageReflection.summary}</p>{data.stageReflection.recurringThemes.length ? <div className="mt-5 flex flex-wrap gap-2">{data.stageReflection.recurringThemes.map((item) => <span className="rounded-full border border-ivory/25 px-3 py-1 text-xs" key={item}>{item}</span>)}</div> : null}</div> : <><p className="mt-4 leading-7 text-ivory/68">当你留下 5 段记录，或者做完 3 件事，我们再一起回头看看。只根据你真正留下的内容整理。</p><Button className="mt-6 bg-ivory text-ink hover:bg-sky" onClick={reflect}>要不要一起回头看看？</Button>{reflectionError ? <p className="mt-4 text-sm text-ivory/65">{reflectionError}</p> : null}</>}</div>
        <div className="rounded-[2rem] border border-ink/10 bg-[#eee2cf] p-7 sm:p-9"><Mail size={22} /><p className="mt-8 text-xs font-semibold tracking-[0.15em] text-postcard uppercase">给三个月后的自己</p><h2 className="mt-3 font-display text-4xl">希望那时候的我……</h2><label className="mt-5 block"><span className="sr-only">写给未来自己的话</span><Textarea className="min-h-32 bg-ivory" onChange={(event) => setPostcard(event.target.value)} placeholder="写一点不需要现在实现的话。" value={postcard} /></label><label className="mt-4 block"><span className="mb-2 flex items-center gap-2 text-xs text-muted"><CalendarDays size={14} /> 回来的日期</span><Input onChange={(event) => setDeliverAt(event.target.value)} type="date" value={deliverAt} /></label><Button className="mt-5" disabled={postcard.trim().length < 3} onClick={() => { savePostcard(postcard, deliverAt); setPostcard(""); }}>寄给未来的自己</Button></div>
      </section>
    </main>
  );
}
