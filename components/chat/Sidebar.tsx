"use client";

import { PlusIcon, SparklesIcon } from "lucide-react";

import { ConversationList } from "@/components/chat/ConversationList";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Conversation } from "@/lib/types";

type SidebarProps = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
};

/**
 * Branding, the New chat button, and the conversation history.
 *
 * The same component is rendered twice by ChatLayout: once as a fixed column on
 * desktop, once inside a slide-over Sheet on mobile. Because it takes all of its
 * data through props, neither copy needs to know which one it is.
 */
export function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <SparklesIcon className="size-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">
          Promptify
        </span>
      </div>

      <div className="px-3 pb-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="h-9 w-full justify-start gap-2 rounded-xl"
        >
          <PlusIcon />
          New chat
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="min-h-0 flex-1 px-2 pt-3">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
    </div>
  );
}
