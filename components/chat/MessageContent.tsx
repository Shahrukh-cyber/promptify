import { Fragment } from "react";

import { CodeBlock } from "@/components/chat/CodeBlock";
import { parseMessageContent } from "@/lib/chat-utils";

/**
 * Turns `**bold**`, `*italic*` and `` `code` `` into real elements.
 *
 * This is a deliberately tiny markdown subset — enough for what the model
 * returns, without pulling in a full markdown parser.
 */
function renderInline(text: string, keyPrefix: string) {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

  return text.split(pattern).map((chunk, index) => {
    const key = `${keyPrefix}-${index}`;

    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    if (chunk.startsWith("`") && chunk.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
        >
          {chunk.slice(1, -1)}
        </code>
      );
    }
    if (chunk.startsWith("*") && chunk.endsWith("*") && chunk.length > 2) {
      return (
        <em key={key} className="italic">
          {chunk.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={key}>{chunk}</Fragment>;
  });
}

/** Groups consecutive `- ` or `1. ` lines into real <ul> / <ol> elements. */
function renderTextBlock(text: string, keyPrefix: string) {
  const lines = text.split("\n");
  const output: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (!listType || listBuffer.length === 0) return;

    const items = listBuffer.map((item, index) => (
      <li key={`${keyPrefix}-li-${output.length}-${index}`} className="pl-1">
        {renderInline(item, `${keyPrefix}-li-${output.length}-${index}`)}
      </li>
    ));

    output.push(
      listType === "ul" ? (
        <ul
          key={`${keyPrefix}-ul-${output.length}`}
          className="my-2 list-disc space-y-1 pl-5"
        >
          {items}
        </ul>
      ) : (
        <ol
          key={`${keyPrefix}-ol-${output.length}`}
          className="my-2 list-decimal space-y-1 pl-5"
        >
          {items}
        </ol>
      ),
    );

    listBuffer = [];
    listType = null;
  }

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);

    if (bullet) {
      if (listType === "ol") flushList();
      listType = "ul";
      listBuffer.push(bullet[1]);
      continue;
    }
    if (numbered) {
      if (listType === "ul") flushList();
      listType = "ol";
      listBuffer.push(numbered[1]);
      continue;
    }

    flushList();

    if (line.trim() === "") continue;

    output.push(
      <p key={`${keyPrefix}-p-${output.length}`} className="my-2 first:mt-0 last:mb-0">
        {renderInline(line, `${keyPrefix}-p-${output.length}`)}
      </p>,
    );
  }

  flushList();
  return output;
}

/**
 * Renders one message's body: prose paragraphs, lists, and fenced code blocks.
 */
export function MessageContent({ content }: { content: string }) {
  const parts = parseMessageContent(content);

  return (
    <div className="text-[0.9375rem] leading-7">
      {parts.map((part, index) =>
        part.type === "code" ? (
          <CodeBlock
            key={`code-${index}`}
            code={part.value}
            language={part.language}
          />
        ) : (
          <Fragment key={`text-${index}`}>
            {renderTextBlock(part.value, `text-${index}`)}
          </Fragment>
        ),
      )}
    </div>
  );
}
