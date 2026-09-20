/**
 * POST /api/chat
 *
 * The browser posts the conversation here; this handler validates it and hands
 * it to the chat service, which talks to the model server. Keeping the HTTP
 * plumbing here and the model logic in the service means either can change
 * without disturbing the other.
 */

import type { NextRequest } from "next/server";

import {
  ChatServiceError,
  generateReply,
  type ChatMessage,
} from "@/lib/services/chat.service";

/** Narrows untrusted JSON into the shape the service expects. */
function parseMessages(value: unknown): ChatMessage[] | null {
  if (!value || typeof value !== "object") return null;

  const { messages } = value as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const parsed: ChatMessage[] = [];

  for (const entry of messages) {
    if (!entry || typeof entry !== "object") return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };

    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.trim() === "") return null;

    parsed.push({ role, content });
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const messages = parseMessages(body);
  if (!messages) {
    return Response.json(
      {
        error:
          "Expected { messages: [{ role, content }] } with at least one message.",
      },
      { status: 400 },
    );
  }

  try {
    const reply = await generateReply(messages);
    return Response.json({ reply });
  } catch (error) {
    if (error instanceof ChatServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    // Anything else is a bug on our side — do not leak its details.
    console.error("[api/chat] unexpected failure:", error);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
