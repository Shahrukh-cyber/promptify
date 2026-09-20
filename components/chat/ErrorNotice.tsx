"use client";

import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorNoticeProps = {
  message: string;
  /** Re-sends the last user message. Hidden when there is nothing to retry. */
  onRetry?: () => void;
};

/**
 * Shown above the composer when a request fails.
 *
 * The failed turn is not added to the transcript — the user's message stays in
 * place and can simply be sent again.
 */
export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-3xl items-start gap-3 px-4 pt-3 sm:px-6"
    >
      <div className="flex w-full items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className="min-w-0 flex-1 text-destructive">{message}</p>

        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="shrink-0 text-destructive hover:bg-destructive/15"
          >
            <RotateCwIcon />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
