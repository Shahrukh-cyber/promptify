/**
 * Local, fake conversation data for Phase 1.
 *
 * Nothing here touches the network. `createDummyConversations()` is called once
 * when the app mounts; after that, React state is the single source of truth and
 * this file is never read again.
 */

import type { Conversation, Message } from "@/lib/types";

/** Milliseconds in one day — used to build believable relative timestamps. */
const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/** Small counter so every seeded id is unique and stable within one session. */
let seedCounter = 0;

function message(
  role: Message["role"],
  content: string,
  createdAt: Date,
): Message {
  seedCounter += 1;
  return { id: `seed-${seedCounter}`, role, content, createdAt };
}

/**
 * Builds the seed conversations relative to "now", so the sidebar always has
 * something in Today, Yesterday and Previous 7 days.
 */
export function createDummyConversations(): Conversation[] {
  const now = Date.now();

  const conversations: Conversation[] = [
    {
      id: "conv-react-hooks",
      title: "Explain React hooks",
      updatedAt: new Date(now - 12 * MINUTE),
      messages: [
        message(
          "user",
          "Can you explain React hooks in simple terms?",
          new Date(now - 15 * MINUTE),
        ),
        message(
          "assistant",
          [
            "Hooks are functions that let a component remember things and react to changes, without writing a class.",
            "",
            "The two you will use constantly:",
            "",
            "- **useState** gives a component a value it can change over time. Changing it tells React to re-render.",
            "- **useEffect** runs code *after* a render — usually to sync with something outside React, like a timer or the document title.",
            "",
            "```tsx",
            "function Counter() {",
            "  const [count, setCount] = useState(0);",
            "",
            "  return (",
            '    <button onClick={() => setCount(count + 1)}>',
            "      Clicked {count} times",
            "    </button>",
            "  );",
            "}",
            "```",
            "",
            "The rule to remember: call hooks at the top level of a component, never inside a loop or an `if`. React matches hooks to their state by call order.",
          ].join("\n"),
          new Date(now - 12 * MINUTE),
        ),
      ],
    },
    {
      id: "conv-typescript",
      title: "What is TypeScript?",
      updatedAt: new Date(now - 3 * 60 * MINUTE),
      messages: [
        message(
          "user",
          "What is TypeScript and why would I use it over plain JavaScript?",
          new Date(now - 3 * 60 * MINUTE - 2 * MINUTE),
        ),
        message(
          "assistant",
          [
            "TypeScript is JavaScript with a type checker bolted on. You write the same code, plus annotations describing what shape your data has.",
            "",
            "```ts",
            "type User = {",
            "  id: string;",
            "  name: string;",
            "  isAdmin: boolean;",
            "};",
            "",
            "function greet(user: User) {",
            "  return `Hello, ${user.name}`;",
            "}",
            "```",
            "",
            "Those annotations vanish at build time — the browser only ever runs JavaScript. What you get in exchange is an editor that catches typos and wrong shapes *before* you run the app, and autocomplete that actually knows your data.",
          ].join("\n"),
          new Date(now - 3 * 60 * MINUTE),
        ),
      ],
    },
    {
      id: "conv-nextjs",
      title: "Learn Next.js",
      updatedAt: new Date(now - DAY - 2 * 60 * MINUTE),
      messages: [
        message(
          "user",
          "Where should I start with Next.js and the App Router?",
          new Date(now - DAY - 2 * 60 * MINUTE - 3 * MINUTE),
        ),
        message(
          "assistant",
          [
            "Start with routing, because in Next.js the folder structure *is* the router.",
            "",
            "A folder inside `app/` becomes a URL segment, and a `page.tsx` inside it becomes the page:",
            "",
            "```",
            "app/",
            "  page.tsx          ->  /",
            "  about/page.tsx    ->  /about",
            "  blog/[slug]/page.tsx  ->  /blog/anything",
            "```",
            "",
            "The second idea is that components are **Server Components** by default. They render on the server and ship no JavaScript to the browser. The moment you need state or an event handler, add `\"use client\"` at the top of the file to opt that component (and everything it imports) into the browser.",
          ].join("\n"),
          new Date(now - DAY - 2 * 60 * MINUTE),
        ),
      ],
    },
    {
      id: "conv-closures",
      title: "JavaScript closures",
      updatedAt: new Date(now - 3 * DAY),
      messages: [
        message(
          "user",
          "I still don't get closures. Help?",
          new Date(now - 3 * DAY - 4 * MINUTE),
        ),
        message(
          "assistant",
          [
            "A closure is just a function that remembers the variables it was created next to, even after the outer function has finished.",
            "",
            "```js",
            "function makeCounter() {",
            "  let count = 0;",
            "",
            "  return function increment() {",
            "    count += 1;",
            "    return count;",
            "  };",
            "}",
            "",
            "const next = makeCounter();",
            "next(); // 1",
            "next(); // 2",
            "```",
            "",
            "`makeCounter` has already returned, but `count` is still alive because `increment` still refers to it. Each call to `makeCounter()` creates a fresh, private `count` — that privacy is the whole point.",
          ].join("\n"),
          new Date(now - 3 * DAY),
        ),
      ],
    },
    {
      id: "conv-api",
      title: "What is an API?",
      updatedAt: new Date(now - 6 * DAY),
      messages: [
        message(
          "user",
          "Explain what an API is, without jargon.",
          new Date(now - 6 * DAY - 2 * MINUTE),
        ),
        message(
          "assistant",
          [
            "An API is a menu. The kitchen decides what it will cook; the menu tells you exactly what you can order and how to ask for it. You never walk into the kitchen.",
            "",
            "On the web, ordering looks like this:",
            "",
            "```js",
            'const res = await fetch("/api/chat", {',
            '  method: "POST",',
            '  headers: { "Content-Type": "application/json" },',
            '  body: JSON.stringify({ message: "Hello" }),',
            "});",
            "",
            "const data = await res.json();",
            "```",
            "",
            "You send a request to an address, the other side sends back data — usually JSON. Everything about *how* it produced that data stays hidden, which is exactly what makes it useful.",
          ].join("\n"),
          new Date(now - 6 * DAY),
        ),
      ],
    },
  ];

  return conversations;
}
