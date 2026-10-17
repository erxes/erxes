import { lookup } from 'dns/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'net';
import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { z } from 'zod';
import {
  readFileFromStorage,
  readFileStreamFromStorage,
  sanitizeKey,
} from 'erxes-api-shared/utils';
import {
  AGENTS_FILE_MAX_BYTES,
  AGENTS_FILE_TEXT_MAX_BYTES,
  isAgentsImageMimeType,
  isAgentsTextMimeType,
  sniffImageMime,
  validateAgentsFileBytes,
} from '@/agents/fileValidation';
import {
  AGENTS_FILE_READ_TIMEOUT_MS,
  waitForAgentsFileOperation,
} from '@/agents/fileTimeout';

export const AGENTS_READ_FILE_MAX_BYTES = AGENTS_FILE_MAX_BYTES;
export const AGENTS_READ_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const BLOCKED_SCHEMES = /^(file|data|javascript|vbscript|blob|ftp|ws|wss):/i;

export class AgentsReadFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentsReadFileError';
  }
}

export const isPrivateIpv4 = (ip: string): boolean => {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
};

const ipv4FromMapped = (ip: string): string | null => {
  const lower = ip.toLowerCase();
  const match = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (match) {
    return match[1];
  }
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }
  return null;
};

export const isPrivateIp = (ip: string): boolean => {
  const mapped = ipv4FromMapped(ip);
  if (mapped) {
    return isPrivateIpv4(mapped);
  }
  const version = net.isIP(ip);
  if (version === 4) {
    return isPrivateIpv4(ip);
  }
  if (version === 6) {
    const normalized = ip.toLowerCase();
    return (
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80:')
    );
  }
  return true;
};

/** Browser-style compact IPv4 hostnames: 127.1, 2130706433. */
export const expandIpv4Hostname = (host: string): string | null => {
  if (net.isIP(host) === 4) {
    return host;
  }
  if (/^\d+$/.test(host)) {
    const n = Number(host);
    if (n >= 0 && n <= 0xffffffff) {
      return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
    }
  }
  const parts = host.split('.');
  if (!parts.length || parts.length > 4 || !parts.every((part) => /^\d+$/.test(part))) {
    return null;
  }
  const nums = parts.map(Number);
  if (nums.some((n) => n < 0)) {
    return null;
  }
  if (parts.length === 4 && nums.every((n) => n <= 255)) {
    return nums.join('.');
  }
  if (parts.length === 3 && nums[0] <= 255 && nums[1] <= 255 && nums[2] <= 0xffff) {
    return `${nums[0]}.${nums[1]}.${(nums[2] >> 8) & 255}.${nums[2] & 255}`;
  }
  if (parts.length === 2 && nums[0] <= 255 && nums[1] <= 0xffffff) {
    return `${nums[0]}.${(nums[1] >> 16) & 255}.${(nums[1] >> 8) & 255}.${nums[1] & 255}`;
  }
  return null;
};

const pathHasTraversal = (value: string): boolean => {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return (
    decoded.includes('\0') ||
    decoded.includes('\\') ||
    decoded.includes('..') ||
    value.includes('..') ||
    value.includes('\\')
  );
};

export const extractReadFileKey = (url: URL): string | null => {
  const path = url.pathname.replace(/\/+$/, '');
  if (path !== '/read-file' && !path.endsWith('/read-file')) {
    return null;
  }
  const key = url.searchParams.get('key');
  return key && key.trim() ? key.trim() : null;
};

export const isStorageKeyReference = (value: string): boolean =>
  Boolean(value.trim()) && !/^[a-z][a-z0-9+.-]*:/i.test(value.trim());

export const lookupPublicAddresses = async (hostname: string): Promise<string[]> => {
  const expanded = expandIpv4Hostname(hostname);
  if (expanded) {
    if (isPrivateIpv4(expanded)) {
      throw new AgentsReadFileError('This file location cannot be read.');
    }
    return [expanded];
  }
  if (net.isIP(hostname) === 6) {
    if (isPrivateIp(hostname)) {
      throw new AgentsReadFileError('This file location cannot be read.');
    }
    return [hostname];
  }
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  const ips = addresses.map((entry) => entry.address);
  if (!ips.length || ips.some((ip) => isPrivateIp(ip))) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }
  return ips;
};

