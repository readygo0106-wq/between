"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Circle, Edit3, Plus, Trash2 } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { fieldClassName, Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { actionCategories, curatedActions } from "@/data/actions";
import type { ActionCategory, UserAction, UserActionStatus } from "@/types/product";

const tabs: Array<{ status: UserActionStatus; label: string }> = [
  { status: "saved", label: "想试试" },
  { status: "doing", label: "正在做" },
  { status: "done", label: "做过" },
];

const initialForm = { id: "", title: "", description: "", category: "做点东西" as ActionCategory, duration: "" };

export default function ListPage() {
  const { data, saveCustomAction, setActionStatus, deleteUserAction } = useApp();
  const [tab, setTab] = useState<UserActionStatus>("saved");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const items = data.userActions.filter((item) => item.status === tab);

  const resolveAction = (item: UserAction) => item.customAction ?? curatedActions.find((action) => action.id === item.actionId);
  const edit = (item: UserAction) => {
    const action = resolveAction(item);
    if (!action?.sourceType || action.sourceType !== "user") return;
    setForm({ id: item.id, title: action.title, description: action.description, category: action.category, duration: action.duration });
    setModalOpen(true);
  };
  const submit = () => {
    if (form.title.trim().length < 2) { setError("给这件事起一个名字吧。"); return; }
    saveCustomAction({ ...form, id: form.id || undefined });
    setModalOpen(false);
    setForm(initialForm);
    setError("");
  };

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-semibold tracking-[0.18em] text-postcard uppercase">我的清单</p><h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] tracking-[-0.06em]">想做的事，<br />都先放在这里。</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">它不是任务表。哪件事现在有一点想做，就从那件开始。</p></div><Button onClick={() => { setForm(initialForm); setModalOpen(true); }}><Plus size={17} /> 再加一件</Button></div>

      <div className="mt-12 flex gap-2 overflow-x-auto pb-2" role="tablist">
        {tabs.map((item) => <button aria-selected={tab === item.status} className={"shrink-0 rounded-full px-5 py-2.5 text-sm transition " + (tab === item.status ? "bg-ink text-ivory" : "border border-ink/15 text-muted hover:text-ink")} key={item.status} onClick={() => setTab(item.status)} role="tab" type="button">{item.label} <span className="ml-1 opacity-60">{data.userActions.filter((action) => action.status === item.status).length}</span></button>)}
      </div>

      <section className="mt-7 rounded-[2rem] border border-ink/10 bg-white/25 p-4 sm:p-7">
        {items.length ? <div className="divide-y divide-ink/10">{items.map((item) => {
          const action = resolveAction(item);
          if (!action) return null;
          return <article className="flex flex-col gap-5 py-6 first:pt-2 last:pb-2 sm:flex-row sm:items-center" key={item.id}><button aria-label={tab === "done" ? "移回想试试" : tab === "doing" ? "标记做过" : "开始这件事"} className={"grid size-11 shrink-0 place-items-center rounded-full border " + (tab === "done" ? "border-sage bg-sage text-ivory" : "border-ink/20")} onClick={() => setActionStatus(item.id, tab === "saved" ? "doing" : tab === "doing" ? "done" : "saved")} type="button">{tab === "done" ? <Check size={18} /> : <Circle size={18} />}</button><div className="min-w-0 flex-1"><p className="text-xs text-muted">{action.category} · {action.duration}</p><h2 className="mt-1 font-display text-3xl tracking-[-0.035em]">{action.title}</h2><p className="mt-2 line-clamp-2 leading-7 text-muted">{action.description}</p></div><div className="flex shrink-0 flex-wrap gap-2">{tab === "done" ? <Button asChild variant="secondary"><Link href="/capture">留下点什么 <ChevronRight size={15} /></Link></Button> : null}{action.sourceType === "user" ? <Button aria-label="编辑" onClick={() => edit(item)} variant="quiet"><Edit3 size={16} /></Button> : null}<Button aria-label="删除" onClick={() => { if (window.confirm("要把这件事从清单里移除吗？")) deleteUserAction(item.id); }} variant="quiet"><Trash2 size={16} /></Button></div></article>;
        })}</div> : <div className="py-16 text-center"><p className="font-display text-3xl">{tab === "saved" ? "还没有想试试的事。" : tab === "doing" ? "现在没有正在做的事。" : "做过的事，会慢慢出现在这里。"}</p><p className="mt-3 text-muted">{tab === "saved" ? "先去发现一件让你有点好奇的事。" : "不用为了填满清单而开始。"}</p><Button asChild className="mt-6" variant="secondary"><Link href="/discover">去随便看看</Link></Button></div>}
      </section>

      <Modal onClose={() => setModalOpen(false)} open={modalOpen} title={form.id ? "改一改这件事" : "给自己加一件事"}>
        <div className="grid gap-5"><label><span className="mb-2 block text-sm font-medium">想做什么？</span><Input onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="比如：做一本城市散步小册子" value={form.title} /></label><label><span className="mb-2 block text-sm font-medium">为什么现在想做</span><Textarea onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="不用写成目标，记下你现在的想法就好。" value={form.description} /></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-medium">属于哪一类</span><select className={fieldClassName} onChange={(event) => setForm({ ...form, category: event.target.value as ActionCategory })} value={form.category}>{actionCategories.map((item) => <option key={item.title}>{item.title}</option>)}</select></label><label><span className="mb-2 block text-sm font-medium">大概多久</span><Input onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="例如：一个下午" value={form.duration} /></label></div>{error ? <p className="text-sm text-postcard">{error}</p> : null}<div className="flex justify-end gap-3"><Button onClick={() => setModalOpen(false)} variant="quiet">取消</Button><Button onClick={submit}>{form.id ? "保存修改" : "加进清单"}</Button></div></div>
      </Modal>
    </main>
  );
}
