import { SparklesIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** The three bouncing dots shown while the (fake) assistant is "thinking". */
export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 px-4 py-4 sm:px-6" aria-live="polite">
      <Avatar className="mt-0.5 size-8 shrink-0 border bg-primary text-primary-foreground">
        <AvatarFallback className="bg-transparent text-primary-foreground">
          <SparklesIcon className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-4 py-4">
        <span className="sr-only">Promptify is thinking</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
