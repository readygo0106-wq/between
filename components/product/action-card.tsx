"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock3 } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import type { BetweenAction } from "@/types/product";

export function ActionCard({ action }: { action: BetweenAction }) {
  const { data, saveAction } = useApp();
  const saved = data.userActions.some((item) => item.actionId === action.id);
  return (
    <article className="group overflow-hidden rounded-[1.8rem] border border-ink/10 bg-white/35">
      <Link className="relative block aspect-[4/3] overflow-hidden" href={"/discover/" + action.id}>
        <Image alt="" className="object-cover transition duration-700 group-hover:scale-[1.035]" fill sizes="(max-width: 768px) 100vw, 34vw" src={action.coverImage} />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/92 px-3 py-1.5 text-xs font-medium backdrop-blur">{action.category}</span>
      </Link>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Link className="font-display text-3xl leading-[1.04] tracking-[-0.04em] hover:underline hover:underline-offset-4" href={"/discover/" + action.id}>{action.title}</Link>
          <button aria-label={saved ? "已在清单" : "放进清单"} className={"grid size-10 shrink-0 place-items-center rounded-full border transition " + (saved ? "border-passport bg-passport text-ivory" : "border-ink/15 hover:bg-sand")} disabled={saved} onClick={() => saveAction(action.id)} type="button"><Bookmark fill={saved ? "currentColor" : "none"} size={17} /></button>
        </div>
        <p className="mt-3 line-clamp-2 leading-7 text-muted">{action.description}</p>
        <div className="mt-5 flex items-center justify-between text-xs text-muted"><span className="flex items-center gap-1.5"><Clock3 size={14} /> {action.duration}</span><span>{action.costLevel}</span></div>
      </div>
    </article>
  );
}
