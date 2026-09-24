import { curatedActions } from "@/data/actions";
import { withBasePath } from "@/lib/paths";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AppData, BetweenAction, Capture, FuturePostcard, JourneyStamp, StageReflection, UserAction, UserActionStatus } from "@/types/product";

type RemoteUserAction = {
  id: string;
  action_id: string | null;
  custom_title: string | null;
  custom_description: string | null;
  custom_category: BetweenAction["category"] | null;
  custom_duration: string | null;
  status: UserActionStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type RemoteCapture = {
  id: string;
  user_action_id: string | null;
  capture_type: Capture["type"];
  content: string;
  capture_date: string;
  location: string | null;
  person_note: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

type RemoteImage = { capture_id: string; storage_path: string };
type RemotePostcard = { id: string; content: string; deliver_at: string; created_at: string };
type RemoteStamp = { id: string; label: string; stamped_at: string; user_action_id: string | null };
type RemoteReflection = { id: string; summary: string; recurring_themes: string[]; open_questions: string[]; created_at: string };

async function currentUser() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user ?? null;
}

export async function loadRemoteV2Data(): Promise<Partial<AppData> | null> {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return null;
  const [actionsResult, capturesResult, imagesResult, postcardsResult, stampsResult, reflectionsResult] = await Promise.all([
    client.from("user_actions").select("*").order("created_at", { ascending: false }),
    client.from("captures").select("*").order("capture_date", { ascending: false }),
    client.from("capture_images").select("capture_id,storage_path"),
    client.from("future_postcards").select("*").order("created_at", { ascending: false }),
    client.from("stamps").select("*").order("stamped_at", { ascending: false }),
    client.from("reflections").select("*").order("created_at", { ascending: false }).limit(1),
  ]);
  const error = actionsResult.error ?? capturesResult.error ?? imagesResult.error ?? postcardsResult.error ?? stampsResult.error ?? reflectionsResult.error;
  if (error) throw error;

  const actionRows = (actionsResult.data ?? []) as RemoteUserAction[];
  const imageRows = (imagesResult.data ?? []) as RemoteImage[];
  const imageMap = new Map<string, { path: string; url?: string }>();
  await Promise.all(imageRows.map(async (image) => {
    const signed = await client.storage.from("user-captures").createSignedUrl(image.storage_path, 3600);
    imageMap.set(image.capture_id, { path: image.storage_path, url: signed.data?.signedUrl });
  }));

  const userActions: UserAction[] = actionRows.map((row) => ({
    id: row.id,
    actionId: row.action_id ?? undefined,
    customAction: row.custom_title ? {
      id: "custom-" + row.id,
      title: row.custom_title,
      description: row.custom_description ?? "",
      category: row.custom_category ?? "做点东西",
      duration: row.custom_duration ?? "由我决定",
      difficulty: "需要一点准备",
      costLevel: "视情况而定",
      whatYouNeed: ["一点愿意开始的时间"],
      whatYouMightLeaveWith: "一段属于自己的经历",
      coverImage: withBasePath("/images/between/writing-desk.png"),
      sourceType: "user",
    } : undefined,
    status: row.status,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const captures: Capture[] = ((capturesResult.data ?? []) as RemoteCapture[]).map((row) => {
    const image = imageMap.get(row.id);
    return { id: row.id, type: row.capture_type, text: row.content, date: row.capture_date, location: row.location ?? undefined, person: row.person_note ?? undefined, tags: row.tags ?? [], actionId: row.user_action_id ?? undefined, imageUrl: image?.url, imageStoragePath: image?.path, isPrivate: true, createdAt: row.created_at, updatedAt: row.updated_at };
  });

  const futurePostcards: FuturePostcard[] = ((postcardsResult.data ?? []) as RemotePostcard[]).map((row) => ({ id: row.id, content: row.content, createdAt: row.created_at, deliverAt: row.deliver_at }));
  const journeyStamps: JourneyStamp[] = ((stampsResult.data ?? []) as RemoteStamp[]).map((row) => ({ id: row.id, label: row.label, date: row.stamped_at, actionId: row.user_action_id ?? undefined }));
  const reflectionRow = ((reflectionsResult.data ?? []) as RemoteReflection[])[0];
  const stageReflection: StageReflection | null = reflectionRow ? { id: reflectionRow.id, summary: reflectionRow.summary, recurringThemes: reflectionRow.recurring_themes ?? [], questions: reflectionRow.open_questions ?? [], generatedAt: reflectionRow.created_at } : null;
  return { userActions, captures, futurePostcards, journeyStamps, stageReflection };
}

export async function persistUserAction(item: UserAction) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  const action = item.customAction ?? curatedActions.find((entry) => entry.id === item.actionId);
  if (item.customAction) {
    const actionResult = await client.from("actions").upsert({ id: item.customAction.id, title: item.customAction.title, description: item.customAction.description, category: item.customAction.category, duration: item.customAction.duration, difficulty: item.customAction.difficulty, cost_level: item.customAction.costLevel, what_you_need: item.customAction.whatYouNeed, what_you_might_leave_with: item.customAction.whatYouMightLeaveWith, cover_image: item.customAction.coverImage, source_type: "user", created_by: user.id, is_published: false, updated_at: item.updatedAt });
    if (actionResult.error) throw actionResult.error;
  }
  const result = await client.from("user_actions").upsert({ id: item.id, user_id: user.id, action_id: item.customAction ? item.customAction.id : item.actionId, custom_title: item.customAction?.title ?? null, custom_description: item.customAction?.description ?? null, custom_category: item.customAction?.category ?? null, custom_duration: item.customAction?.duration ?? null, status: item.status, completed_at: item.completedAt ?? null, created_at: item.createdAt, updated_at: item.updatedAt });
  if (result.error) throw result.error;
  return action;
}

export async function removeRemoteUserAction(id: string, customActionId?: string) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  const result = await client.from("user_actions").delete().eq("id", id).eq("user_id", user.id);
  if (result.error) throw result.error;
  if (customActionId) {
    const actionResult = await client.from("actions").delete().eq("id", customActionId).eq("created_by", user.id);
    if (actionResult.error) throw actionResult.error;
  }
}

export async function persistCapture(capture: Capture) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  const result = await client.from("captures").upsert({ id: capture.id, user_id: user.id, user_action_id: capture.actionId ?? null, capture_type: capture.type, content: capture.text, capture_date: capture.date, location: capture.location ?? null, person_note: capture.person ?? null, tags: capture.tags, visibility: "private", created_at: capture.createdAt, updated_at: capture.updatedAt });
  if (result.error) throw result.error;
  if (capture.imageStoragePath) {
    const imageResult = await client.from("capture_images").upsert({ id: capture.id + "-image", user_id: user.id, capture_id: capture.id, storage_path: capture.imageStoragePath, updated_at: capture.updatedAt });
    if (imageResult.error) throw imageResult.error;
  }
}

export async function removeRemoteCapture(capture: Capture) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  if (capture.imageStoragePath) await client.storage.from("user-captures").remove([capture.imageStoragePath]);
  const result = await client.from("captures").delete().eq("id", capture.id).eq("user_id", user.id);
  if (result.error) throw result.error;
}

