import { CopyButton } from "@/components/chat/CopyButton";

type CodeBlockProps = {
  code: string;
  language: string;
};

/**
 * Renders a fenced code block with a language label and a copy button.
 *
 * This is a plain (server-rendered) component — the only interactive piece is
 * <CopyButton />, which marks itself as a client component.
 */
export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="my-3 overflow-hidden rounded-xl border bg-muted/50">
      <div className="flex items-center justify-between border-b bg-muted/60 py-1 pr-1 pl-3">
        <span className="font-mono text-xs tracking-wide text-muted-foreground">
          {language}
        </span>
        <CopyButton value={code} label="Copy code" />
      </div>
      <pre className="overflow-x-auto p-3 text-[0.8125rem] leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
