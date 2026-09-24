import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const fieldClassName = "w-full rounded-2xl border border-ink/18 bg-white/45 px-4 py-3.5 text-base text-ink outline-none placeholder:text-muted/65 focus:border-sage focus:ring-3 focus:ring-sage/15";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClassName, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldClassName, "min-h-36 resize-y leading-7", props.className)} />;
}
