/**
 * Pure helper functions — no React, no state, no side effects.
 *
 * Keeping these out of the components means they are easy to read in isolation
 * and easy to test later.
 */

import type {
  Conversation,
  ConversationGroup,
  ConversationGroupLabel,
} from "@/lib/types";

/** Midnight of the day `date` falls on, in the viewer's local time. */
function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** How many whole days ago `date` was, counting from local midnight. */
function daysAgo(date: Date, now: Date): number {
  const diff = startOfDay(now).getTime() - startOfDay(date).getTime();
  return Math.round(diff / (24 * 60 * 60 * 1000));
}

function labelFor(date: Date, now: Date): ConversationGroupLabel {
  const days = daysAgo(date, now);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return "Previous 7 days";
  return "Older";
}

const GROUP_ORDER: ConversationGroupLabel[] = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Older",
];

/**
 * Buckets conversations into the sidebar's date sections, newest first, and
 * drops any section that ended up empty.
 */
export function groupConversationsByDate(
  conversations: Conversation[],
  now: Date = new Date(),
): ConversationGroup[] {
  const buckets = new Map<ConversationGroupLabel, Conversation[]>();

  const sorted = [...conversations].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  for (const conversation of sorted) {
    const label = labelFor(conversation.updatedAt, now);
    const bucket = buckets.get(label);
    if (bucket) {
      bucket.push(conversation);
    } else {
      buckets.set(label, [conversation]);
    }
  }

  return GROUP_ORDER.filter((label) => buckets.has(label)).map((label) => ({
    label,
    conversations: buckets.get(label) ?? [],
  }));
}

/** e.g. "2:45 PM" — shown under each message bubble. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * A chunk of message content: either prose or a fenced code block.
 *
 * Rather than pulling in a full markdown library, we split on ``` fences —
 * which is all the dummy data needs.
 */
export type ContentPart =
  | { type: "text"; value: string }
  | { type: "code"; value: string; language: string };

export function parseMessageContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const fence = /```(\w*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      language: match[1] || "code",
      value: match[2].replace(/\n$/, ""),
    });
    lastIndex = fence.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts.filter((part) => part.type === "code" || part.value.trim() !== "");
}

/** Creates a unique id for a new message or conversation. */
export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
