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
export const pendingApproval = (
  messages: Message[],
): { prompt: string; operations: ApprovedOp[] } | null => {
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant' || last.streaming) return null;
  const operations: ApprovedOp[] = [];
  for (const part of last.parts ?? []) {
    if (part.kind === 'tool') {
      const req = asApprovalRequest(part.call.result);
      if (req) operations.push({ operation: req.operation, args: req.args });
    }
  }
  if (!operations.length) return null;
  return {
    prompt: last.content?.trim() || 'Confirm this action?',
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
