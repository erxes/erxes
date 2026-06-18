import { ExpectedError, sendTRPCMessage } from 'erxes-api-shared/utils';
import { createTTLCache } from '~/utils/ttlCache';

// ---------------------------------------------------------------------------
// Attachment storage — detection + retrieval.
//
// The plugin does NOT talk to S3/GCS/Azure itself. It reuses the erxes core
// upload pipeline: files are uploaded from the chat UI through core's
// /upload-file (which writes to whatever storage the instance already has
// configured), and read back through /read-file by key. This module only
// answers two questions:
//   1. "Is a usable storage configured on this instance?"  → getStorageStatus
//   2. "Give me the bytes of an uploaded file."            → fetchAttachmentBuffer
// ---------------------------------------------------------------------------

export interface StorageStatus {
  configured: boolean;
  serviceType: string; // AWS | CLOUDFLARE | AZURE | GCS | local | none
}

const STORAGE_CONFIG_CODES = [
  'UPLOAD_SERVICE_TYPE',
  'AWS_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'CLOUDFLARE_BUCKET_NAME',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_ACCESS_KEY_ID',
  'CLOUDFLARE_SECRET_ACCESS_KEY',
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_CONTAINER',
  'GOOGLE_CLOUD_STORAGE_BUCKET',
];

/** Read an env var, defaulting to the empty string. */
const env = (name: string) => process.env[name] || '';

// Decide whether the configured service has the credentials it needs. Mirrors
// the requirements core's upload.ts enforces at upload time, so the chat UI
// can hide the attach button instead of letting uploads fail late.
export function evaluateStorageConfigs(
  configs: Record<string, string>,
): StorageStatus {
  /** Resolve a config code: fetched configs first, then the environment. */
  const read = (code: string) => configs[code] || env(code) || '';
  const serviceType = (read('UPLOAD_SERVICE_TYPE') || 'AWS').toString();

  switch (serviceType) {
    case 'local':
      // Local disk storage always works — core writes into its uploads folder.
      return { configured: true, serviceType };
    case 'AWS':
      return {
        configured: Boolean(
          read('AWS_BUCKET') &&
          read('AWS_ACCESS_KEY_ID') &&
          read('AWS_SECRET_ACCESS_KEY'),
        ),
        serviceType,
      };
    case 'CLOUDFLARE':
      return {
        configured: Boolean(
          read('CLOUDFLARE_BUCKET_NAME') &&
          read('CLOUDFLARE_ACCOUNT_ID') &&
          read('CLOUDFLARE_ACCESS_KEY_ID') &&
          read('CLOUDFLARE_SECRET_ACCESS_KEY'),
        ),
        serviceType,
      };
    case 'AZURE':
      return {
        configured: Boolean(
          read('AZURE_STORAGE_CONNECTION_STRING') &&
          read('AZURE_STORAGE_CONTAINER'),
        ),
        serviceType,
      };
    case 'GCS':
      return {
        configured: Boolean(read('GOOGLE_CLOUD_STORAGE_BUCKET')),
        serviceType,
      };
    default:
      return { configured: false, serviceType };
  }
}

// Storage config rarely changes — cache per subdomain briefly so every chat
// page load / stream request doesn't round-trip to core.
const STATUS_TTL_MS = 60_000;
const statusCache = createTTLCache<StorageStatus>(STATUS_TTL_MS);

/** Fetch (and briefly cache) the instance's upload-storage status. */
export async function getStorageStatus(
  subdomain: string,
): Promise<StorageStatus> {
  const cached = statusCache.get(subdomain);
  if (cached) return cached;

  let configs: Record<string, string> = {};
  try {
    configs =
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'configs',
        action: 'getConfigs',
        method: 'query',
        input: { codes: STORAGE_CONFIG_CODES },
        defaultValue: {},
      })) || {};
  } catch {
    // Core unreachable — report unconfigured rather than crashing the query.
    return { configured: false, serviceType: 'none' };
  }

  const status = evaluateStorageConfigs(configs);
  statusCache.set(subdomain, status);
  return status;
}

// ─── File retrieval ──────────────────────────────────────────────────────────

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // mirrors core's upload cap

// Attachment `url` values are either a storage key (private files — read back
// through core's /read-file) or a full public URL (FILE_SYSTEM_PUBLIC=true).
export function isFullUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Download an attachment through core's /read-file (or directly for URLs). */
export async function fetchAttachmentBuffer(params: {
  erxesApiUrl: string;
  keyOrUrl: string;
  name?: string;
}): Promise<{ buffer: Buffer; contentType: string }> {
  const { erxesApiUrl, keyOrUrl, name } = params;

  const target = isFullUrl(keyOrUrl)
    ? keyOrUrl
    : `${(erxesApiUrl || 'http://localhost:4000').replace(/\/$/, '')}/read-file?key=${encodeURIComponent(keyOrUrl)}&inline=true`;

  const res = await fetch(target, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(
      `Could not read file "${name || keyOrUrl}" from storage (HTTP ${res.status})`,
    );
  }

  const lenHeader = Number(res.headers.get('content-length') || 0);
  if (lenHeader > MAX_ATTACHMENT_BYTES) {
    throw new ExpectedError(
      `File "${name || keyOrUrl}" is too large to read (max 20MB)`,
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_ATTACHMENT_BYTES) {
    throw new ExpectedError(
      `File "${name || keyOrUrl}" is too large to read (max 20MB)`,
    );
  }

  return { buffer, contentType: res.headers.get('content-type') || '' };
}
