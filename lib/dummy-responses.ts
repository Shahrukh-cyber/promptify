/**
 * The fake "model" for Phase 1.
 *
 * This is deliberately the ONLY place in the app that knows where an assistant
 * reply comes from. Every component just awaits `generateAssistantReply()`.
 *
 * In Phase 2 the body of that function is replaced with a `fetch()` to a
 * Next.js route handler that calls Gemini on the server. The signature stays
 * the same (string in, Promise<string> out), so no component has to change.
 */

/** How long the fake "thinking" takes, in milliseconds. */
const MIN_DELAY = 700;
const MAX_DELAY = 1400;

type CannedReply = {
  /** If any of these appear in the user's message, use this reply. */
  keywords: string[];
  reply: string;
};

const CANNED_REPLIES: CannedReply[] = [
  {
    keywords: ["hook", "usestate", "useeffect"],
    reply: [
      "Hooks let a function component hold state and run side effects.",
      "",
      "`useState` stores a value between renders and gives you a setter that tells React to re-render:",
      "",
      "```tsx",
      "const [input, setInput] = useState(\"\");",
      "```",
      "",
      "`useEffect` runs after the render is painted, which is where you talk to the world outside React — timers, subscriptions, scrolling an element into view.",
    ].join("\n"),
  },
  {
    keywords: ["typescript", "type ", "types", "interface"],
    reply: [
      "TypeScript describes the *shape* of your data so the editor can catch mistakes before you run anything.",
      "",
      "```ts",
      "type Message = {",
      "  id: string;",
      '  role: "user" | "assistant";',
      "  content: string;",
      "  createdAt: Date;",
      "};",
      "```",
      "",
      "That `\"user\" | \"assistant\"` is a union type — those two strings are the only legal values, and a typo is a compile error rather than a bug you find at 2am.",
    ].join("\n"),
  },
  {
    keywords: ["next.js", "nextjs", "app router", "routing", "server component"],
    reply: [
      "In the App Router, your folders are your routes. A `page.tsx` inside `app/settings/` serves `/settings` — there is no route config file to maintain.",
      "",
      "Components render on the server by default. Add the directive at the top of a file to move it to the browser:",
      "",
      "```tsx",
      '"use client";',
      "",
      "export function Counter() {",
      "  const [n, setN] = useState(0);",
      "  return <button onClick={() => setN(n + 1)}>{n}</button>;",
      "}",
      "```",
      "",
      "Anything with state, an event handler, or a browser API needs that line.",
    ].join("\n"),
  },
  {
    keywords: ["closure", "scope"],
    reply: [
      "A closure is a function bundled together with the variables that surrounded it when it was created.",
      "",
      "```js",
      "function once(fn) {",
      "  let called = false;",
      "  return (...args) => {",
      "    if (called) return;",
      "    called = true;",
      "    return fn(...args);",
      "  };",
      "}",
      "```",
      "",
      "`called` lives on after `once()` returns, and nothing outside can touch it. That's closures doing the work of a private variable.",
    ].join("\n"),
  },
  {
    keywords: ["api", "fetch", "endpoint", "request"],
    reply: [
      "An API is a contract: you send a request to an address, it sends structured data back.",
      "",
      "```ts",
      'const res = await fetch("/api/chat", {',
      '  method: "POST",',
      '  headers: { "Content-Type": "application/json" },',
      "  body: JSON.stringify({ message }),",
      "});",
      "",
      "if (!res.ok) throw new Error(\"Request failed\");",
      "const { reply } = await res.json();",
      "```",
      "",
      "Note the error check — a request that reaches the server but fails still resolves, so `res.ok` is the thing to test.",
    ].join("\n"),
  },
  {
    keywords: ["css", "tailwind", "style", "styling"],
    reply: [
      "Tailwind gives you small single-purpose classes and you compose them directly on the element.",
      "",
      "```tsx",
      '<div className="flex items-center gap-3 rounded-lg border p-4">',
      "  Card content",
      "</div>",
      "```",
      "",
      "It looks noisy at first, but the payoff is that deleting a component deletes its styles too — there is no stylesheet slowly filling up with rules nobody dares remove.",
    ].join("\n"),
  },
];

/** Used when nothing in the question matches a canned reply. */
const FALLBACK_REPLIES = [
  [
    "That's a good question to sit with. Here's how I'd approach it:",
    "",
    "1. Write down what you already know for certain.",
    "2. Name the one thing that would change your answer if it turned out to be false.",
    "3. Go check that one thing first.",
    "",
    "*(This is a placeholder response from local dummy data — no model has been called yet.)*",
  ].join("\n"),
  [
    "Breaking that down into smaller pieces usually helps. Start with the smallest version that could possibly work, get it running, then add one thing at a time.",
    "",
    "*(This is a placeholder response from local dummy data — no model has been called yet.)*",
  ].join("\n"),
  [
    "I'd start from the data. Once the shape of the data is clear, the code that handles it tends to write itself.",
    "",
    "*(This is a placeholder response from local dummy data — no model has been called yet.)*",
  ].join("\n"),
];

/** Waits for `ms` milliseconds. Used to fake network latency. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickReply(userMessage: string): string {
  const normalized = userMessage.toLowerCase();

  const match = CANNED_REPLIES.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (match) return match.reply;

  const index = Math.floor(Math.random() * FALLBACK_REPLIES.length);
  return FALLBACK_REPLIES[index];
}

/**
 * Returns a fake assistant reply after a short, random delay.
 *
 * PHASE 2 — replace the body with:
 *
 *   const res = await fetch("/api/chat", { method: "POST", ... });
 *   const { reply } = await res.json();
 *   return reply;
 */
export async function generateAssistantReply(
  userMessage: string,
): Promise<string> {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  await wait(delay);
  return pickReply(userMessage);
}

/** Turns the first user message into a short sidebar title. */
export function deriveConversationTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 40) return cleaned;
  return `${cleaned.slice(0, 40).trimEnd()}...`;
}
