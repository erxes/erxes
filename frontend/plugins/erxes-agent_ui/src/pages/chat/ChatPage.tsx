import React, { useState, useRef, useEffect, useReducer } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  IconRobot,
  IconSend,
  IconMessageCircle,
  IconMessage2,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconChevronRight,
  IconSparkles,
  IconTool,
  IconLoader2,
  IconPlayerStopFilled,
  IconPaperclip,
  IconFileText,
  IconX,
  IconArrowDown,
  IconFileUpload,
  IconThumbUp,
  IconThumbDown,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  ChatVizMessage,
  Empty,
  REACT_APP_API_URL,
  Separator,
  Skeleton,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  MASTRA_AGENTS,
  MASTRA_ATTACHMENT_STORAGE_STATUS,
} from '~/graphql/queries';
import {
  chatStore,
  randomIdSuffix,
  ChatAttachment,
  Message,
  ToolCallInfo,
} from './chatStore';
import './chat.css';

// ─── Inline Markdown Nodes ───────────────────────────────────────────────────

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string };

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        nodes.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (text.slice(i, i + 2) === '**') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        nodes.push({ type: 'bold', value: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (text.slice(i, i + 2) === '__') {
      const end = text.indexOf('__', i + 2);
      if (end !== -1) {
        nodes.push({ type: 'bold', value: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && text[end + 1] !== '*') {
        nodes.push({ type: 'italic', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (text[i] === '_' && text[i + 1] !== '_') {
      const end = text.indexOf('_', i + 1);
      if (end !== -1 && text[end + 1] !== '_') {
        nodes.push({ type: 'italic', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    let j = i + 1;
    while (
      j < text.length &&
      text[j] !== '`' &&
      text[j] !== '*' &&
      text[j] !== '_'
    )
      j++;
    nodes.push({ type: 'text', value: text.slice(i, j) });
    i = j;
  }

  return nodes;
}

const InlineContent = ({ text }: { text: string }) => (
  <>
    {parseInline(text).map((node, i) => {
      if (node.type === 'bold')
        return (
          <strong key={i} className="font-semibold">
            {node.value}
          </strong>
        );
      if (node.type === 'italic') return <em key={i}>{node.value}</em>;
      if (node.type === 'code')
        return (
          <code
            key={i}
            className="bg-black/8 dark:bg-white/10 px-1 py-0.5 rounded text-[0.8em] font-mono"
          >
            {node.value}
          </code>
        );
      return <span key={i}>{node.value}</span>;
    })}
  </>
);

// ─── Block Markdown Renderer ─────────────────────────────────────────────────

const BlockContent = ({ text }: { text: string }) => {
  const blocks: React.ReactNode[] = [];
  let key = 0;
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const hMatch = line.match(/^(#{1,3}) (.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const className = [
        'text-base font-bold mt-3 mb-0.5',
        'text-[0.95rem] font-semibold mt-2 mb-0.5',
        'text-sm font-semibold mt-2 mb-0.5',
      ][level - 1];
      const content = <InlineContent text={hMatch[2]} />;
      blocks.push(
        level === 1 ? (
          <h1 key={key++} className={className}>
            {content}
          </h1>
        ) : level === 2 ? (
          <h2 key={key++} className={className}>
            {content}
          </h2>
        ) : (
          <h3 key={key++} className={className}>
            {content}
          </h3>
        ),
      );
      i++;
      continue;
    }

    if (/^[-*+] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(
          <li key={i} className="leading-relaxed">
            <InlineContent text={lines[i].replace(/^[-*+] /, '')} />
          </li>,
        );
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-4 space-y-0.5 my-1">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(
          <li key={i} className="leading-relaxed">
            <InlineContent text={lines[i].replace(/^\d+\. /, '')} />
          </li>,
        );
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-4 space-y-0.5 my-1">
          {items}
        </ol>,
      );
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="border-border my-2" />);
      i++;
      continue;
    }

    // Markdown table — collect all consecutive pipe-prefixed lines, then render.
    if (/^\s*\|/.test(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }

      // Parse a row into trimmed, non-empty cells.
      const parseRow = (row: string) =>
        row
          .split('|')
          .map((c) => c.trim())
          .filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);

      const isSeparator = (row: string) => /^\s*\|[\s|:-]+\|\s*$/.test(row);

      const headerLine = tableLines[0];
      const dataLines = tableLines.filter((l) => !isSeparator(l)).slice(1);
      const headers = parseRow(headerLine);

      blocks.push(
        <div
          key={key++}
          className="my-2 overflow-x-auto rounded-lg border border-border"
        >
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/60">
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    className="px-3 py-2 text-left font-semibold text-foreground border-b border-border whitespace-nowrap"
                  >
                    <InlineContent text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLines.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                >
                  {parseRow(row).map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 border-b border-border/50 last:border-b-0 align-top"
                    >
                      <InlineContent text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,3} /.test(lines[i]) &&
      !/^[-*+] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^\s*\|/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push(
        <p key={key++} className="leading-relaxed">
          {paraLines.reduce<React.ReactNode[]>((acc, pl, pi) => {
            if (pi > 0) acc.push(<br key={`br-${pi}`} />);
            acc.push(<InlineContent key={`il-${pi}`} text={pl} />);
            return acc;
          }, [])}
        </p>,
      );
    }
  }

  return <>{blocks}</>;
};

// ─── Fenced code block splitter + full markdown renderer ─────────────────────

// Split content into [text, fence, text, fence, ...] segments with an index
// scan — the equivalent capture-group split regex backtracks super-linearly.
function splitCodeFences(content: string): string[] {
  const segments: string[] = [];
  let i = 0;
  for (;;) {
    const start = content.indexOf('```', i);
    if (start === -1) break;
    const headerEnd = content.indexOf('\n', start + 3);
    if (headerEnd === -1) break;
    const end = content.indexOf('```', headerEnd + 1);
    if (end === -1) break;
    segments.push(content.slice(i, start));
    segments.push(content.slice(start, end + 3));
    i = end + 3;
  }
  segments.push(content.slice(i));
  return segments;
}

const MarkdownContent = ({ content }: { content: string }) => {
  const segments = splitCodeFences(content);
  return (
    <div className="space-y-1 text-sm">
      {segments.map((seg, idx) => {
        if (/^```/.test(seg)) {
          const langMatch = seg.match(/^```([^\n]*)\n/);
          const lang = langMatch?.[1]?.trim() || '';
          const code = seg.replace(/^```[^\n]*\n/, '').replace(/\n?```$/, '');

          // Render chart-viz fenced blocks as interactive charts.
          // JSON.parse is safe here: ChatVizMessage re-sanitizes the payload
          // before any rendering occurs (see chatVizSanitize.ts).
          if (lang === 'chart-viz') {
            let raw: unknown = null;
            try {
              raw = JSON.parse(code);
            } catch {
              /* malformed — fall through to code block */
            }
            if (raw)
              return (
                <ChatVizMessage key={idx} rawPayload={raw} className="my-2" />
              );
          }

          return (
            <div
              key={idx}
              className="group/code rounded-lg border border-border overflow-hidden my-2"
            >
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
        }
        return <BlockContent key={idx} text={seg} />;
      })}
    </div>
  );
};

// ─── Copy button ─────────────────────────────────────────────────────────────

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className="size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <IconCheck className="size-3.5 text-green-600" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>{copied ? 'Copied!' : 'Copy'}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

// ─── Attachments ─────────────────────────────────────────────────────────────
//
// Files ride on the instance's existing upload storage: the composer posts
// them to core's /upload-file (S3/R2/Azure/GCS/local — whatever is configured)
// and gets back a storage key. Private files render back through /read-file.

const isImageAttachment = (att: { name: string; type?: string }) =>
  att.type?.startsWith('image/') ||
  /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(att.name);

const attachmentSrc = (att: ChatAttachment) =>
  /^https?:\/\//i.test(att.url)
    ? att.url
    : `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
        att.url,
      )}&inline=true&name=${encodeURIComponent(att.name)}`;

const formatFileSize = (size?: number) => {
  if (!size || size <= 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// Attachments render as their own block OUTSIDE the chat bubble — images as
// standalone rounded cards, other files as download cards.
const MessageAttachments = ({
  attachments,
}: {
  attachments: ChatAttachment[];
}) => {
  const images = attachments.filter(isImageAttachment);
  const files = attachments.filter((a) => !isImageAttachment(a));

  return (
    <div className="flex flex-col items-end gap-1.5 max-w-[78%]">
      {images.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5">
          {images.map((att, i) => (
            <a
              key={`${att.url}-${i}`}
              href={attachmentSrc(att)}
              target="_blank"
              rel="noreferrer"
              title={att.name}
              className="group/img block overflow-hidden rounded-xl border border-border bg-muted shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
            >
              <img
                src={attachmentSrc(att)}
                alt={att.name}
                className="block max-h-64 max-w-72 h-auto w-auto transition-transform duration-300 group-hover/img:scale-[1.02]"
              />
            </a>
          ))}
        </div>
      )}
      {files.map((att, i) => (
        <a
          key={`${att.url}-${i}`}
          href={attachmentSrc(att)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-sm hover:border-primary/40 hover:bg-primary/4 transition-colors max-w-64"
        >
          <span className="size-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconFileText className="size-4 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">
              {att.name}
            </span>
            {att.size ? (
              <span className="block text-muted-foreground mt-0.5">
                {formatFileSize(att.size)}
              </span>
            ) : null}
          </span>
        </a>
      ))}
    </div>
  );
};

// A file in the composer, before the message is sent.
interface PendingAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string; // storage key once uploaded
  previewUrl?: string; // local object URL for image thumbnails
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

// Upload one file through core's /upload-file (same endpoint and storage the
// rest of erxes uses). Returns the storage key or public URL.
async function uploadToStorage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Upload failed (HTTP ${res.status})`);
  }
  return text.replace(/^"|"$/g, '');
}

const ComposerAttachmentChip = ({
  att,
  onRemove,
}: {
  att: PendingAttachment;
  onRemove: () => void;
}) => (
  <div
    className={`ea-pop flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs max-w-56 transition-colors ${
      att.status === 'error'
        ? 'border-destructive/40 bg-destructive/8 text-destructive'
        : 'border-border bg-muted/50 hover:bg-muted'
    }`}
    title={att.status === 'error' ? att.error : att.name}
  >
    {att.status === 'uploading' ? (
      <IconLoader2 className="size-3.5 shrink-0 animate-spin text-primary" />
    ) : att.status === 'error' ? (
      <IconAlertCircle className="size-3.5 shrink-0" />
    ) : att.previewUrl ? (
      <img
        src={att.previewUrl}
        alt={att.name}
        className="size-6 shrink-0 rounded object-cover border border-border/60"
      />
    ) : (
      <IconFileText className="size-3.5 shrink-0 text-muted-foreground" />
    )}
    <span className="truncate">{att.name}</span>
    {att.size ? (
      <span className="text-muted-foreground shrink-0">
        {formatFileSize(att.size)}
      </span>
    ) : null}
    <button
      type="button"
      onClick={onRemove}
      className="shrink-0 rounded hover:bg-black/8 dark:hover:bg-white/10 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
    >
      <IconX className="size-3" />
    </button>
  </div>
);

// ─── Waiting indicator ───────────────────────────────────────────────────────
//
// Shown only between sending and the first streamed event — once thinking /
// tool / text events arrive, the live assistant bubble takes over.

const AgentAvatar = ({ live }: { live?: boolean }) => (
  <div
    className={`size-8 shrink-0 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center ${
      live ? 'ea-avatar-live' : ''
    }`}
  >
    <IconRobot className="size-4.5 text-primary" />
  </div>
);

const WaitingIndicator = () => (
  <div className="flex items-end gap-2.5 ea-msg-in">
    <AgentAvatar live />
    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="ea-typing-dot" />
        <span className="ea-typing-dot" />
        <span className="ea-typing-dot" />
      </div>
    </div>
  </div>
);

// ─── Thinking section ────────────────────────────────────────────────────────
//
// Each reasoning burst is its own section, rendered in chronological order
// with the tool calls — a new burst always appears at the bottom of the turn,
// never appended into an earlier pane.
//
// Live (still reasoning): shows the TAIL of the current thought — what the
// model is thinking about right now — with no scrollbox.
// Finished: collapses to a one-line row; expanding prints the full thought at
// natural height (no inner scrollbar).

const ThinkingSection = ({ text, live }: { text: string; live?: boolean }) => {
  // Live bursts start open so the streaming thought is visible, but the user
  // can collapse them at any time; finished bursts start collapsed. When a
  // live burst finishes it folds back to the one-line row.
  const [expanded, setExpanded] = useState(!!live);
  const wasLive = useRef(!!live);

  useEffect(() => {
    if (wasLive.current && !live) setExpanded(false);
    wasLive.current = !!live;
  }, [live]);

  const tail = live && text.length > 280 ? '…' + text.slice(-280) : text;

  return (
    <div
      className={`ea-pop rounded-xl border overflow-hidden transition-colors ${
        live
          ? 'border-primary/20 bg-primary/4'
          : 'border-border/60 bg-background/40 hover:border-border'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
          live ? '' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          } ${live ? 'text-primary' : ''}`}
        />
        <IconSparkles
          className={`size-3.5 shrink-0 ${
            live ? 'text-primary animate-pulse' : ''
          }`}
        />
        {live ? (
          <span className="ea-shimmer-text font-medium">Thinking…</span>
        ) : (
          <span>Thought process</span>
        )}
      </button>
      {expanded && (
        <div className="ea-expand px-3 pb-2.5">
          <p
            className={`text-xs whitespace-pre-wrap leading-relaxed ${
              live ? 'text-muted-foreground/80' : 'text-muted-foreground'
            }`}
          >
            {tail}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Tool call row (expandable) ──────────────────────────────────────────────

const formatJson = (value: any): string => {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const ToolCallRow = ({
  call,
  streaming,
}: {
  call: ToolCallInfo;
  streaming?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const pending = call.result === undefined && streaming;

  return (
    <div
      className={`ea-pop rounded-xl border overflow-hidden transition-colors ${
        pending
          ? 'border-primary/30 bg-primary/4'
          : 'border-border/60 bg-background/40 hover:border-border'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors hover:bg-accent/40"
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <IconTool className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-mono truncate flex-1 text-left">
          {call.toolName}
        </span>
        {pending ? (
          <span className="ea-tool-running size-2 shrink-0 rounded-full" />
        ) : call.isError ? (
          <IconAlertCircle className="size-3.5 shrink-0 text-destructive" />
        ) : call.result !== undefined ? (
          <IconCheck className="size-3.5 shrink-0 text-success" />
        ) : null}
      </button>
      {expanded && (
        <div className="ea-expand px-3 pb-2.5 space-y-2">
          {call.args !== undefined && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Request
              </p>
              <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                {formatJson(call.args)}
              </pre>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Response
            </p>
            <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {pending ? 'Running…' : formatJson(call.result) || '—'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Feedback (thumbs) ───────────────────────────────────────────────────────
//
// Ratings feed the learning loop: a vote reinforces or penalizes the distilled
// lessons that were injected into this turn's context (see Agent knowledge).

const FeedbackButtons = ({
  rating,
  onRate,
}: {
  rating?: number;
  onRate: (rating: 1 | -1) => void;
}) => (
  <Tooltip.Provider>
    {([1, -1] as const).map((value) => {
      const active = rating === value;
      const Icon = value === 1 ? IconThumbUp : IconThumbDown;
      return (
        <Tooltip key={value}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => !active && onRate(value)}
              className={`size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                active
                  ? value === 1
                    ? 'text-success'
                    : 'text-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {value === 1 ? 'Good response' : 'Bad response'}
          </Tooltip.Content>
        </Tooltip>
      );
    })}
  </Tooltip.Provider>
);

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  msg,
  onRegenerate,
  onRate,
}: {
  msg: Message;
  onRegenerate?: () => void;
  onRate?: (rating: 1 | -1) => void;
}) => {
  if (msg.role === 'error') {
    return (
      <div className="flex justify-center ea-msg-in">
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2 max-w-[80%]">
          <IconAlertCircle className="size-3.5 shrink-0" />
          <span>{msg.content}</span>
        </div>
      </div>
    );
  }

  if (msg.role === 'user') {
    const time = msg.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const hasText = !!msg.content.trim();
    return (
      <div className="flex flex-col items-end gap-1.5 ea-msg-in">
        {msg.attachments && msg.attachments.length > 0 && (
          <MessageAttachments attachments={msg.attachments} />
        )}
        {hasText ? (
          <div className="max-w-[78%] bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
            <p className="text-[10px] mt-1 text-primary-foreground/60">
              {time}
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground pr-1">{time}</p>
        )}
      </div>
    );
  }

  // assistant — chronological turn parts (thinking / tool calls), then the
  // (possibly still streaming) answer text
  const streaming = !!msg.streaming;
  const parts = msg.parts || [];

  return (
    <div className="flex justify-start items-start gap-2.5 group ea-msg-in">
      <AgentAvatar live={streaming} />
      <div className="max-w-[82%] min-w-0 bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
        {parts.length > 0 && (
          <div className="mb-2 space-y-1">
            {parts.map((part, i) =>
              part.kind === 'thinking' ? (
                <ThinkingSection
                  key={i}
                  text={part.text}
                  live={streaming && !part.done && i === parts.length - 1}
                />
              ) : (
                <ToolCallRow
                  key={part.call.toolCallId ?? `tool-${i}`}
                  call={part.call}
                  streaming={streaming}
                />
              ),
            )}
          </div>
        )}
        {msg.content ? (
          <MarkdownContent content={msg.content} />
        ) : streaming && !parts.length ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="ea-typing-dot" />
            <span className="ea-typing-dot" />
            <span className="ea-typing-dot" />
          </div>
        ) : null}
        {streaming && msg.content && <span className="ea-caret" />}
        {!streaming && (
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <p className="text-[10px] text-muted-foreground">
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {msg.interrupted && (
                <span className="ml-1.5 text-amber-600 dark:text-amber-500">
                  · stopped
                </span>
              )}
            </p>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onRegenerate && (
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        onClick={onRegenerate}
                        className="size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <IconRefresh className="size-3.5" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Regenerate</Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              )}
              {onRate && (
                <FeedbackButtons rating={msg.rating} onRate={onRate} />
              )}
              <CopyButton text={msg.content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const ChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  // Subscribe to store updates
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => chatStore.subscribe(forceUpdate), []);

  const { data, loading: agentsLoading } = useQuery(MASTRA_AGENTS);
  // Whether file attachments are usable: instance storage configured AND the
  // plugin toggle on. When off, the chat is text-only (no attach button).
  const { data: storageData } = useQuery(MASTRA_ATTACHMENT_STORAGE_STATUS);
  const attachmentsEnabled =
    !!storageData?.mastraAttachmentStorageStatus?.enabled;

  const agents = (data?.mastraAgents || []).filter((a: any) => a.isEnabled);
  // The route is keyed by the agent record _id, but inbound links (e.g.
  // Schedules → View output) may carry the agent slug — accept both.
  const selectedAgent = agentId
    ? agents.find(
        (a: { _id: string; agentId: string }) =>
          a._id === agentId || a.agentId === agentId,
      ) ?? null
    : null;

  const [input, setInput] = useState('');
  const [pendingAtts, setPendingAtts] = useState<PendingAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Counts nested dragenter/dragleave so the drop overlay doesn't flicker.
  const dragDepth = useRef(0);

  const state = agentId ? chatStore.getState(agentId) : undefined;
  const sessions = state?.sessions ?? [];
  const sessionsLoaded = state?.sessionsLoaded ?? false;
  const activeThreadId = state?.activeThreadId;
  const isDraft = state?.isDraft ?? false;
  const messages: Message[] = state?.messages ?? [];
  const chatLoading = state?.loading ?? false;
  const messagesLoading = state?.messagesLoading ?? false;

  // Slug routes normalize to the _id route so the chat store stays keyed
  // by _id no matter which link form brought the user here.
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (selectedAgent && agentId && selectedAgent._id !== agentId) {
      const search = searchParams.toString();
      const suffix = search ? `?${search}` : '';
      navigate(`/erxes-agent/chat/${selectedAgent._id}${suffix}`, {
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent?._id, agentId]);

  // Deep link: ?thread=<id> (e.g. a schedule's output thread) opens that
  // session once the agent's sessions have loaded.
  const threadParam = searchParams.get('thread');
  useEffect(() => {
    if (!agentId || !threadParam || !sessionsLoaded) return;
    if (threadParam !== activeThreadId) {
      chatStore.selectSession(apolloClient, agentId, threadParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, threadParam, sessionsLoaded]);

  // Track the viewed agent (clears its unread badge); clear on navigate away.
  useEffect(() => {
    chatStore.setCurrentAgent(agentId);
    return () => {
      chatStore.setCurrentAgent(undefined);
    };
  }, [agentId]);

  // Load the agent's persisted sessions once its record is available.
  useEffect(() => {
    if (!agentId || !selectedAgent) return;
    chatStore.loadSessions(apolloClient, agentId, selectedAgent.agentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, selectedAgent?.agentId]);

  // Keep the view pinned to the bottom — also while a reply streams (the last
  // message grows without the list length changing).
  const lastMsg = messages[messages.length - 1];
  const lastMsgSize =
    (lastMsg?.content?.length ?? 0) +
    (lastMsg?.parts?.reduce(
      (n, p) => n + (p.kind === 'thinking' ? p.text.length : 1),
      0,
    ) ?? 0);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, chatLoading, lastMsgSize]);

  useEffect(() => {
    if (!chatLoading) textareaRef.current?.focus();
  }, [chatLoading, activeThreadId]);

  const handleNewThread = () => {
    if (!agentId) return;
    chatStore.newDraft(agentId);
  };

  const handleSelectSession = (threadId: string) => {
    if (!agentId || threadId === activeThreadId) return;
    chatStore.selectSession(apolloClient, agentId, threadId);
  };

  const handleDeleteSession = (
    e: React.MouseEvent | React.KeyboardEvent,
    threadId: string,
  ) => {
    e.stopPropagation();
    if (!agentId || !selectedAgent) return;
    if (window.confirm('Delete this session and all its messages?')) {
      chatStore.deleteSession(
        apolloClient,
        agentId,
        selectedAgent.agentId,
        threadId,
      );
    }
  };

  // ── Attachment handling ──────────────────────────────────────────────────

  const addFiles = (files: FileList | File[]) => {
    if (!attachmentsEnabled) return;
    const list = Array.from(files).slice(0, 10 - pendingAtts.length);

    for (let file of list) {
      // Clipboard screenshots all arrive as "image.png" — give each a
      // distinct, readable name before it becomes the stored file name.
      if (/^image\.\w+$/i.test(file.name || '') || !file.name) {
        const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
        const stamp = new Date()
          .toISOString()
          .replace(/[:T]/g, '-')
          .slice(0, 19);
        file = new File([file], `screenshot-${stamp}.${ext}`, {
          type: file.type,
        });
      }

      const id = `att-${Date.now()}-${randomIdSuffix(6)}`;
      const entry: PendingAttachment = {
        id,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        previewUrl: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        status: 'uploading',
      };
      setPendingAtts((prev) => [...prev, entry]);

      uploadToStorage(file)
        .then((key) => {
          setPendingAtts((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, url: key, status: 'done' as const } : a,
            ),
          );
        })
        .catch((err: any) => {
          setPendingAtts((prev) =>
            prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: 'error' as const,
                    error: err?.message || 'Upload failed',
                  }
                : a,
            ),
          );
        });
    }
  };

  const removeAttachment = (id: string) => {
    setPendingAtts((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!attachmentsEnabled) return;
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  // Whole-chat-area drop target with a visible overlay. dragDepth guards
  // against the flicker from dragenter/dragleave firing on every child.
  const handleDragEnter = (e: React.DragEvent) => {
    if (!attachmentsEnabled || !e.dataTransfer?.types?.includes('Files'))
      return;
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!attachmentsEnabled) return;
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    if (!attachmentsEnabled) return;
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const uploadsInFlight = pendingAtts.some((a) => a.status === 'uploading');

  const sendMessage = (message: string, attachments: ChatAttachment[]) => {
    if (!selectedAgent || !agentId) return;
    // Fire-and-forget: the store holds the Apollo client reference so the
    // request continues even if the user navigates away before it completes.
    chatStore.sendMessage(
      apolloClient,
      agentId,
      selectedAgent.agentId,
      message,
      attachments,
    );
  };

  const handleSend = () => {
    if (
      !input.trim() ||
      !selectedAgent ||
      chatLoading ||
      !agentId ||
      uploadsInFlight
    )
      return;
    const message = input.trim();
    const attachments: ChatAttachment[] = pendingAtts
      .filter((a) => a.status === 'done' && a.url)
      .map((a) => ({ url: a.url!, name: a.name, type: a.type, size: a.size }));
    pendingAtts.forEach(
      (a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl),
    );
    setInput('');
    setPendingAtts([]);
    sendMessage(message, attachments);
  };

  // Re-ask the question that produced the last reply (with its attachments).
  const handleRegenerate = () => {
    if (chatLoading) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) sendMessage(lastUser.content, lastUser.attachments || []);
  };

  const handleStop = () => {
    if (!agentId || !activeThreadId) return;
    chatStore.stop(agentId, activeThreadId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && chatLoading) {
      e.preventDefault();
      handleStop();
    }
  };

  // Auto-grow the textarea with its content (capped via max-h on the element).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // Floating "jump to latest" pill when the user scrolls up during a stream.
  const handleMessagesScroll = () => {
    const el = messagesBoxRef.current;
    if (!el) return;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(fromBottom > 280);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" size="sm">
                  <IconMessageCircle />
                  Chat
                </Button>
              </Breadcrumb.Item>
              {selectedAgent && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <span className="text-muted-foreground text-sm">
                      {selectedAgent.name}
                    </span>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        {selectedAgent && (
          <PageHeader.End>
            <Button variant="outline" size="sm" onClick={handleNewThread}>
              <IconPlus className="size-3.5" />
              New chat
            </Button>
          </PageHeader.End>
        )}
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Agent sidebar ── */}
        <div className="w-56 border-r flex flex-col shrink-0">
          <div className="px-3 py-2.5 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agents
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            {agentsLoading ? (
              <div className="p-3 space-y-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="p-4 text-center">
                <IconRobot className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No enabled agents.
                </p>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {agents.map((agent: any) => {
                  const isActive = agentId === agent._id;
                  const hasUnread = !isActive && chatStore.hasUnread(agent._id);
                  const isWorking = chatStore.isAgentWorking(agent._id);
                  const activity = isWorking
                    ? chatStore.getAgentActivity(agent._id)
                    : undefined;
                  return (
                    <button
                      key={agent._id}
                      className={`w-full text-left rounded-md px-2.5 py-2 transition-colors hover:bg-accent ${
                        isActive ? 'bg-accent' : ''
                      } ${isWorking ? 'ea-working' : ''}`}
                      onClick={() => navigate(`/erxes-agent/chat/${agent._id}`)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="relative shrink-0">
                          <div
                            className={`size-7 rounded-lg border flex items-center justify-center transition-colors ${
                              isActive || isWorking
                                ? 'bg-gradient-to-br from-primary/25 to-primary/5 border-primary/30'
                                : 'bg-muted border-border'
                            } ${isWorking ? 'ea-avatar-live' : ''}`}
                          >
                            <IconRobot
                              className={`size-4 transition-colors ${
                                isActive || isWorking
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive animate-pulse" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate leading-tight">
                            {agent.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                            {agent.model}
                          </p>
                        </div>
                      </div>
                      {/* Thought cloud — trails out of the avatar while the
                          agent works, echoing the live turn's current step. */}
                      {activity && (
                        <div className="ea-pop mt-1 flex items-start gap-1">
                          <div className="flex flex-col items-center gap-[3px] pl-2 pt-0.5 shrink-0">
                            <span className="ea-thought-dot size-1" />
                            <span className="ea-thought-dot size-1.5" />
                          </div>
                          <div className="ea-thought-bubble min-w-0 flex-1 rounded-lg rounded-tl-sm border border-primary/25 bg-background/85 px-2 py-1">
                            <p className="text-[10px] leading-snug break-words line-clamp-2">
                              <span className="ea-shimmer-text">
                                {activity}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sessions panel ── */}
        {selectedAgent && (
          <div className="w-60 border-r flex flex-col shrink-0">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sessions
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={handleNewThread}
              >
                <IconPlus className="size-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-1.5 space-y-0.5">
              {!sessionsLoaded ? (
                <div className="space-y-1.5 p-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : (
                <>
                  {isDraft && (
                    <div
                      className={`rounded-md px-2.5 py-2 ${
                        activeThreadId &&
                        !sessions.some((s) => s.threadId === activeThreadId)
                          ? 'bg-accent'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconMessage2 className="size-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm truncate flex-1">New chat</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-5">
                        Unsaved · send a message
                      </p>
                    </div>
                  )}
                  {sessions.length === 0 && !isDraft ? (
                    <p className="text-xs text-muted-foreground px-2.5 py-3">
                      No sessions yet.
                    </p>
                  ) : (
                    sessions.map((s) => {
                      const active = s.threadId === activeThreadId;
                      const working =
                        !!agentId &&
                        chatStore.isThreadWorking(agentId, s.threadId);
                      return (
                        <button
                          key={s.threadId}
                          onClick={() => handleSelectSession(s.threadId)}
                          className={`group/sess w-full text-left rounded-md px-2.5 py-2 transition-all hover:bg-accent border-l-2 ${
                            active
                              ? 'bg-accent border-primary'
                              : 'border-transparent hover:border-border'
                          } ${working ? 'ea-working' : ''}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {working ? (
                              <IconLoader2 className="size-3.5 text-primary shrink-0 animate-spin" />
                            ) : (
                              <IconMessage2 className="size-3.5 text-muted-foreground shrink-0" />
                            )}
                            <p className="text-sm truncate flex-1">{s.title}</p>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) =>
                                handleDeleteSession(e, s.threadId)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleDeleteSession(e, s.threadId);
                                }
                              }}
                              className="opacity-0 group-hover/sess:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <IconTrash className="size-3.5" />
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-5">
                            {s.messageCount} message
                            {s.messageCount === 1 ? '' : 's'}
                          </p>
                        </button>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Chat area ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          onDragEnter={handleDragEnter}
          onDragOver={(e) => attachmentsEnabled && e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drop overlay — covers the whole conversation surface */}
          {isDragging && selectedAgent && (
            <div className="ea-pop absolute inset-3 z-20 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/6 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 pointer-events-none">
              <IconFileUpload className="size-9 text-primary" />
              <p className="text-sm font-medium text-primary">
                Drop files to attach
              </p>
              <p className="text-xs text-muted-foreground">
                images · PDF · Excel · Word · CSV
              </p>
            </div>
          )}

          {/* Ambient working glow — gradient blobs drift around the chat
              space for as long as a reply is streaming. */}
          {selectedAgent && chatLoading && (
            <div
              aria-hidden
              className="ea-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <span className="ea-ambient-blob ea-ambient-blob-1" />
              <span className="ea-ambient-blob ea-ambient-blob-2" />
            </div>
          )}

          {!selectedAgent ? (
            <div className="flex-1 flex items-center justify-center">
              <Empty>
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <IconMessageCircle />
                  </Empty.Media>
                  <Empty.Title>Select an agent</Empty.Title>
                  <Empty.Description>
                    Choose an agent from the sidebar to start a conversation.
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                ref={messagesBoxRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-auto p-4"
              >
                <div className="max-w-3xl mx-auto w-full space-y-4">
                  {messagesLoading ? (
                    <div className="p-2 space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-2/3 rounded-2xl" />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center gap-2 ea-msg-in">
                      <div className="relative mb-2">
                        <div className="ea-orb absolute -inset-5 rounded-full" />
                        <div className="relative size-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/8 to-transparent border border-primary/20 flex items-center justify-center">
                          <IconRobot className="size-8 text-primary" />
                        </div>
                      </div>
                      <p className="text-lg font-semibold">
                        {selectedAgent.name}
                      </p>
                      {selectedAgent.description && (
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {selectedAgent.description}
                        </p>
                      )}
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs mt-1"
                      >
                        {selectedAgent.provider} · {selectedAgent.model}
                      </Badge>
                      <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
                        {[
                          'What can you do?',
                          'Summarize my open tickets',
                          attachmentsEnabled
                            ? 'Read the file I attach and summarize it'
                            : 'List the latest customers',
                        ].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setInput(s);
                              textareaRef.current?.focus();
                            }}
                            className="ea-pop rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/4 transition-all hover:-translate-y-0.5"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => (
                        <MessageBubble
                          key={i}
                          msg={msg}
                          onRegenerate={
                            msg.role === 'assistant' &&
                            !msg.streaming &&
                            !chatLoading &&
                            i === messages.length - 1
                              ? handleRegenerate
                              : undefined
                          }
                          onRate={
                            msg.role === 'assistant' &&
                            !msg.streaming &&
                            msg.id &&
                            agentId &&
                            activeThreadId
                              ? (rating) =>
                                  chatStore.rateMessage(
                                    apolloClient,
                                    agentId,
                                    activeThreadId,
                                    msg.id!,
                                    rating,
                                  )
                              : undefined
                          }
                        />
                      ))}
                      {chatLoading && lastMsg?.role === 'user' && (
                        <WaitingIndicator />
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Jump to latest */}
              {showScrollDown && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="ea-pop absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full border border-border bg-background/95 backdrop-blur px-3 py-1.5 text-xs shadow-md hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <IconArrowDown className="size-3.5" />
                  Latest
                </button>
              )}

              {/* Composer */}
              <div className="p-3 pt-1 bg-background">
                <div className="max-w-3xl mx-auto w-full">
                  <div
                    className={`rounded-2xl border bg-background shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md ${
                      chatLoading ? 'border-primary/30' : 'border-border'
                    }`}
                  >
                    {pendingAtts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
                        {pendingAtts.map((att) => (
                          <ComposerAttachmentChip
                            key={att.id}
                            att={att}
                            onRemove={() => removeAttachment(att.id)}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5 items-end p-2">
                      {attachmentsEnabled && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.length)
                                addFiles(e.target.files);
                              e.target.value = '';
                            }}
                          />
                          <Tooltip.Provider>
                            <Tooltip>
                              <Tooltip.Trigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-9 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={
                                    chatLoading || pendingAtts.length >= 10
                                  }
                                >
                                  <IconPaperclip className="size-4" />
                                </Button>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                Attach files (images, PDF, Excel, Word, …)
                              </Tooltip.Content>
                            </Tooltip>
                          </Tooltip.Provider>
                        </>
                      )}
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e: any) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={`Message ${selectedAgent.name}…`}
                        rows={1}
                        className="ea-composer-textarea flex-1 min-h-9 max-h-40 resize-none py-2 bg-transparent"
                      />
                      {chatLoading ? (
                        <Tooltip.Provider>
                          <Tooltip>
                            <Tooltip.Trigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                className="size-9 shrink-0 border-primary/40 text-primary hover:bg-primary/8 transition-all"
                                onClick={handleStop}
                              >
                                <IconPlayerStopFilled className="size-4" />
                              </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              Stop generating (Esc)
                            </Tooltip.Content>
                          </Tooltip>
                        </Tooltip.Provider>
                      ) : (
                        <Button
                          size="icon"
                          className="size-9 shrink-0 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:scale-100"
                          onClick={handleSend}
                          disabled={!input.trim() || uploadsInFlight}
                        >
                          {uploadsInFlight ? (
                            <IconLoader2 className="size-4 animate-spin" />
                          ) : (
                            <IconSend className="size-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 pl-1 text-center">
                    Enter to send · Shift+Enter for new line · Esc to stop
                    {attachmentsEnabled && ' · drop or paste files to attach'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
