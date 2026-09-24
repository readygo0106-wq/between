import type { AppData } from "@/types/product";

const STORAGE_KEY = "between.v2.data.v1";

export const emptyAppData: AppData = {
  userActions: [],
  captures: [],
  futurePostcards: [],
  journeyStamps: [],
  stageReflection: null,
  resonantNotes: [],
};

function isBrowser() {
  return typeof window !== "undefined";
}

export const storageService = {
  load(): AppData {
    if (!isBrowser()) return emptyAppData;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyAppData;
      return { ...emptyAppData, ...(JSON.parse(raw) as Partial<AppData>) };
    } catch {
      return emptyAppData;
    }
  },

  save(data: AppData) {
    if (!isBrowser()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },

  reset() {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