export async function uploadPrivateCaptureImage(file: File) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return null;
  const now = new Date();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = user.id + "/" + now.getFullYear() + "/" + String(now.getMonth() + 1).padStart(2, "0") + "/" + crypto.randomUUID() + "." + extension;
  const upload = await client.storage.from("user-captures").upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) throw upload.error;
  const signed = await client.storage.from("user-captures").createSignedUrl(path, 3600);
  if (signed.error) throw signed.error;
  return { path, url: signed.data.signedUrl };
}

export async function persistPostcard(postcard: FuturePostcard) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  const result = await client.from("future_postcards").upsert({ id: postcard.id, user_id: user.id, content: postcard.content, deliver_at: postcard.deliverAt, created_at: postcard.createdAt, updated_at: postcard.createdAt });
  if (result.error) throw result.error;
}

export async function persistStamp(stamp: JourneyStamp) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  const result = await client.from("stamps").upsert({ id: stamp.id, user_id: user.id, user_action_id: stamp.actionId ?? null, label: stamp.label, stamped_at: stamp.date, created_at: stamp.date, updated_at: stamp.date });
  if (result.error) throw result.error;
}

export async function persistReflection(reflection: StageReflection, captureIds: string[], actionIds: string[]) {
  const client = getSupabaseClient();
  const user = await currentUser();
  if (!client || !user) return;
  const result = await client.from("reflections").upsert({ id: reflection.id, user_id: user.id, summary: reflection.summary, recurring_themes: reflection.recurringThemes, open_questions: reflection.questions, source_capture_ids: captureIds, source_user_action_ids: actionIds, created_at: reflection.generatedAt, updated_at: reflection.generatedAt });
  if (result.error) throw result.error;
}
