import { REACT_APP_API_URL, formatBytes } from 'erxes-ui';
import {
  ApprovedOp,
  ChatAttachment,
  Message,
  MessageMeta,
  TurnPart,
  asApprovalRequest,
} from '~/modules/chat/types';

/**
 * A settled assistant turn that ended on one or more destructive ops awaiting
 * the user's go-ahead. Returns the model's confirmation question + the exact ops
 * to replay on approval, or null when nothing is pending. Derived from the last
 * message so it clears automatically once the next turn runs.
 */
// The model often narrates its whole turn before the confirmation; keep only the
// last couple of sentences so the bar stays short.
const lastSentences = (text: string, max = 2): string => {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t
    .split(/(?<=[.?!])\s+/)
    .slice(-max)
    .join(' ');
};

export const pendingApproval = (
  messages: Message[],
): { prompt: string; operations: ApprovedOp[] } | null => {
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant' || last.streaming) return null;
  let summary: string | undefined;
  const operations: ApprovedOp[] = [];
  for (const part of last.parts ?? []) {
    if (part.kind === 'tool') {
      const req = asApprovalRequest(part.call.result);
      if (req) {
        // Prefer the model's dedicated request_approval summary.
        if (req.summary && !summary) summary = req.summary;
        operations.push(...req.operations);
      }
    }
  }
  if (!operations.length) return null;
  return {
    // request_approval summary first; otherwise the last sentences of the reply.
    prompt: summary || lastSentences(last.content ?? '') || 'Confirm this action?',
    operations,
  };
};

/** Random base36 suffix from the Web Crypto API (Math.random is flagged as a
 * weak PRNG even for non-secret ids — getRandomValues works on any origin). */
export const randomIdSuffix = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('');
};

export const generateThreadId = (): string =>
  `thread-${Date.now()}-${randomIdSuffix(7)}`;

// Rebuild ordered parts from a persisted message's meta. Older messages only
// carry the flat {thinking, toolCalls} aggregates — synthesize a best-effort
// order for those (one thinking section, then the tools).
export const partsFromMeta = (
  meta: MessageMeta | null | undefined,
): TurnPart[] | undefined => {
  if (!meta) return undefined;
  if (Array.isArray(meta.parts) && meta.parts.length) {
    return meta.parts.map((p) =>
      p.kind === 'tool'
        ? { kind: 'tool' as const, call: p.call ?? { toolName: '' } }
        : { kind: 'thinking' as const, text: p.text ?? '', done: true },
    );
  }
  const parts: TurnPart[] = [];
  if (meta.thinking)
    parts.push({ kind: 'thinking', text: meta.thinking, done: true });
  for (const call of meta.toolCalls ?? []) parts.push({ kind: 'tool', call });
  return parts.length ? parts : undefined;
};

// Split streaming markdown into completed blocks + the in-progress trailing
// block. Blocks are delimited by blank lines, except inside a fenced code block
// (where blank lines are content). The caller freezes the completed blocks so
// finished text never reflows as more tokens arrive, and only re-renders the
// trailing block. Heuristic by design: it only governs the transient streaming
// view; the settled message is rendered from the whole string, so any imperfect
// split (e.g. a loose list momentarily breaking) resolves on completion.
export const splitStreamingMarkdown = (
  content: string,
): { blocks: string[]; tail: string } => {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;

  for (const line of lines) {
    const marker = /^\s*(```+|~~~+)/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (line.trim().startsWith(fence)) fence = null;
    }
    if (fence === null && line.trim() === '') {
      if (current.length) {
        blocks.push(current.join('\n'));
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  return { blocks, tail: current.join('\n') };
};

export const formatJson = (value: unknown): string => {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

// File size for chips/cards — defers to the erxes-ui house formatter, keeping
// the empty-string behaviour for missing/zero sizes.
export const formatFileSize = (size?: number): string =>
  !size || size <= 0 ? '' : formatBytes(size);

export const isImageAttachment = (att: { name: string; type?: string }) =>
  att.type?.startsWith('image/') ||
  /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(att.name);

export const attachmentSrc = (att: ChatAttachment) =>
  /^https?:\/\//i.test(att.url)
    ? att.url
    : `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
        att.url,
      )}&inline=true&name=${encodeURIComponent(att.name)}`;

// Upload one file through core's /upload-file (same endpoint and storage the
// rest of erxes uses). Returns the storage key or public URL.
export const uploadToStorage = async (file: File): Promise<string> => {
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
};
