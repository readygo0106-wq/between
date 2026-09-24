"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="modal-title" aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-ivory p-6 shadow-[var(--soft-shadow)] sm:rounded-[2rem] sm:p-8" role="dialog">
        <header className="mb-6 flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl tracking-[-0.04em]" id="modal-title">{title}</h2>
          <button aria-label="关闭" className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/15 transition hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2" onClick={onClose} type="button"><X size={18} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}
