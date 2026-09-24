import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type EmptyStateProps = { title: string; description: string; action?: { label: string; href: string } };

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-ink/20 px-6 py-12 text-center">
      <h3 className="font-display text-3xl tracking-[-0.04em]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md leading-7 text-muted">{description}</p>
      {action ? <Link className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-ivory" href={action.href}>{action.label}<ArrowUpRight size={16} /></Link> : null}
    </div>
  );
}
