/**
 * Shared types for the whole chat app.
 *
 * These live in one place so that every component agrees on the shape of a
 * message. When Phase 2 swaps the dummy responses for a real Gemini call,
 * these types should not need to change.
 */

/** Who produced a message. */
export type Role = "user" | "assistant";

/** A single chat bubble. */
export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
};

/** A thread of messages, shown as one row in the sidebar. */
export type Conversation = {
  id: string;
  title: string;
  /** Used to bucket the sidebar into Today / Yesterday / Previous 7 days. */
  updatedAt: Date;
  messages: Message[];
};

/** The sidebar buckets, in display order. */
export type ConversationGroupLabel =
  | "Today"
  | "Yesterday"
  | "Previous 7 days"
  | "Older";

export type ConversationGroup = {
  label: ConversationGroupLabel;
  conversations: Conversation[];
};
