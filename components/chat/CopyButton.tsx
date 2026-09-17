"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  /** The text placed on the clipboard when clicked. */
  value: string;
  /** Screen-reader label, e.g. "Copy code". */
  label?: string;
  className?: string;
};

/**
 * A small icon button that copies text and briefly shows a checkmark.
 *
 * The "copied" flag is local state: nothing outside this button cares about it,
 * so there is no reason to lift it any higher.
 */
export function CopyButton({
  value,
  label = "Copy",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Reset the checkmark two seconds after a copy, and clean the timer up if the
  // button unmounts first.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked (insecure origin, denied permission).
      // Failing silently is fine here — the user simply sees no checkmark.
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : label}
            className={cn("text-muted-foreground", className)}
          />
        }
      >
        {copied ? (
          <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <CopyIcon />
        )}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}
