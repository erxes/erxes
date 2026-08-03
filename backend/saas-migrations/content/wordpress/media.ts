import { lookup } from 'node:dns/promises';
import type {
  LookupAddress,
  LookupAllOptions,
  LookupOneOptions,
  LookupOptions,
} from 'node:dns';
import { copyFile, mkdir, mkdtemp, open, rm } from 'node:fs/promises';
import { isIP } from 'node:net';
import { basename, extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import { Db } from 'mongodb';
import { Agent, fetch, type Response } from 'undici';

import { generateId } from './generateId';
import {
  ErxesAttachment,
  MediaImportFailure,
  MediaImportResult,
  WordPressImportPlan,
  WordPressMappingDocument,
  WordPressMediaSource,
} from './types';

interface ImportMediaOptions {
  db: Db;
  plan: WordPressImportPlan;
  targetSubdomain: string;
  maxBytes: number;
  timeoutMs: number;
  concurrency: number;
}

interface UploadFileOptions {
  subdomain: string;
  filePath: string;
  fileName: string;
  mimetype: string;
}

type UploadFile = (options: UploadFileOptions) => Promise<string>;

interface UploadRuntime {
  uploadFile: UploadFile;
  disconnect?: () => void;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  '.avif': 'image/avif',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
};

const createLocalUpload = async (): Promise<UploadFile> => {
  const uploadsDirectory =
    process.env.LOCAL_UPLOADS_DIR ||
    resolve(__dirname, '../../../core-api/src/utils/private/uploads');

  await mkdir(uploadsDirectory, { recursive: true });

  return async ({ filePath, fileName }) => {
    const storedFileName = `${generateId()}-${fileName}`;
    await copyFile(filePath, join(uploadsDirectory, storedFileName));
    return storedFileName;
  };
};

const createUploadRuntime = async (): Promise<UploadRuntime> => {
  if (process.env.UPLOAD_SERVICE_TYPE?.toLowerCase() === 'local') {
    return { uploadFile: await createLocalUpload() };
  }

  const [redisModule, uploadModule] = await Promise.all([
    import('erxes-api-shared/utils/redis'),
    import('erxes-api-shared/utils/file/upload'),
  ]);

  return {
    uploadFile: uploadModule.uploadFileToStorage,
    disconnect: () => redisModule.redis.disconnect(),
  };
};

const isPrivateIpv4 = (address: string): boolean => {
  const parts = address.split('.').map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [first, second, third] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 &&
      ((second === 0 && [0, 2].includes(third)) || second === 168)) ||
    (first === 198 &&
      ([18, 19].includes(second) || (second === 51 && third === 100))) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
};

const isPrivateAddress = (address: string): boolean => {
  if (isIP(address) === 4) {
    return isPrivateIpv4(address);
  }

  const normalized = address.toLowerCase();

  if (normalized.startsWith('::ffff:')) {
    return isPrivateIpv4(normalized.slice(7));
  }

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    normalized.startsWith('fec') ||
    normalized.startsWith('fed') ||
    normalized.startsWith('fee') ||
    normalized.startsWith('fef') ||
    normalized.startsWith('ff')
  );
};

interface ValidatedRemoteUrl {
  url: URL;
  address: string;
  family: number;
}

interface SafeFetchResult {
  response: Response;
  finalUrl: URL;
  close: () => Promise<void>;
}

type LookupOneCallback = (
  error: NodeJS.ErrnoException | null,
  address: string,
  family: number,
) => void;

type LookupAllCallback = (
  error: NodeJS.ErrnoException | null,
  addresses: LookupAddress[],
) => void;

interface PinnedDnsLookup {
  (
    hostname: string,
    options: LookupOneOptions,
    callback: LookupOneCallback,
  ): void;
  (
    hostname: string,
    options: LookupAllOptions,
    callback: LookupAllCallback,
  ): void;
}

export const createPinnedDnsLookup = (
  address: string,
  family: number,
): PinnedDnsLookup => {
  function pinnedDnsLookup(
    hostname: string,
    options: LookupOneOptions,
    callback: LookupOneCallback,
  ): void;
  function pinnedDnsLookup(
    hostname: string,
    options: LookupAllOptions,
    callback: LookupAllCallback,
  ): void;
  function pinnedDnsLookup(
    _hostname: string,
    options: LookupOptions,
    callback: LookupOneCallback | LookupAllCallback,
  ): void {
    // Undici requests all addresses at runtime even though Node's connector
    // types expose only the single-address callback.
    if (options.all) {
      (callback as LookupAllCallback)(null, [{ address, family }]);
      return;
    }

    (callback as LookupOneCallback)(null, address, family);
  }

  return pinnedDnsLookup;
};

