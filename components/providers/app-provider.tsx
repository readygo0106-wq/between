"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { curatedActions } from "@/data/actions";
import { loadRemoteV2Data, persistCapture, persistPostcard, persistReflection, persistStamp, persistUserAction, removeRemoteCapture, removeRemoteUserAction } from "@/lib/data/supabaseRepository";
import { withBasePath } from "@/lib/paths";
import { emptyAppData, storageService } from "@/lib/storage/storageService";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AppData, BetweenAction, Capture, FuturePostcard, StageReflection, UserAction, UserActionStatus } from "@/types/product";

type CaptureInput = Omit<Capture, "id" | "createdAt" | "updatedAt" | "isPrivate"> & { id?: string };
type CustomActionInput = Pick<BetweenAction, "title" | "description" | "category" | "duration"> & { id?: string };

type AppContextValue = {
  data: AppData;
  ready: boolean;
  toast: string | null;
  notify: (message: string) => void;
  toggleResonantNote: (note: string) => void;
  saveAction: (actionId: string, status?: UserActionStatus) => string;
  saveCustomAction: (input: CustomActionInput) => string;
  setActionStatus: (id: string, status: UserActionStatus) => void;
  deleteUserAction: (id: string) => void;
  saveCapture: (input: CaptureInput) => Capture;
  deleteCapture: (id: string) => void;
  savePostcard: (content: string, deliverAt: string) => FuturePostcard;
  generateStageReflection: () => StageReflection | null;
  loadV2Demo: () => void;
  resetData: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);
const makeId = (prefix: string) => prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

