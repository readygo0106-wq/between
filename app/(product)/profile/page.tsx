"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { CircleUserRound, Database, LogOut, Mail, RotateCcw, ShieldCheck } from "lucide-react";

import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { withBasePath } from "@/lib/paths";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "reset";

export default function ProfilePage() {
  const router = useRouter();
  const { data, loadV2Demo, resetData } = useApp();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
    client.auth.getSession().then(({ data: sessionData }) => setUser(sessionData.session?.user ?? null));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    const client = getSupabaseClient();
    if (!client) { setMessage("现在还是访客模式。连接 Supabase 后就能使用账户。"); return; }
    if (!email.includes("@")) { setMessage("请填写一个可以收邮件的地址。"); return; }
    if (mode !== "reset" && password.length < 6) { setMessage("密码至少需要 6 个字符。"); return; }
    setLoading(true);
    setMessage("");
    const redirectTo = window.location.origin + withBasePath("/profile/");
    const result = mode === "signup"
      ? await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
      : mode === "reset"
        ? await client.auth.resetPasswordForEmail(email, { redirectTo })
        : await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) { setMessage(result.error.message === "Invalid login credentials" ? "邮箱或密码不对，再检查一下。" : "刚才没有成功：" + result.error.message); return; }
    setMessage(mode === "signup" ? "注册邮件已经发出，请去邮箱确认。" : mode === "reset" ? "重置密码的邮件已经发出。" : "已经登录。");
    if (mode === "login") { router.push("/today"); router.refresh(); }
  };

  const logout = async () => {
    const client = getSupabaseClient();
    await client?.auth.signOut();
    setMessage("已经退出账户。");
  };

  return (
    <main className="mx-auto max-w-5xl">
      <p className="text-xs font-semibold tracking-[0.18em] text-postcard uppercase">账户与设置</p>
      <h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] tracking-[-0.06em]">这是你的地方。</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">你的记录、照片和旅程默认只属于你。不会自动公开，也不会变成一张公共个人主页。</p>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-passport p-7 text-ivory sm:p-10">
          <div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-full bg-ivory/10"><CircleUserRound size={22} /></span><div><p className="text-xs text-ivory/55">{user ? "已登录" : configured ? "登录 BETWEEN" : "访客模式"}</p><p className="mt-1 font-medium">{user?.email ?? (configured ? "让这段旅程跟着你" : "内容仅保存在当前浏览器")}</p></div></div>
          {user ? <div className="mt-8"><p className="leading-7 text-ivory/70">账户已经连接。数据库与私有图片空间将由 Supabase 的 RLS 保护。</p><Button className="mt-6 border-ivory/30 text-ivory hover:bg-ivory/10" onClick={logout} variant="secondary"><LogOut size={16} /> 退出登录</Button></div> : configured ? <div className="mt-8"><div className="flex gap-2">{(["login", "signup"] as Mode[]).map((item) => <button className={"rounded-full px-4 py-2 text-sm " + (mode === item ? "bg-ivory text-ink" : "text-ivory/65")} key={item} onClick={() => setMode(item)} type="button">{item === "login" ? "登录" : "注册"}</button>)}</div><div className="mt-5 grid gap-4"><label><span className="mb-2 block text-xs text-ivory/60">邮箱</span><Input className="border-ivory/20 bg-ivory text-ink" onChange={(event) => setEmail(event.target.value)} type="email" value={email} /></label>{mode !== "reset" ? <label><span className="mb-2 block text-xs text-ivory/60">密码</span><Input className="border-ivory/20 bg-ivory text-ink" onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></label> : null}<Button className="bg-ivory text-ink hover:bg-sky" disabled={loading} onClick={submit}>{loading ? "请稍等……" : mode === "login" ? "登录" : mode === "signup" ? "创建账户" : "发送重置邮件"}</Button><button className="text-left text-xs text-ivory/60 underline underline-offset-4" onClick={() => setMode(mode === "reset" ? "login" : "reset")} type="button">{mode === "reset" ? "回到登录" : "忘记密码"}</button></div></div> : <div className="mt-8 rounded-2xl border border-ivory/15 bg-ivory/7 p-5"><p className="leading-7 text-ivory/75">当前没有配置 Supabase 凭证，所以真实注册和跨设备同步暂时关闭。其余核心功能仍然可以使用。</p><p className="mt-3 text-xs leading-6 text-ivory/50">需要配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。</p></div>}
          {message ? <p className="mt-5 rounded-xl bg-ivory/10 px-4 py-3 text-sm" role="status">{message}</p> : null}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.7rem] border border-ink/10 p-6"><ShieldCheck size={21} /><h2 className="mt-6 font-display text-3xl">默认私密</h2><p className="mt-3 leading-7 text-muted">记录、照片和个人旅程不会自动公开。数据库策略要求用户只能读取自己的内容。</p></div>
          <div className="rounded-[1.7rem] border border-ink/10 p-6"><Database size={21} /><h2 className="mt-6 font-display text-3xl">当前内容</h2><p className="mt-3 leading-7 text-muted">{data.userActions.length} 件清单 · {data.captures.length} 段记录 · {data.futurePostcards.length} 张未来明信片</p></div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-sand/45 p-6"><Mail size={19} /><h2 className="mt-5 font-display text-2xl">看看演示内容</h2><p className="mt-2 text-sm leading-6 text-muted">会明确标注为“演示内容”，不会假装是真实用户经历。</p><Button className="mt-5" onClick={() => { if (window.confirm("加载演示内容会替换当前浏览器中的访客内容，继续吗？")) loadV2Demo(); }} variant="secondary">加载演示内容</Button></div>
        <div className="rounded-2xl border border-postcard/20 p-6"><RotateCcw size={19} /><h2 className="mt-5 font-display text-2xl">清空访客内容</h2><p className="mt-2 text-sm leading-6 text-muted">只会清空当前浏览器里的数据，删除后无法恢复。</p><Button className="mt-5 text-postcard" onClick={() => { if (window.confirm("确定清空当前浏览器里的访客内容吗？")) resetData(); }} variant="quiet">清空当前内容</Button></div>
      </section>
    </main>
  );
}
