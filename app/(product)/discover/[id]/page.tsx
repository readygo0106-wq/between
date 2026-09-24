"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Check, Clock3, PackageOpen, WalletCards } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { getAction } from "@/data/actions";

export default function ActionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, saveAction, setActionStatus } = useApp();
  const action = getAction(params.id);
  if (!action) return <main><p>没有找到这件事。</p><Button asChild className="mt-5"><Link href="/discover">回到去发现</Link></Button></main>;
  const saved = data.userActions.find((item) => item.actionId === action.id);

  const start = () => {
    if (!saved) {
      saveAction(action.id, "doing");
      router.push("/list");
      return;
    }
    setActionStatus(saved.id, "doing");
    router.push("/list");
  };

  return (
    <main>
      <Link className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink" href="/discover"><ArrowLeft size={16} /> 回到去发现</Link>
      <section className="mt-7 grid overflow-hidden rounded-[2rem] bg-sand/45 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[26rem] lg:min-h-[42rem]"><Image alt="" className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 55vw" src={action.coverImage} /></div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14"><p className="text-xs font-semibold tracking-[0.16em] text-postcard uppercase">{action.category} · BETWEEN 精选</p><h1 className="mt-5 font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.055em]">{action.title}</h1><p className="mt-6 text-lg leading-8 text-muted">{action.description}</p><div className="mt-8 flex flex-wrap gap-3"><Button onClick={start}><Check size={17} /> {saved?.status === "doing" ? "继续做" : "我想试试"}</Button><Button disabled={Boolean(saved)} onClick={() => saveAction(action.id)} variant="secondary"><Bookmark fill={saved ? "currentColor" : "none"} size={16} /> {saved ? "已在清单" : "先收藏"}</Button></div></div>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-ink/10 p-5"><Clock3 size={19} /><p className="mt-5 text-xs text-muted">大概需要</p><p className="mt-1 font-medium">{action.duration}</p></div><div className="rounded-2xl border border-ink/10 p-5"><WalletCards size={19} /><p className="mt-5 text-xs text-muted">花费</p><p className="mt-1 font-medium">{action.costLevel}</p></div><div className="rounded-2xl border border-ink/10 p-5"><PackageOpen size={19} /><p className="mt-5 text-xs text-muted">最后可能留下</p><p className="mt-1 font-medium">{action.whatYouMightLeaveWith}</p></div></section>
      <section className="mt-12 max-w-2xl"><p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">你需要的东西</p><ul className="mt-5 space-y-3">{action.whatYouNeed.map((item) => <li className="flex items-center gap-3 border-b border-ink/10 pb-3" key={item}><span className="size-2 rounded-full bg-sage" />{item}</li>)}</ul><p className="mt-8 text-sm leading-7 text-muted">这是一条由 BETWEEN 编辑整理的行动建议，不是假装来自某位用户的经历。</p></section>
    </main>
  );
}