export const assertReadableFileUrl = async (raw: string): Promise<{
  url: URL;
  addresses: string[];
}> => {
  const value = raw.trim();
  if (!value || value.includes('\0') || BLOCKED_SCHEMES.test(value)) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }
  if (pathHasTraversal(value)) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new AgentsReadFileError('This file location cannot be read.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AgentsReadFileError('This file location cannot be read.');
  }
  if (parsed.username || parsed.password) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }
  if (pathHasTraversal(`${parsed.pathname}${parsed.search}`)) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }

  const addresses = await lookupPublicAddresses(hostname);
  return { url: parsed, addresses };
};

const readLimitedStream = async (
  stream: Readable,
  signal: AbortSignal,
  maxBytes: number,
): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  let size = 0;
  await pipeline(
    stream,
    new Writable({
      write(chunk: Buffer, _encoding, callback) {
        size += chunk.length;
        if (size > maxBytes) {
          callback(new AgentsReadFileError('File is too large to read.'));
          return;
        }
        chunks.push(chunk);
        callback();
      },
    }),
    { signal },
  );
  return Buffer.concat(chunks);
};

const requestPinned = (
  url: URL,
  ip: string,
  signal: AbortSignal,
): Promise<{
  status: number;
  headers: http.IncomingHttpHeaders;
  stream: Readable;
  req: http.ClientRequest;
}> =>
  new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: ip,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: { Host: url.host, Accept: '*/*' },
        servername: url.hostname,
        setHost: false,
      },
      (res) => {
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          stream: res,
          req,
        });
      },
    );
    const abort = () => {
      req.destroy();
      reject(new AgentsReadFileError('Could not read the file.'));
    };
    signal.addEventListener('abort', abort, { once: true });
    req.on('error', () => {
      signal.removeEventListener('abort', abort);
      reject(new AgentsReadFileError('Could not read the file.'));
    });
    req.end();
  });

/** Pinned to pre-resolved public IPs. Follows a few redirects after re-checking each hop. */
const downloadHttp = async (
  start: URL,
  startAddresses: string[],
  signal: AbortSignal,
): Promise<{ bytes: Buffer; mimeType: string; url: string }> => {
  let current = start;
  let addresses = startAddresses;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const ip = addresses[0];
    if (!ip || isPrivateIp(ip)) {
      throw new AgentsReadFileError('This file location cannot be read.');
    }
    const { status, headers, stream, req } = await requestPinned(
      current,
      ip,
      signal,
    );
    if (status >= 300 && status < 400) {
      stream.resume();
      req.destroy();
      const location = headers.location;
      if (!location || hop === MAX_REDIRECTS) {
        throw new AgentsReadFileError('Could not read the file.');
      }
      const next = new URL(location, current);
      const checked = await assertReadableFileUrl(next.toString());
      current = checked.url;
      addresses = checked.addresses;
      continue;
    }
    if (status < 200 || status >= 300) {
      stream.resume();
      req.destroy();
      throw new AgentsReadFileError('Could not read the file.');
    }
    const length = Number(headers['content-length'] ?? 0);
    if (length > AGENTS_READ_FILE_MAX_BYTES) {
      stream.resume();
      req.destroy();
      throw new AgentsReadFileError('File is too large to read.');
    }
    const bytes = await readLimitedStream(
      stream,
      signal,
      AGENTS_READ_FILE_MAX_BYTES,
    );
    const mimeType = String(headers['content-type'] ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    return { bytes, mimeType, url: current.toString() };
  }
  throw new AgentsReadFileError('Could not read the file.');
};

/** Test seam. Production uses pinned HTTP(S) requests. */
export const httpTransport = { download: downloadHttp };

