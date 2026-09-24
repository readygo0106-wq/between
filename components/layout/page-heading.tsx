import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="mb-10 flex flex-col gap-6 border-b border-ink/12 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold tracking-[0.17em] text-muted uppercase">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.96] tracking-[-0.055em]">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
