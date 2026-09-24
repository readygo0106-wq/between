import type { ReactNode } from "react";

import { curatedActions } from "@/data/actions";

export const dynamicParams = false;

export function generateStaticParams() {
  return curatedActions.map((action) => ({ id: action.id }));
}

export default function ActionDetailLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
