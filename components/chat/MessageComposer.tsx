"use client";

import { useRef } from "react";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageComposerProps = {
  /** The current text. Owned by ChatLayout, not by this component. */
  value: string;
  onChange: (value: string) => void;
  /** Called when the user presses Enter or clicks Send. */
  onSend: () => void;
  isLoading: boolean;
};

/**
 * The input box at the bottom of the chat.
 *
 * This is a **controlled component**: it never stores the text itself. The text
 * lives in ChatLayout's state and arrives here as `value`; every keystroke calls
 * `onChange` so the parent can update it. That's why clearing the input after
 * sending is as simple as the parent setting its state back to "".
 */
export function MessageComposer({
  value,
  onChange,
  onSend,
  isLoading,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Send is blocked while empty, while whitespace-only, and while waiting.
  const canSend = value.trim().length > 0 && !isLoading;

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter falls through to the textarea's default
    // behaviour, which inserts a newline.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (canSend) onSend();
    textareaRef.current?.focus();
  }

  // The bordered, blurred bar around this form is provided by ChatLayout, so
  // that an error notice can sit inside it, directly above the input.
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl px-4 pt-3 pb-4 sm:px-6"
    >
      <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          placeholder="Message Promptify…"
          aria-label="Message"
          className="max-h-48 min-h-9 resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:border-0 focus-visible:ring-0 disabled:bg-transparent dark:bg-transparent"
        />

        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={isLoading ? "Waiting for reply" : "Send message"}
          className="size-9 shrink-0 rounded-xl"
        >
          {isLoading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ArrowUpIcon />
          )}
        </Button>
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
        <kbd className="font-sans font-medium">Shift + Enter</kbd> for a new
        line
      </p>
    </form>
  );
}