export function AppProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [data, setData] = useState<AppData>(emptyAppData);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const syncRemote = (operation: Promise<unknown>) => { void operation.catch(() => notify("本机已经保存，但云端刚才没有同步成功。")); };

  useEffect(() => {
    const client = getSupabaseClient();
    const timer = window.setTimeout(() => {
      setData(storageService.load());
      setReady(true);
      void loadRemoteV2Data().then((remote) => { if (remote) setData((current) => ({ ...current, ...remote })); }).catch(() => notify("云端内容刚才没有载入，先显示这台设备里的内容。"));
    }, 0);
    const authListener = client?.auth.onAuthStateChange((_event, session) => {
      if (!session) return;
      void loadRemoteV2Data().then((remote) => { if (remote) setData((current) => ({ ...current, ...remote })); }).catch(() => notify("云端内容刚才没有载入，先显示这台设备里的内容。"));
    });
    return () => { window.clearTimeout(timer); authListener?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!storageService.save(data)) window.setTimeout(() => notify("这次没有保存下来。请检查浏览器存储设置。"), 0);
  }, [data, ready]);

  const toggleResonantNote = (note: string) => {
    setData((current) => ({
      ...current,
      resonantNotes: current.resonantNotes.includes(note) ? current.resonantNotes.filter((item) => item !== note) : [...current.resonantNotes, note],
    }));
  };

  const saveAction = (actionId: string, status: UserActionStatus = "saved") => {
    const existing = data.userActions.find((item) => item.actionId === actionId);
    const now = new Date().toISOString();
    const item: UserAction = existing ? { ...existing, status, updatedAt: now } : { id: makeId("user-action"), actionId, status, createdAt: now, updatedAt: now };
    setData((current) => ({ ...current, userActions: existing ? current.userActions.map((entry) => entry.id === item.id ? item : entry) : [item, ...current.userActions] }));
    syncRemote(persistUserAction(item));
    notify(status === "doing" ? "开始吧，不用一次做完。" : "已经放进你的清单。");
    return item.id;
  };

  const saveCustomAction = (input: CustomActionInput) => {
    const now = new Date().toISOString();
    const existing = data.userActions.find((item) => item.id === input.id);
    const id = existing?.id ?? makeId("user-action");
    const customAction: BetweenAction = {
      id: existing?.customAction?.id ?? makeId("custom-action"),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      duration: input.duration.trim() || "由我决定",
      difficulty: "需要一点准备",
      costLevel: "视情况而定",
      whatYouNeed: ["一点愿意开始的时间"],
      whatYouMightLeaveWith: "一段属于自己的经历",
      coverImage: withBasePath("/images/between/writing-desk.png"),
      sourceType: "user",
    };
    const item: UserAction = { id, customAction, status: existing?.status ?? "saved", createdAt: existing?.createdAt ?? now, updatedAt: now };
    setData((current) => ({ ...current, userActions: existing ? current.userActions.map((entry) => entry.id === id ? item : entry) : [item, ...current.userActions] }));
    syncRemote(persistUserAction(item));
    notify(existing ? "这件事已经改好了。" : "已经加进你的清单。");
    return id;
  };

  const setActionStatus = (id: string, status: UserActionStatus) => {
    const now = new Date().toISOString();
    const existing = data.userActions.find((item) => item.id === id);
    if (existing) syncRemote(persistUserAction({ ...existing, status, updatedAt: now, completedAt: status === "done" ? now : existing.completedAt }));
    const existingAction = existing?.customAction ?? curatedActions.find((item) => item.id === existing?.actionId);
    const hasStamp = data.journeyStamps.some((stamp) => stamp.actionId === id);
    const newStamp = status === "done" && existingAction && !hasStamp ? { id: makeId("stamp"), label: existingAction.category === "做点东西" ? "MADE SOMETHING" : "TRIED SOMETHING NEW", date: now, actionId: id } : null;
    if (newStamp) syncRemote(persistStamp(newStamp));
    setData((current) => {
      const userActions = current.userActions.map((item) => item.id === id ? { ...item, status, updatedAt: now, completedAt: status === "done" ? now : item.completedAt } : item);
      const completed = userActions.find((item) => item.id === id);
      const action = completed?.customAction ?? curatedActions.find((item) => item.id === completed?.actionId);
      const alreadyStamped = current.journeyStamps.some((stamp) => stamp.actionId === id);
      const journeyStamps = status === "done" && action && !alreadyStamped
        ? [newStamp!, ...current.journeyStamps]
        : current.journeyStamps;
      return { ...current, userActions, journeyStamps };
    });
    notify(status === "done" ? "做过了。这段经历会留在旅程里。" : status === "doing" ? "开始吧，不用一次做完。" : "先放在想试试里。");
  };

  const deleteUserAction = (id: string) => {
    const existing = data.userActions.find((item) => item.id === id);
    setData((current) => ({ ...current, userActions: current.userActions.filter((item) => item.id !== id), journeyStamps: current.journeyStamps.filter((stamp) => stamp.actionId !== id) }));
    notify("已经从清单里移除。");
    syncRemote(removeRemoteUserAction(id, existing?.customAction?.id));
  };

  const saveCapture = (input: CaptureInput) => {
    const now = new Date().toISOString();
    const existing = data.captures.find((item) => item.id === input.id);
    const entry: Capture = { ...input, id: input.id ?? makeId("capture"), isPrivate: true, createdAt: existing?.createdAt ?? now, updatedAt: now };
    setData((current) => ({ ...current, captures: existing ? current.captures.map((item) => item.id === entry.id ? entry : item) : [entry, ...current.captures] }));
    syncRemote(persistCapture(entry));
    notify("留下来了。");
    return entry;
  };

  const deleteCapture = (id: string) => {
    const existing = data.captures.find((item) => item.id === id);
    setData((current) => ({ ...current, captures: current.captures.filter((item) => item.id !== id) }));
    if (existing) syncRemote(removeRemoteCapture(existing));
    notify("这条记录已经删除。");
  };

  const savePostcard = (content: string, deliverAt: string) => {
    const postcard = { id: makeId("postcard"), content: content.trim(), createdAt: new Date().toISOString(), deliverAt };
    setData((current) => ({ ...current, futurePostcards: [postcard, ...current.futurePostcards] }));
    syncRemote(persistPostcard(postcard));
    notify("这张明信片会在约定的日子回来。");
    return postcard;
  };

  const generateStageReflection = () => {
    const done = data.userActions.filter((item) => item.status === "done");
    if (data.captures.length < 5 && done.length < 3) return null;
    const categories = done.map((item) => item.customAction?.category ?? curatedActions.find((action) => action.id === item.actionId)?.category).filter((item): item is NonNullable<typeof item> => Boolean(item));
    const tags = data.captures.flatMap((capture) => capture.tags);
    const recurringThemes = [...new Set([...categories, ...tags])].slice(0, 4);
    const reflection: StageReflection = {
      id: makeId("reflection"),
      summary: "最近你做完了 " + done.length + " 件事，也留下了 " + data.captures.length + " 段记录。比起急着给这段时间下结论，也许更值得看看：哪些事让你愿意继续，哪些只是试过就够了。",
      recurringThemes,
      questions: ["哪一次经历让你回家后还在想？", "有什么事你原本期待，做过以后却没那么喜欢？", "下一次，你想把时间多留给什么？"],
      generatedAt: new Date().toISOString(),
    };
    setData((current) => ({ ...current, stageReflection: reflection }));
    syncRemote(persistReflection(reflection, data.captures.map((item) => item.id), done.map((item) => item.id)));
    notify("最近的这段路，已经整理好了。");
    return reflection;
  };

  const loadV2Demo = () => {
    const now = new Date();
    const aWeekAgo = new Date(now);
    aWeekAgo.setDate(now.getDate() - 7);
    const action = curatedActions[0];
    setData({
      ...emptyAppData,
      userActions: [{ id: "demo-action", actionId: action.id, status: "done", createdAt: aWeekAgo.toISOString(), updatedAt: now.toISOString(), completedAt: now.toISOString() }],
      captures: [{ id: "demo-capture", type: "一件做过的事", text: "今天经过一个小展览，我发现自己一直在看人们在哪里停下来。", date: now.toISOString().slice(0, 10), location: "城市里的一间展览空间", tags: ["空间", "观察"], actionId: "demo-action", imageUrl: withBasePath("/images/between/travel-desk.png"), isPrivate: true, createdAt: now.toISOString(), updatedAt: now.toISOString() }],
      journeyStamps: [{ id: "demo-stamp", label: "MADE SOMETHING", date: now.toISOString(), actionId: "demo-action" }],
    });
    notify("演示内容已经放进来，并且会明确标注。");
  };

  const resetData = () => {
    storageService.reset();
    setData(emptyAppData);
    notify("当前浏览器里的访客内容已经清空。");
  };

  const value: AppContextValue = { data, ready, toast, notify, toggleResonantNote, saveAction, saveCustomAction, setActionStatus, deleteUserAction, saveCapture, deleteCapture, savePostcard, generateStageReflection, loadV2Demo, resetData };

  return <AppContext.Provider value={value}>{children}<div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-80 flex justify-center px-4 md:bottom-8">{toast ? <div className="rounded-full bg-ink px-5 py-3 text-sm text-ivory shadow-[var(--soft-shadow)]">{toast}</div> : null}</div></AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
