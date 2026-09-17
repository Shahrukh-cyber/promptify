"use client";

import { MessageSquareIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupConversationsByDate } from "@/lib/chat-utils";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

type ConversationListProps = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

/**
 * The date-grouped list of conversations in the sidebar.
 *
 * It receives the full array and derives the Today / Yesterday / Previous 7 days
 * grouping on every render. That derived value is NOT state — it is computed
 * from state, so storing it separately could only ever let it drift out of date.
 */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const groups = groupConversationsByDate(conversations);

  if (conversations.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="px-3 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            {group.label}
          </h3>

          <ul className="flex flex-col gap-0.5">
            {group.conversations.map((conversation) => {
              const isSelected = conversation.id === selectedId;

              return (
                <li key={conversation.id} className="group/item relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={isSelected ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg py-2 pr-9 pl-3 text-left text-sm transition-colors outline-none",
                      "focus-visible:ring-3 focus-visible:ring-ring/50",
                      isSelected
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <MessageSquareIcon className="size-4 shrink-0 opacity-70" />
                    <span className="truncate">{conversation.title}</span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Options for ${conversation.title}`}
                          className={cn(
                            "absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity",
                            "group-hover/item:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100",
                          )}
                        />
                      }
                    >
                      <span aria-hidden className="text-base leading-none">
                        ⋯
                      </span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDelete(conversation.id)}
                        className="text-destructive"
                      >
                        <Trash2Icon />
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