export const formatMediaImportError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const messages: string[] = [];
  const seen = new Set<Error>();
  let current: unknown = error;

  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);

    if (current.message && !messages.includes(current.message)) {
      messages.push(current.message);
    }

    current = 'cause' in current ? current.cause : undefined;
  }

  return messages.join(': ') || error.name;
};

const normalizeHostname = (hostname: string): string =>
  hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;

const validateWordPressMediaUrl = async (
  value: string,
): Promise<ValidatedRemoteUrl> => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid media URL: ${value}`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Unsupported media URL protocol: ${url.protocol}`);
  }

  if (
    url.username ||
    url.password ||
    ['localhost', 'localhost.localdomain'].includes(url.hostname.toLowerCase())
  ) {
    throw new Error(`Unsafe media URL host: ${url.hostname}`);
  }

  const hostname = normalizeHostname(url.hostname);
  const literalFamily = isIP(hostname);
  const addresses = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await lookup(hostname, { all: true });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new Error(`Media URL resolves to a private address: ${url.hostname}`);
  }

  return {
    url,
    address: addresses[0].address,
    family: addresses[0].family,
  };
};

const fetchWithSafeRedirects = async (
  initialUrl: string,
  signal: AbortSignal,
): Promise<SafeFetchResult> => {
  let validated = await validateWordPressMediaUrl(initialUrl);

  for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
    const { address, family, url } = validated;
    const dispatcher = new Agent({
      connect: {
        lookup: createPinnedDnsLookup(address, family),
      },
    });
    let response: Response;

    try {
      response = await fetch(url, {
        dispatcher,
        redirect: 'manual',
        signal,
        headers: {
          'user-agent': 'erxes-wordpress-importer/1.0',
        },
      });
    } catch (error) {
      await dispatcher.destroy();
      throw error;
    }

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.has('location')
    ) {
      if (redirectCount === 5) {
        await response.body?.cancel();
        await dispatcher.destroy();
        throw new Error('Media download exceeded five redirects.');
      }

      const location = response.headers.get('location') as string;
      await response.body?.cancel();
      await dispatcher.destroy();
      validated = await validateWordPressMediaUrl(
        new URL(location, url).toString(),
      );
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel();
      await dispatcher.destroy();
      throw new Error(
        `Media download returned HTTP ${response.status} ${response.statusText}.`,
      );
    }

    return {
      response,
      finalUrl: url,
      close: () => dispatcher.destroy(),
    };
  }

  throw new Error('Media download redirect handling failed.');
};

const sanitizeFileName = (
  suggestedName: string,
  finalUrl: URL,
  sourceId: string,
): string => {
  let urlName = '';

  try {
    urlName = decodeURIComponent(basename(finalUrl.pathname));
  } catch {
    urlName = basename(finalUrl.pathname);
  }

  const candidate = suggestedName || urlName || `wordpress-media-${sourceId}`;
  const sanitized = basename(candidate).replace(/[^a-zA-Z0-9._-]+/g, '-');

  return sanitized || `wordpress-media-${sourceId}`;
};

const validateWordPressMediaType = (
  fileName: string,
  headerMime: string,
): void => {
  if (
    ['application/xhtml+xml', 'image/svg+xml', 'text/html'].includes(headerMime)
  ) {
    throw new Error(
      `Media URL returned ${headerMime} instead of a downloadable file.`,
    );
  }

  if (extname(fileName).toLowerCase() === '.svg') {
    throw new Error('SVG media files are not imported.');
  }
};

const downloadMedia = async (
  media: WordPressMediaSource,
  directory: string,
  maxBytes: number,
  timeoutMs: number,
): Promise<{
  filePath: string;
  fileName: string;
  mimeType: string;
  size: number;
}> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let closeResponse: (() => Promise<void>) | undefined;

  try {
    const { response, finalUrl, close } = await fetchWithSafeRedirects(
      media.sourceUrl,
      controller.signal,
    );
    closeResponse = close;
    const contentLength = Number.parseInt(
      response.headers.get('content-length') || '0',
      10,
    );

    if (contentLength > maxBytes) {
      throw new Error(
        `Media is ${contentLength} bytes, exceeding the ${maxBytes}-byte limit.`,
      );
    }

    if (!response.body) {
      throw new Error('Media response has no body.');
    }

    const headerMime = (response.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    const fileName = sanitizeFileName(media.fileName, finalUrl, media.sourceId);

    try {
      validateWordPressMediaType(fileName, headerMime);
    } catch (error) {
      await response.body.cancel();
      throw error;
    }

    const extension = extname(fileName).toLowerCase();
    const safeSourceId = media.sourceId.replace(/[^a-zA-Z0-9_-]+/g, '_');
    const filePath = join(directory, `${safeSourceId}-${fileName}`);
    const file = await open(filePath, 'wx');
    const reader = response.body.getReader();
    let size = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        size += value.byteLength;

        if (size > maxBytes) {
          await reader.cancel();
          throw new Error(
            `Media exceeded the ${maxBytes}-byte limit while downloading.`,
          );
        }

        await file.write(value);
      }
    } finally {
      await file.close();
    }

    const mimeType =
      headerMime || MIME_BY_EXTENSION[extension] || 'application/octet-stream';

    return { filePath, fileName, mimeType, size };
  } finally {
    clearTimeout(timeout);
    await closeResponse?.();
  }
};