const readStorageKey = async (subdomain: string, raw: string): Promise<Buffer> => {
  const value = raw.trim();
  if (
    !value ||
    value.startsWith('/') ||
    pathHasTraversal(value) ||
    BLOCKED_SCHEMES.test(value)
  ) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }
  let key: string;
  try {
    key = sanitizeKey(value);
  } catch {
    throw new AgentsReadFileError('This file location cannot be read.');
  }
  const signal = AbortSignal.timeout(AGENTS_FILE_READ_TIMEOUT_MS);
  try {
    const stream = await waitForAgentsFileOperation(
      readFileStreamFromStorage({ subdomain, key }).then((opened) => {
        if (signal.aborted && opened instanceof Readable) {
          opened.destroy();
        }
        return opened;
      }),
      signal,
    );
    return await readLimitedStream(stream, signal, AGENTS_READ_FILE_MAX_BYTES);
  } catch (error) {
    // Cloudflare Images keys are not R2 objects. The platform's buffered
    // reader resolves those through the tenant's configured Images CDN.
    // Keep streaming for ordinary storage and never retry size/time limits.
    if (
      signal.aborted ||
      error instanceof AgentsReadFileError ||
      !/\.(png|jpe?g|gif|webp)$/i.test(key)
    ) {
      throw error;
    }
    const bytes = await waitForAgentsFileOperation(
      readFileFromStorage({ subdomain, key }),
      signal,
    );
    if (!bytes) {
      throw new AgentsReadFileError('Could not read the image from file storage. Please upload it again.');
    }
    if (bytes.length > AGENTS_READ_FILE_MAX_BYTES) {
      throw new AgentsReadFileError('File is too large to read.');
    }
    return bytes;
  }
};

export interface IAgentsReadFileResult {
  url: string;
  mimeType: string;
  kind: 'text' | 'image' | 'binary';
  text?: string;
  imageBase64?: string;
}

const classify = (
  mimeType: string,
  bytes: Buffer,
): { kind: IAgentsReadFileResult['kind']; mimeType: string } => {
  const sniffed = sniffImageMime(bytes);
  if (sniffed) {
    return { kind: 'image', mimeType: sniffed };
  }
  if (mimeType.startsWith('image/') && !isAgentsImageMimeType(mimeType)) {
    return { kind: 'binary', mimeType };
  }
  if (isAgentsImageMimeType(mimeType)) {
    return { kind: 'binary', mimeType };
  }
  if (isAgentsTextMimeType(mimeType) || mimeType.startsWith('text/')) {
    return { kind: 'text', mimeType: mimeType || 'text/plain' };
  }
  const asText = bytes.toString('utf8');
  if (bytes.length && Buffer.from(asText, 'utf8').equals(bytes) && !asText.includes('\0')) {
    return { kind: 'text', mimeType: mimeType || 'text/plain' };
  }
  return { kind: 'binary', mimeType: mimeType || 'application/octet-stream' };
};

export const isAllowedAttachmentUrl = (
  url: string,
  allowed: string[] | undefined,
): boolean => {
  if (!allowed || allowed.length === 0) {
    return false;
  }
  const trimmed = url.trim();
  if (allowed.includes(trimmed)) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    const key = extractReadFileKey(parsed);
    if (key && allowed.includes(key)) {
      return true;
    }
  } catch {
    // storage keys are compared exactly
  }
  return allowed.some((entry) => {
    try {
      const parsed = new URL(entry);
      return extractReadFileKey(parsed) === trimmed;
    } catch {
      return false;
    }
  });
};

const urlsFromStoredMessages = (messages: unknown[]): string[] => {
  const urls: string[] = [];
  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      continue;
    }
    const content = (message as { content?: { parts?: unknown[] } }).content;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    for (const part of parts) {
      if (
        !part ||
        typeof part !== 'object' ||
        (part as { type?: string }).type !== 'data-agents-files'
      ) {
        continue;
      }
      const files = (part as { data?: { files?: unknown } }).data?.files;
      if (!Array.isArray(files)) {
        continue;
      }
      for (const file of files) {
        if (file && typeof file === 'object' && typeof (file as { url?: unknown }).url === 'string') {
          urls.push((file as { url: string }).url);
        }
      }
    }
  }
  return urls;
};

