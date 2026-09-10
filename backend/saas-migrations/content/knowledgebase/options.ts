import { ImportOptions } from './types';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const readOptions = (
  env: NodeJS.ProcessEnv = process.env,
): ImportOptions => {
  const required = (name: string): string => {
    const value = env[name]?.trim();
    if (!value) throw new Error(`${name} is required.`);
    return value;
  };
  const positive = (name: string, fallback: number): number => {
    const value = env[name] ?? String(fallback);
    const parsed = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(parsed) || parsed < 1) {
      throw new Error(`${name} must be a positive integer.`);
    }
    return parsed;
  };
  const flag = (env.DRY_RUN ?? 'true').trim().toLowerCase();
  if (!['true', 'false', '1', '0'].includes(flag)) {
    throw new Error('DRY_RUN must be true, false, 1, or 0.');
  }
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(env.KB_AUTHOR_MAP || '{}');
  } catch {
    throw new Error(
      'KB_AUTHOR_MAP must be a JSON object of source user IDs to target user IDs.',
    );
  }
  if (!isRecord(parsed)) throw new Error('KB_AUTHOR_MAP must be an object.');
  const authorMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.trim() || typeof value !== 'string' || !value.trim()) {
      throw new Error(
        'KB_AUTHOR_MAP keys and values must be nonempty user IDs.',
      );
    }
    Object.defineProperty(authorMap, key, {
      value: value.trim(),
      enumerable: true,
    });
  }
  const httpUrl = (name: string): string | undefined => {
    const value = env[name]?.trim();
    if (!value) return undefined;
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${name} must be an absolute HTTP(S) URL.`);
    }
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      throw new Error(`${name} must be an HTTP(S) URL without credentials.`);
    }
    return value;
  };
  const sourceArticleUrlTemplate = httpUrl('KB_ARTICLE_URL_TEMPLATE');
  if (sourceArticleUrlTemplate && !sourceArticleUrlTemplate.includes('{id}')) {
    throw new Error('KB_ARTICLE_URL_TEMPLATE must contain {id}.');
  }
  return {
    mongoUrl: env.CORE_MONGO_URL || required('MONGO_URL'),
    sourceSubdomain: required('SOURCE_SUBDOMAIN'),
    targetSubdomain: required('TARGET_SUBDOMAIN'),
    clientPortalId: required('CLIENT_PORTAL_ID'),
    topicIds: [
      ...new Set(
        (env.KB_TOPIC_IDS || '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ],
    authorMap,
    fallbackAuthorId: env.ADMIN_USER_ID?.trim() || undefined,
    dryRun: flag === 'true' || flag === '1',
    batchSize: Math.min(positive('BATCH_SIZE', 500), 1000),
    maxDocuments: positive('KB_MAX_DOCUMENTS', 100000),
    maxBytes: positive('KB_MAX_BYTES', 134217728),
    sourceArticleUrlTemplate,
    mediaBaseUrl: httpUrl('KB_MEDIA_BASE_URL'),
  };
};
