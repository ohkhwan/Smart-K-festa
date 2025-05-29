"use client";

import { Loader2 } from "lucide-react";
import type { LucideProps } from "lucide-react";

export function AnimatedSpinner({ className, ...props }: LucideProps) {
  return <Loader2 className={cn("animate-spin", className)} {...props} />;
}

// cn utility (normally from @/lib/utils)
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
