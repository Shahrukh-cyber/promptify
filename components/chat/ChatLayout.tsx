"use client";

import { useState } from "react";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ErrorNotice } from "@/components/chat/ErrorNotice";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { MessageList } from "@/components/chat/MessageList";
import { Sidebar } from "@/components/chat/Sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { requestAssistantReply } from "@/lib/chat-api";
import { createId, deriveConversationTitle } from "@/lib/chat-utils";
import { createDummyConversations } from "@/lib/dummy-data";
import type { Conversation, Message } from "@/lib/types";

const NEW_CHAT_TITLE = "New chat";

/**
 * The one component that owns state. Everything below it is presentational.
 *
 * Why here? `Sidebar` needs to know which conversation is selected, and
 * `MessageList` needs the messages of that same conversation. When two siblings
 * need the same value, that value has to live in their closest shared parent —
 * React calls this "lifting state up". ChatLayout is that parent.
 *
 * Data flows DOWN as props. Events flow UP as callbacks (onSelect, onSend).
 * No child ever reaches sideways into another child.
 */
export function ChatLayout() {
  /**
   * All conversations. The initializer function runs only on the first render,
   * so the dummy data is built once rather than on every keystroke.
   */
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    createDummyConversations(),
  );

  /** Which conversation is open. `null` means "nothing selected yet". */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** The text currently in the composer. */
  const [input, setInput] = useState("");

  /** True while we wait for the model's reply. */
  const [isLoading, setIsLoading] = useState(false);

  /** Set when a request fails. Cleared on the next attempt. */
  const [error, setError] = useState<string | null>(null);

  /** Mobile only: whether the slide-over sidebar is showing. */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Derived from state, so it can never go stale. No extra useState needed.
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    null;
  const messages = selectedConversation?.messages ?? [];

  /** Adds a message to one conversation and bumps its sidebar timestamp. */
  function appendMessage(conversationId: string, message: Message) {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: message.createdAt,
              // The first user message names the conversation.
              title:
                conversation.title === NEW_CHAT_TITLE && message.role === "user"
                  ? deriveConversationTitle(message.content)
                  : conversation.title,
            }
          : conversation,
      ),
    );
  }

  function handleNewChat() {
    const conversation: Conversation = {
      id: createId("conv"),
      title: NEW_CHAT_TITLE,
      updatedAt: new Date(),
      messages: [],
    };

    // Functional update: React hands us the latest array, so we never build on
    // a stale copy of it.
    setConversations((previous) => [conversation, ...previous]);
    setSelectedId(conversation.id);
    setInput("");
    setError(null);
    setIsSidebarOpen(false);
  }

  function handleSelectConversation(id: string) {
    setSelectedId(id);
    setInput("");
    setError(null);
    setIsSidebarOpen(false);
  }

  function handleDeleteConversation(id: string) {
    setConversations((previous) =>
      previous.filter((conversation) => conversation.id !== id),
    );
    // If the open conversation was the one deleted, fall back to the empty state.
    setSelectedId((current) => (current === id ? null : current));
  }

  /**
   * Asks the model for a reply to `history` and appends it.
   *
   * `history` is passed in rather than read from state because state updates are
   * asynchronous: the user's message has only been *queued* at this point, so
   * reading `messages` here would give us the conversation without it.
   *
   * On failure nothing is appended — the user's message stays as the last turn,
   * which is exactly what Retry needs to send again.
   */
  async function sendToModel(conversationId: string, history: Message[]) {
    setError(null);
    setIsLoading(true);

    try {
      const reply = await requestAssistantReply(history);

      appendMessage(conversationId, {
        id: createId("msg"),
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      // `finally` guarantees the spinner stops even when the request throws.
      setIsLoading(false);
    }
  }

  /**
   * The whole send flow, in one readable sequence:
   *
   *   1. show the user's message immediately
   *   2. clear the composer and turn on the loading indicator
   *   3. await the model's reply
   *   4. show the reply, or an error, and turn the indicator off
   */
  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (trimmed === "" || isLoading) return;

    // Sending from the empty state creates the conversation on the fly.
    let conversationId = selectedId;
    let history: Message[] = messages;

    if (!conversationId) {
      conversationId = createId("conv");
      history = [];
      setConversations((previous) => [
        {
          id: conversationId as string,
          title: NEW_CHAT_TITLE,
          updatedAt: new Date(),
          messages: [],
        },
        ...previous,
      ]);
      setSelectedId(conversationId);
    }

    const userMessage: Message = {
      id: createId("msg"),
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };

    appendMessage(conversationId, userMessage);
    setInput("");

    // The endpoint is stateless, so the whole thread goes up every time.
    await sendToModel(conversationId, [...history, userMessage]);
  }

  /** Re-sends the last user message after a failed request. */
  function handleRetry() {
    if (!selectedConversation || isLoading) return;

    const history = selectedConversation.messages;
    if (history.at(-1)?.role !== "user") return;

    void sendToModel(selectedConversation.id, history);
  }

  const sidebar = (
    <Sidebar
      conversations={conversations}
      selectedId={selectedId}
      onSelect={handleSelectConversation}
      onDelete={handleDeleteConversation}
      onNewChat={handleNewChat}
    />
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      {/* Desktop sidebar: always present from the md breakpoint up. */}
      <aside className="hidden w-72 shrink-0 border-r md:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar: the same component inside a slide-over panel. */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 md:hidden">
          <SheetTitle className="sr-only">Conversations</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={selectedConversation?.title ?? "Promptify"}
          messageCount={messages.length}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="min-h-0 flex-1">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onSelectSuggestion={(suggestion) => handleSend(suggestion)}
          />
        </main>

        <div className="border-t bg-background/80 backdrop-blur-sm">
          {error && (
            <ErrorNotice
              message={error}
              onRetry={
                messages.at(-1)?.role === "user" ? handleRetry : undefined
              }
            />
          )}

          <MessageComposer
            value={input}
            onChange={setInput}
            onSend={() => handleSend(input)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
