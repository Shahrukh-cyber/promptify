import { SparklesIcon, UserIcon } from "lucide-react";

import { CopyButton } from "@/components/chat/CopyButton";
import { MessageContent } from "@/components/chat/MessageContent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTime } from "@/lib/chat-utils";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

/**
 * One chat bubble.
 *
 * This component is "presentational": it receives a message and renders it.
 * It holds no state and knows nothing about conversations — which is what makes
 * it safe to reuse anywhere a message needs displaying.
 */
export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group/message flex w-full gap-3 px-4 py-4 sm:px-6",
        isUser && "flex-row-reverse",
      )}
    >
      <Avatar
        className={cn(
          "mt-0.5 size-8 shrink-0 border",
          isUser ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        <AvatarFallback
          className={cn(
            "bg-transparent",
            isUser ? "text-muted-foreground" : "text-primary-foreground",
          )}
        >
          {isUser ? (
            <UserIcon className="size-4" />
          ) : (
            <SparklesIcon className="size-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex min-w-0 max-w-[min(42rem,85%)] flex-col gap-1",
          isUser && "items-end",
        )}
      >
        <div
          className={cn(
            "min-w-0 rounded-2xl px-4 py-2.5",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border bg-card text-card-foreground",
          )}
        >
          <MessageContent content={message.content} />
        </div>

        <div
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground",
            isUser && "flex-row-reverse",
          )}
        >
          {/* Timestamps are formatted in the viewer's locale, which can differ
              from the server's. suppressHydrationWarning keeps that harmless. */}
          <time
            dateTime={message.createdAt.toISOString()}
            suppressHydrationWarning
            className="px-1"
          >
            {formatTime(message.createdAt)}
          </time>
          <div className="opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100">
            <CopyButton value={message.content} label="Copy message" />
          </div>
        </div>
      </div>
    </div>
  );
}
