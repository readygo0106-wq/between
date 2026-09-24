export type ActionCategory = "去看看世界" | "做点东西" | "认识一些人" | "学点东西" | "试试一种工作" | "慢下来";

export type BetweenAction = {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  duration: string;
  difficulty: "很轻松" | "需要一点准备" | "认真做一次";
  costLevel: "免费" | "低成本" | "视情况而定";
  whatYouNeed: string[];
  whatYouMightLeaveWith: string;
  coverImage: string;
  sourceType: "curated" | "user" | "external";
  sourceUrl?: string;
  sourceName?: string;
};

export type UserActionStatus = "saved" | "doing" | "done";

export type UserAction = {
  id: string;
  actionId?: string;
  customAction?: BetweenAction;
  status: UserActionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type Capture = {
  id: string;
  type: "一张照片" | "一句话" | "一个地方" | "一个人" | "一件做过的事" | "慢慢写一点";
  text: string;
  date: string;
  location?: string;
  person?: string;
  tags: string[];
  actionId?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  isPrivate: true;
  createdAt: string;
  updatedAt: string;
};

export type FuturePostcard = {
  id: string;
  content: string;
  createdAt: string;
  deliverAt: string;
};

export type JourneyStamp = {
  id: string;
  label: string;
  date: string;
  actionId?: string;
};

export type StageReflection = {
  id: string;
  summary: string;
  recurringThemes: string[];
  questions: string[];
  generatedAt: string;
};

export type AppData = {
  userActions: UserAction[];
  captures: Capture[];
  futurePostcards: FuturePostcard[];
  journeyStamps: JourneyStamp[];
  stageReflection: StageReflection | null;
  resonantNotes: string[];
};
