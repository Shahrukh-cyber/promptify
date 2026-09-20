"use client";

import { SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Conversation starters offered on a brand-new chat. */
const SUGGESTIONS = [
  "Explain React hooks in plain language",
  "What is TypeScript, and why use it?",
  "How does routing work in Next.js?",
  "Show me a closure with a real use case",
];

type EmptyStateProps = {
  /** Fills the composer (and sends) with the clicked suggestion. */
  onSelectSuggestion: (suggestion: string) => void;
};

/** Shown in place of the message list when a conversation has no messages. */
export function EmptyState({ onSelectSuggestion }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
        <SparklesIcon className="size-5" />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">
        How can I help today?
      </h2>
      <p className="mt-2 max-w-md text-sm text-balance text-muted-foreground">
        Promptify is running on local sample data for now, so replies are
        canned — the chat itself works exactly as it will once a model is
        connected.
      </p>

      <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            onClick={() => onSelectSuggestion(suggestion)}
            className="h-auto justify-start rounded-xl px-4 py-3 text-left text-sm font-normal whitespace-normal hover:bg-muted"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