export const readAgentsUploadedFile = async (input: {
  subdomain: string;
  url: string;
  allowedUrls?: string[];
}): Promise<IAgentsReadFileResult> => {
  const raw = input.url.trim();
  if (!isAllowedAttachmentUrl(raw, input.allowedUrls)) {
    throw new AgentsReadFileError('This file location cannot be read.');
  }

  let bytes: Buffer;
  let headerMime = '';

  if (isStorageKeyReference(raw)) {
    bytes = await readStorageKey(input.subdomain, raw);
  } else {
    const parsed = new URL(raw);
    const readFileKey = extractReadFileKey(parsed);
    if (readFileKey) {
      bytes = await readStorageKey(input.subdomain, readFileKey);
    } else {
      const checked = await assertReadableFileUrl(raw);
      const signal = AbortSignal.timeout(AGENTS_FILE_READ_TIMEOUT_MS);
      const downloaded = await httpTransport.download(
        checked.url,
        checked.addresses,
        signal,
      );
      bytes = downloaded.bytes;
      headerMime = downloaded.mimeType;
    }
  }

  if (!bytes.length) {
    throw new AgentsReadFileError('The file is empty.');
  }

  const { kind, mimeType } = classify(headerMime, bytes);
  if (kind === 'text') {
    if (bytes.length > AGENTS_FILE_TEXT_MAX_BYTES) {
      throw new AgentsReadFileError('File is too large to read.');
    }
    const textMime = isAgentsTextMimeType(mimeType) ? mimeType : 'text/plain';
    if (isAgentsTextMimeType(textMime)) {
      try {
        validateAgentsFileBytes(textMime, bytes);
      } catch {
        throw new AgentsReadFileError('The file is not valid UTF-8 text.');
      }
    }
    return {
      url: raw,
      mimeType,
      kind,
      text: bytes.toString('utf8'),
    };
  }
  if (kind === 'image') {
    if (bytes.length > AGENTS_READ_IMAGE_MAX_BYTES) {
      throw new AgentsReadFileError(
        'Images must be at most 2 MiB. Resize the image and upload it again.',
      );
    }
    return {
      url: raw,
      mimeType,
      kind,
      imageBase64: bytes.toString('base64'),
    };
  }
  return { url: raw, mimeType, kind };
};

export const buildReadFileTool = async () => {
  const { createTool } = await import('@mastra/core/tools');

  return createTool({
    id: 'readFile',
    description:
      'Read an uploaded chat attachment by its url from this conversation. Pass the url from the attachment metadata. Never invent urls.',
    inputSchema: z.object({
      url: z
        .string()
        .min(1)
        .describe('The attachment url from the user message metadata'),
    }),
    outputSchema: z.object({
      url: z.string(),
      mimeType: z.string(),
      kind: z.enum(['text', 'image', 'binary']),
      text: z.string().optional(),
      imageBase64: z.string().optional(),
    }),
    execute: async ({ url }, context) => {
      const subdomain = context?.requestContext?.get('subdomain');
      const userId = context?.requestContext?.get('userId');
      const threadId = context?.requestContext?.get('threadId');
      const stamped = context?.requestContext?.get('attachmentUrls');
      if (typeof subdomain !== 'string' || !subdomain) {
        throw new AgentsReadFileError('Could not read the file.');
      }

      let allowed = Array.isArray(stamped)
        ? stamped.filter((entry): entry is string => typeof entry === 'string')
        : [];
      if (!isAllowedAttachmentUrl(url, allowed) && typeof threadId === 'string' && typeof userId === 'string') {
        const { getAgentsMemory } = await import('./memory.js');
        const memory = await getAgentsMemory(subdomain);
        const thread = await memory.getThreadById({ threadId });
        if (thread && thread.resourceId === userId) {
          const recalled = await memory.recall({ threadId, perPage: 20 });
          allowed = [...allowed, ...urlsFromStoredMessages(recalled.messages ?? [])];
        }
      }

      try {
        return await readAgentsUploadedFile({
          subdomain,
          url,
          allowedUrls: allowed,
        });
      } catch (error) {
        if (error instanceof AgentsReadFileError) {
          throw error;
        }
        throw new AgentsReadFileError('Could not read the file.');
      }
    },
    toModelOutput: (output) => {
      if (output.kind === 'image' && output.imageBase64) {
        return {
          type: 'content',
          value: [
            { type: 'text', text: `Image (${output.mimeType})` },
            {
              type: 'image-data',
              data: output.imageBase64,
              mimeType: output.mimeType,
            },
          ],
        };
      }
      if (output.kind === 'text' && output.text) {
        return { type: 'text', value: output.text };
      }
      return {
        type: 'text',
        value: 'This file is not readable as text or an image.',
      };
    },
  });
};
