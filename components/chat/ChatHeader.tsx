"use client";

import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatHeaderProps = {
  title: string;
  messageCount: number;
  /** Opens the mobile sidebar. Hidden on desktop, where the sidebar is fixed. */
  onOpenSidebar: () => void;
};

/** The bar above the transcript: mobile menu button plus conversation title. */
export function ChatHeader({
  title,
  messageCount,
  onOpenSidebar,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-sm sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSidebar}
        aria-label="Open conversations"
        className="md:hidden"
      >
        <MenuIcon />
      </Button>

      <div className="min-w-0">
        <h1 className="truncate text-sm font-medium">{title}</h1>
        <p className="text-xs text-muted-foreground">
          {messageCount === 0
            ? "New conversation"
            : `${messageCount} message${messageCount === 1 ? "" : "s"}`}
        </p>
      </div>
    </header>
  );
}
