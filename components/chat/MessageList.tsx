"use client";

import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/chat/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  onSelectSuggestion: (suggestion: string) => void;
};

/**
 * The scrollable transcript.
 *
 * It owns exactly one piece of "state": a ref to an invisible element at the
 * very bottom of the list. After every render that adds a message, an effect
 * scrolls that element into view, so the newest bubble is always visible.
 */
export function MessageList({
  messages,
  isLoading,
  onSelectSuggestion,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    // Re-run whenever a message arrives or the typing indicator toggles.
  }, [messages.length, isLoading]);

  if (messages.length === 0) {
    return <EmptyState onSelectSuggestion={onSelectSuggestion} />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto w-full max-w-3xl py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Scroll anchor — never visible, just a target for scrollIntoView. */}
        <div ref={bottomRef} className="h-px" />
      </div>
    </ScrollArea>
  );
}
