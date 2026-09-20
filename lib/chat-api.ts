/**
 * The browser's side of the conversation.
 *
 * This is the one file components use to get a reply. It talks to our own
 * /api/chat route, never to the model server directly — see the comment at the
 * top of app/api/chat/route.ts for why.
 */

import type { Message } from "@/lib/types";

/** Thrown when the request fails, carrying a message safe to show the user. */
export class ChatRequestError extends Error {}

/**
 * Sends the conversation so far and resolves with the assistant's reply.
 *
 * The whole history goes up, not just the newest message, because the endpoint
 * is stateless — it remembers nothing between calls. The route handler folds
 * that history into a single prompt.
 */
export async function requestAssistantReply(
  messages: Message[],
  options: { signal?: AbortSignal } = {},
): Promise<string> {
  let response: Response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: options.signal,
      body: JSON.stringify({
        // Send only what the server needs — ids and timestamps are ours.
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
    });
  } catch (error) {
    // The fetch itself failed: offline, or the Next.js server is down.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ChatRequestError(
      "Could not reach the app server. Check that it is still running.",
    );
  }

  // A 4xx/5xx still resolves the promise, so the status has to be checked.
  if (!response.ok) {
    const detail = await response
      .json()
      .then((body: { error?: string }) => body.error)
      .catch(() => undefined);

    throw new ChatRequestError(detail ?? `Request failed (${response.status}).`);
  }

  const data: { reply?: unknown } = await response.json();

  if (typeof data.reply !== "string" || data.reply.trim() === "") {
    throw new ChatRequestError("The model returned an empty response.");
  }

  return data.reply;
}
