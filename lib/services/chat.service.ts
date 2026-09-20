import "server-only";

import { API_BASE_URL } from "@/lib/env";

/**
 * Server-only access to the generate endpoint.
 *
 * `import "server-only"` makes this a build error if a Client Component ever
 * imports it — which is the point. The browser cannot call the model server
 * directly anyway: it sends no CORS headers, and `127.0.0.1` on a visitor's
 * device is their machine, not yours.
 */

/** Generation takes ~5s locally; allow room without hanging forever. */
const REQUEST_TIMEOUT_MS = 120_000;

/** How many past messages to replay, so the prompt cannot grow without bound. */
const HISTORY_LIMIT = 12;

const SYSTEM_PREAMBLE =
  "You are Promptify, a helpful assistant. Answer clearly and concisely. " +
  "When you include code, wrap it in a Markdown code fence.";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Failure that carries a message safe to show the user. */
export class ChatServiceError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

/**
 * Flattens the conversation into the single `prompt` string the API accepts.
 *
 * The endpoint's request schema is `{ prompt: string }` — there is no field for
 * history, and the server keeps no state between calls. Folding the transcript
 * into the prompt by hand is the only reason the assistant remembers anything.
 * To make every turn start fresh, send just the last message instead.
 */
function buildPrompt(messages: ChatMessage[]): string {
  const transcript = messages
    .slice(-HISTORY_LIMIT)
    .map(({ role, content }) => {
      const speaker = role === "user" ? "User" : "Assistant";
      return `${speaker}: ${content}`;
    })
    .join("\n\n");

  // The trailing "Assistant:" tells the model whose turn it is to speak.
  return `${SYSTEM_PREAMBLE}\n\n${transcript}\n\nAssistant:`;
}

/**
 * Turns an upstream error body into something worth reading.
 *
 * FastAPI reports failures as `{ "detail": "..." }`, and the backend puts the
 * real cause in there — a provider quota message, for instance. Collapsing all
 * of that into "responded with 500" throws away the only useful part, so the
 * detail is passed through (truncated, since provider errors run long).
 */
function describeUpstreamError(status: number, raw: string): string {
  let detail: string | undefined;

  try {
    const parsed: unknown = JSON.parse(raw);
    const value = (parsed as { detail?: unknown } | null)?.detail;
    if (typeof value === "string" && value.trim() !== "") {
      detail = value.trim();
    }
  } catch {
    // Not JSON — fall back to the plain status below.
  }

  if (!detail) return `The model server responded with ${status}.`;

  const condensed = detail.replace(/\s+/g, " ");
  const summary =
    condensed.length > 300 ? `${condensed.slice(0, 300)}…` : condensed;

  return `Model server error (${status}): ${summary}`;
}

/**
 * Sends the conversation to the model and returns its reply.
 *
 * @throws {ChatServiceError} when the server is unreachable, times out, or
 *   answers with something other than `{ text: string }`.
 */
export async function generateReply(messages: ChatMessage[]): Promise<string> {
  const endpoint = `${API_BASE_URL}/v1/generate`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: buildPrompt(messages) }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    // Thrown when the server is not running, the host is unreachable, or the
    // request outlived REQUEST_TIMEOUT_MS.
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new ChatServiceError("The model server took too long to respond.", 504);
    }
    throw new ChatServiceError(
      `Could not reach the model server at ${endpoint}. Is it running?`,
    );
  }

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    console.error(
      `[chat.service] ${endpoint} responded ${response.status}: ${raw.slice(0, 1000)}`,
    );
    throw new ChatServiceError(describeUpstreamError(response.status, raw));
  }

  // Documented response schema: { text: string }.
  const data: unknown = await response.json().catch(() => null);
  const text = (data as { text?: unknown } | null)?.text;

  if (typeof text !== "string" || text.trim() === "") {
    throw new ChatServiceError(
      "The model server returned an empty or unexpected response.",
    );
  }

  return text.trim();
}
