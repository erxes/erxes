import { memo, useMemo } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ChatVizMessage } from 'erxes-ui';
import { CopyButton } from '~/modules/chat/components/CopyButton';
import { splitStreamingMarkdown } from '~/modules/chat/utils';

// Extract the raw text out of a code node's children (string or nested nodes).
const codeText = (children: ReactNode): string => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(codeText).join('');
  return '';
};

const CodeBlock = ({ lang, code }: { lang: string; code: string }) => {
  // Render chart-viz fenced blocks as interactive charts. JSON.parse is safe
  // here: ChatVizMessage re-sanitizes the payload before any rendering.
  if (lang === 'chart-viz') {
    try {
      const raw: unknown = JSON.parse(code);
      if (raw) return <ChatVizMessage rawPayload={raw} className="my-2" />;
    } catch {
      // malformed — fall through to a plain code block
    }
  }
  return (
    <div className="group/code rounded-lg border border-border overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1 bg-muted/60 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground">
          {lang || 'code'}
        </span>
        <div className="opacity-0 group-hover/code:opacity-100 transition-opacity">
          <CopyButton text={code} />
        </div>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed bg-muted/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// react-markdown component overrides — match the chat's restrained typography
// (text-sm body, weight-based heading hierarchy, muted tool-style code).
const components: Components = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }: ComponentPropsWithoutRef<'code'>) => {
    const text = codeText(children).replace(/\n$/, '');
    const lang = /language-(\w[\w-]*)/.exec(className ?? '')?.[1] ?? '';
    const isBlock = !!lang || text.includes('\n');
    if (!isBlock) {
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      );
    }
    return <CodeBlock lang={lang} code={text} />;
  },
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="text-base font-bold mt-1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold mt-1">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="font-semibold mt-1">{children}</h3>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border px-2 py-1 text-left font-semibold bg-muted/40">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2 py-1 align-top">{children}</td>
  ),
};

// One parsed markdown block. Memoized on its source string so a frozen block
// (its text settled once the stream moved past it) never re-parses or reflows,
// even as later blocks keep streaming in.
const MarkdownBlock = memo(function MarkdownBlock({
  content,
}: {
  content: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
});

// Renders assistant markdown: GFM (tables/strikethrough/task lists), sanitized
// HTML, and chart-viz fenced blocks as interactive charts. Replaces the former
// hand-rolled inline/block parser. Used for settled messages — the whole string
// in one pass, so block boundaries are always parsed correctly.
export const ChatMarkdown = memo(function ChatMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="space-y-1 text-sm break-words">
      <MarkdownBlock content={content} />
    </div>
  );
});

// Streaming variant: completed blocks are frozen (each its own memoized block,
// so finished text can't be re-interpreted or reflowed as context grows), and
// only the trailing in-progress block re-renders per frame. This is what makes
// the reveal feel seamless. Blocks only ever append during a turn, so the index
// key is stable. Settled messages render via ChatMarkdown (whole string) so the
// transient split heuristic never affects the final output.
export const StreamingMarkdown = ({ content }: { content: string }) => {
  const { blocks, tail } = useMemo(
    () => splitStreamingMarkdown(content),
    [content],
  );
  return (
    <div className="space-y-1 text-sm break-words">
      {blocks.map((block, i) => (
        <MarkdownBlock key={i} content={block} />
      ))}
      {tail ? <MarkdownBlock content={tail} /> : null}
    </div>
  );
};
