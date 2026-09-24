"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Check, ImagePlus, LoaderCircle, MapPin, PenLine, UserRound, X } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { fieldClassName, Input, Textarea } from "@/components/ui/field";
import { curatedActions } from "@/data/actions";
import { uploadPrivateCaptureImage } from "@/lib/data/supabaseRepository";
import type { Capture } from "@/types/product";

const captureTypes: Array<{ label: Capture["type"]; icon: typeof Camera }> = [
  { label: "一张照片", icon: Camera },
  { label: "一句话", icon: PenLine },
  { label: "一个地方", icon: MapPin },
  { label: "一个人", icon: UserRound },
  { label: "一件做过的事", icon: Check },
  { label: "慢慢写一点", icon: PenLine },
];

export default function CapturePage() {
  const router = useRouter();
  const { data, saveCapture } = useApp();
  const [type, setType] = useState<Capture["type"]>("一句话");
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [person, setPerson] = useState("");
  const [tags, setTags] = useState("");
  const [actionId, setActionId] = useState("");
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageState, setImageState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const linkedActions = data.userActions.map((item) => ({ id: item.id, action: item.customAction ?? curatedActions.find((action) => action.id === item.actionId) })).filter((item) => item.action);

  const chooseImage = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setImageState("error"); setError("请选择 JPG、PNG 或 WebP 图片。"); return; }
    if (file.size > 5 * 1024 * 1024) { setImageState("error"); setError("图片有点大，请选择不超过 5MB 的文件。"); return; }
    setImageState("loading");
    setImageFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = () => { setPreview(String(reader.result)); setImageState("ready"); };
    reader.onerror = () => { setImageState("error"); setError("这张照片刚才没读出来，请重新选择。"); };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!text.trim() && !preview) { setError("留下一句话或一张照片就好。"); return; }
    setSaving(true);
    setError("");
    try {
      const uploaded = imageFile ? await uploadPrivateCaptureImage(imageFile) : null;
      saveCapture({ type, text: text.trim() || "一张没有文字的照片", date, location: location.trim() || undefined, person: person.trim() || undefined, tags: tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean), actionId: actionId || undefined, imageUrl: uploaded?.url ?? (preview || undefined), imageStoragePath: uploaded?.path });
      router.push("/journey");
    } catch {
      setSaving(false);
      setError("这张照片刚才没传上去。你可以重新上传，文字还在这里。" );
    }
  };

  return (
    <main className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold tracking-[0.18em] text-postcard uppercase">留下</p>
      <h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] tracking-[-0.06em]">今天，想留下什么？</h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">不需要总结意义。先把这一刻好好留住。</p>

      <section className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {captureTypes.map((item) => { const Icon = item.icon; return <button aria-pressed={type === item.label} className={"flex min-h-24 flex-col items-start justify-between rounded-2xl border p-4 text-left transition " + (type === item.label ? "border-passport bg-passport text-ivory" : "border-ink/12 hover:bg-sand/45")} key={item.label} onClick={() => setType(item.label)} type="button"><Icon size={18} /><span className="text-sm">{item.label}</span></button>; })}
      </section>

      <section className="mt-8 rounded-[2rem] bg-sand/45 p-5 sm:p-8">
        <label className="block"><span className="mb-3 block text-sm font-medium">{type === "慢慢写一点" ? "慢慢写，不急着说清楚" : "想留下的话"}</span><Textarea className={type === "慢慢写一点" ? "min-h-64 bg-ivory" : "min-h-36 bg-ivory"} maxLength={3000} onChange={(event) => setText(event.target.value)} placeholder="今天发生了什么？当时有什么感觉？" value={text} /></label>

        <div className="mt-5">
          <span className="mb-3 block text-sm font-medium">照片（可选）</span>
          {preview ? <div className="relative aspect-[4/3] max-w-xl overflow-hidden rounded-2xl"><Image alt="准备保存的照片预览" className="object-cover" fill unoptimized src={preview} /><button aria-label="移除照片" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-ink/75 text-ivory" onClick={() => { setPreview(""); setImageFile(null); setImageState("idle"); }} type="button"><X size={17} /></button></div> : <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-ink/25 bg-ivory text-center transition hover:border-passport"><input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0])} type="file" /><span className="grid size-11 place-items-center rounded-full bg-sand"><ImagePlus size={19} /></span><span className="mt-3 text-sm font-medium">{imageState === "loading" ? "正在准备照片……" : "选择一张照片"}</span><span className="mt-1 text-xs text-muted">JPG、PNG 或 WebP，最多 5MB</span></label>}
          {imageState === "loading" ? <p className="mt-2 flex items-center gap-2 text-xs text-muted"><LoaderCircle className="animate-spin" size={13} /> 正在读取照片</p> : null}
          {imageState === "ready" ? <p className="mt-2 flex items-center gap-2 text-xs text-sage"><Check size={13} /> 照片已经准备好</p> : null}
          <p className="mt-2 text-xs leading-5 text-muted">访客模式下，照片仅保存在当前浏览器；连接账户后会进入你的私有图片空间。</p>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-medium">日期</span><Input onChange={(event) => setDate(event.target.value)} type="date" value={date} /></label><label><span className="mb-2 block text-sm font-medium">地点（由你主动填写）</span><Input onChange={(event) => setLocation(event.target.value)} placeholder="例如：青岛 · 小鱼山" value={location} /></label><label><span className="mb-2 block text-sm font-medium">和谁有关（可选）</span><Input onChange={(event) => setPerson(event.target.value)} placeholder="名字或一个称呼" value={person} /></label><label><span className="mb-2 block text-sm font-medium">标签（用逗号隔开）</span><Input onChange={(event) => setTags(event.target.value)} placeholder="散步，城市，摄影" value={tags} /></label></div>
        <label className="mt-5 block"><span className="mb-2 block text-sm font-medium">关联清单里的事情（可选）</span><select className={fieldClassName} onChange={(event) => setActionId(event.target.value)} value={actionId}><option value="">不关联</option>{linkedActions.map((item) => <option key={item.id} value={item.id}>{item.action?.title}</option>)}</select></label>
        {error ? <p className="mt-5 rounded-xl bg-postcard/10 px-4 py-3 text-sm text-postcard" role="alert">{error}</p> : null}
        <div className="mt-7 flex justify-end"><Button disabled={imageState === "loading" || saving} onClick={submit}>{saving ? <><LoaderCircle className="animate-spin" size={16} /> 正在留下来……</> : <>留下来 <Check size={16} /></>}</Button></div>
      </section>
    </main>
  );
}