const existingMediaAttachments = async (
  db: Db,
  plan: WordPressImportPlan,
): Promise<Map<string, ErxesAttachment>> => {
  const sourceIds = plan.media.map(({ sourceId }) => sourceId);

  if (sourceIds.length === 0) {
    return new Map();
  }

  const mappings = await db
    .collection<WordPressMappingDocument>('migration_wordpress_mappings')
    .find({
      source: 'wordpress',
      sourceSite: plan.sourceSite,
      clientPortalId: plan.clientPortalId,
      sourceType: 'attachment',
      sourceId: { $in: sourceIds },
      targetUrl: { $type: 'string' },
    })
    .toArray();

  return new Map(
    mappings
      .filter(
        (
          mapping,
        ): mapping is WordPressMappingDocument & {
          targetUrl: string;
          mediaName: string;
          mediaType: string;
        } =>
          Boolean(mapping.targetUrl && mapping.mediaName && mapping.mediaType),
      )
      .map((mapping) => [
        mapping.sourceId,
        {
          name: mapping.mediaName,
          url: mapping.targetUrl,
          size: mapping.mediaSize || 0,
          type: mapping.mediaType,
        },
      ]),
  );
};

const updateMediaMapping = (
  mappingsBySourceId: Map<string, WordPressMappingDocument>,
  sourceId: string,
  attachment: ErxesAttachment,
): WordPressMappingDocument | undefined => {
  const mapping = mappingsBySourceId.get(sourceId);

  if (!mapping) {
    return undefined;
  }

  mapping.targetUrl = attachment.url;
  mapping.mediaName = attachment.name;
  mapping.mediaType = attachment.type;
  mapping.mediaSize = attachment.size;
  mapping.updatedAt = new Date();

  return mapping;
};

const persistMediaMapping = async (
  db: Db,
  mapping: WordPressMappingDocument,
): Promise<void> => {
  const { _id, ...ownedFields } = mapping;

  await db
    .collection<WordPressMappingDocument>('migration_wordpress_mappings')
    .updateOne(
      { _id },
      {
        $set: ownedFields,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
};

export const importWordPressMedia = async ({
  db,
  plan,
  targetSubdomain,
  maxBytes,
  timeoutMs,
  concurrency,
}: ImportMediaOptions): Promise<MediaImportResult> => {
  if (!Number.isInteger(concurrency) || concurrency <= 0) {
    throw new Error(`Invalid media concurrency: ${concurrency}`);
  }

  const attachments = await existingMediaAttachments(db, plan);
  const failures: MediaImportFailure[] = [];
  const mappingsBySourceId = new Map(
    plan.mappings
      .filter(({ sourceType }) => sourceType === 'attachment')
      .map((mapping) => [mapping.sourceId, mapping]),
  );
  const pending = plan.media.filter(
    ({ sourceId }) => !attachments.has(sourceId),
  );

  for (const [sourceId, attachment] of attachments) {
    updateMediaMapping(mappingsBySourceId, sourceId, attachment);
  }

  if (pending.length === 0) {
    return { attachments, failures };
  }

  const uploadRuntime = await createUploadRuntime();
  const directory = await mkdtemp(join(tmpdir(), 'erxes-wordpress-'));
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < pending.length) {
      const media = pending[nextIndex];
      nextIndex += 1;

      try {
        const downloaded = await downloadMedia(
          media,
          directory,
          maxBytes,
          timeoutMs,
        );
        const uploadedUrl = await uploadRuntime.uploadFile({
          subdomain: targetSubdomain,
          filePath: downloaded.filePath,
          fileName: downloaded.fileName,
          mimetype: downloaded.mimeType,
        });

        if (!uploadedUrl) {
          throw new Error('The erxes storage service returned an empty URL.');
        }

        const attachment: ErxesAttachment = {
          name: downloaded.fileName,
          url: uploadedUrl,
          size: downloaded.size,
          type: downloaded.mimeType,
        };

        const mapping = updateMediaMapping(
          mappingsBySourceId,
          media.sourceId,
          attachment,
        );

        if (!mapping) {
          throw new Error(
            `Missing migration mapping for WordPress attachment ${media.sourceId}.`,
          );
        }

        await persistMediaMapping(db, mapping);
        attachments.set(media.sourceId, attachment);
      } catch (error) {
        failures.push({
          sourceId: media.sourceId,
          sourceUrl: media.sourceUrl,
          message: formatMediaImportError(error),
        });
      }
    }
  };

  try {
    await Promise.all(
      Array.from({ length: Math.min(concurrency, pending.length) }, () =>
        worker(),
      ),
    );
  } finally {
    uploadRuntime.disconnect?.();
    await rm(directory, { recursive: true, force: true });
  }

  return { attachments, failures };
};

