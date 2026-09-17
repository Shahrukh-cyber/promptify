import { ChatLayout } from "@/components/chat/ChatLayout";

/**
 * The single route of the app.
 *
 * This stays a Server Component — it renders no state of its own. All of the
 * interactivity lives inside <ChatLayout />, which opts into the browser with
 * "use client" at the top of its file.
 */
export default function Home() {
  return <ChatLayout />;
}