const addAttachment = (
  plan: WordPressImportPlan,
  collection: 'cms_posts' | 'cms_pages',
  targetId: string,
  attachment: ErxesAttachment,
): void => {
  if (collection === 'cms_posts') {
    const post = plan.posts.find(({ _id }) => _id === targetId);

    if (!post) {
      return;
    }

    if (attachment.type.startsWith('image/')) {
      post.images = [...(post.images || []), attachment];
    } else {
      post.attachments = [...(post.attachments || []), attachment];
    }

    return;
  }

  const page = plan.pages.find(({ _id }) => _id === targetId);

  if (!page) {
    return;
  }

  if (attachment.type.startsWith('image/')) {
    page.pageImages = [...(page.pageImages || []), attachment];
  } else {
    page.attachments = [...(page.attachments || []), attachment];
  }
};

const normalizeMediaUrl = (value: string): string => {
  try {
    const url = new URL(value.replaceAll('&amp;', '&'));
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return value;
  }
};

const removeWordPressImageVariant = (value: string): string =>
  value.replace(/(?:-scaled)?(?:-\d+x\d+)?(?=\.[^./]+$)/, '');

const rewriteMediaUrls = (
  content: string,
  replacements: Map<string, string>,
): string =>
  content.replace(/https?:\/\/[^"'\s<>)]+/g, (matchedUrl) => {
    const normalized = normalizeMediaUrl(matchedUrl);
    return (
      replacements.get(normalized) ||
      replacements.get(removeWordPressImageVariant(normalized)) ||
      matchedUrl
    );
  });

const setFeaturedAttachment = (
  plan: WordPressImportPlan,
  target: WordPressMediaSource['featuredTargets'][number],
  attachment: ErxesAttachment,
): void => {
  if (target.collection === 'cms_posts') {
    const post = plan.posts.find(({ _id }) => _id === target.targetId);

    if (post) {
      post.thumbnail = attachment;
    }

    return;
  }

  const page = plan.pages.find(({ _id }) => _id === target.targetId);

  if (page) {
    page.thumbnail = attachment;
  }
};

const applyMediaAttachment = (
  plan: WordPressImportPlan,
  media: WordPressMediaSource,
  attachment: ErxesAttachment,
  replacements: Map<string, string>,
): void => {
  replacements.set(normalizeMediaUrl(media.sourceUrl), attachment.url);

  if (media.parentTarget) {
    addAttachment(
      plan,
      media.parentTarget.collection,
      media.parentTarget.targetId,
      attachment,
    );
  }

  for (const target of media.featuredTargets) {
    setFeaturedAttachment(plan, target, attachment);
  }
};

const buildWordPressSourceAttachment = (
  media: WordPressMediaSource,
): ErxesAttachment => {
  const extension = extname(media.fileName).toLowerCase();

  return {
    name: media.fileName,
    url: media.sourceUrl,
    size: 0,
    type: MIME_BY_EXTENSION[extension] || 'application/octet-stream',
  };
};

const rewriteImportPlanMediaUrls = (
  plan: WordPressImportPlan,
  replacements: Map<string, string>,
): void => {
  for (const post of plan.posts) {
    post.content = rewriteMediaUrls(post.content, replacements);
    post.excerpt = rewriteMediaUrls(post.excerpt, replacements);
  }

  for (const page of plan.pages) {
    page.content = rewriteMediaUrls(page.content, replacements);
    page.description = rewriteMediaUrls(page.description, replacements);
  }

  for (const translation of plan.translations) {
    translation.content = rewriteMediaUrls(translation.content, replacements);
    translation.excerpt = translation.excerpt
      ? rewriteMediaUrls(translation.excerpt, replacements)
      : translation.excerpt;
  }
};

export const applyMediaToImportPlan = (
  plan: WordPressImportPlan,
  result: MediaImportResult,
): void => {
  const replacements = new Map<string, string>();

  for (const media of plan.media) {
    const attachment =
      result.attachments.get(media.sourceId) ||
      buildWordPressSourceAttachment(media);

    applyMediaAttachment(plan, media, attachment, replacements);
  }

  rewriteImportPlanMediaUrls(plan, replacements);
};
