import * as AWS from 'aws-sdk';
import { randomAlphanumeric, sendTRPCMessage } from 'erxes-api-shared/utils';
import { debugError } from './debuggers';
import { validateMediaUrl } from './urlValidation';

export const createAWS = async (subdomain: string) => {
  const {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID,
  } = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getFileUploadConfigs',
    input: {},
  });
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET) {
    throw new Error('AWS credentials are not configured');
  }

  const options: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    s3ForcePathStyle?: boolean;
  } = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };

  if (String(AWS_FORCE_PATH_STYLE) === 'true') {
    options.s3ForcePathStyle = true;
  }

  if (AWS_COMPATIBLE_SERVICE_ENDPOINT) {
    options.endpoint = AWS_COMPATIBLE_SERVICE_ENDPOINT;
  }

  // initialize s3
  return new AWS.S3(options);
};

// Define a simple in-memory cache (outside the function scope)

type UploadConfig = { AWS_BUCKET?: string; [k: string]: any } | null;
let cachedUploadConfig: UploadConfig = null;
let fetchUploadConfigPromise: Promise<UploadConfig | null> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export const uploadMedia = async (
  subdomain: string,
  url: string,
  video: boolean,
) => {
  try {
    validateMediaUrl(url);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    debugError(`SSRF protection blocked media fetch: ${message}`);
    return null;
  }

  const mediaFile = `uploads/${randomAlphanumeric(16)}.${
    video ? 'mp4' : 'jpg'
  }`;

  // 1. Ensure we have cachedUploadConfig (with promise-based concurrency control)
  if (!cachedUploadConfig) {
    if (fetchUploadConfigPromise) {
      try {
        cachedUploadConfig = await fetchUploadConfigPromise;
      } catch (err) {
        debugError(`Failed awaiting ongoing fetch: ${err?.message ?? err}`);
        return null;
      }
    } else {
      fetchUploadConfigPromise = sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'configs',
        action: 'getFileUploadConfigs',
        input: {},
      })
        .then((res) => {
          cachedUploadConfig = res;
          lastFetchTime = Date.now();
          return res;
        })
        .catch((err) => {
          debugError(`Failed to fetch upload config: ${err?.message ?? err}`);
          cachedUploadConfig = null;
          throw err;
        })
        .finally(() => {
          fetchUploadConfigPromise = null;
        });

      try {
        await fetchUploadConfigPromise;
      } catch {
        return null;
      }
    }
  } else if (
    Date.now() - lastFetchTime > CACHE_TTL_MS &&
    !fetchUploadConfigPromise
  ) {
    fetchUploadConfigPromise = sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'configs',
      action: 'getFileUploadConfigs',
      input: {},
    })
      .then((res) => {
        cachedUploadConfig = res;
        lastFetchTime = Date.now();
        return res;
      })
      .catch((err) => {
        debugError(`Background refresh failed: ${err?.message ?? err}`);
        return cachedUploadConfig;
      })
      .finally(() => {
        fetchUploadConfigPromise = null;
      });
  }

  if (!cachedUploadConfig) {
    debugError(`Upload config unavailable after retry`);
    return null;
  }

  const { AWS_BUCKET } = cachedUploadConfig as any;
  try {
    const s3 = await createAWS(subdomain);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'error',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const data = await s3
        .upload({
          Bucket: AWS_BUCKET,
          Key: mediaFile,
          Body: buffer,
          ACL: 'public-read',
          ContentType: video ? 'video/mp4' : 'image/jpeg',
        })
        .promise();

      return data.Location;
    } finally {
      clearTimeout(timeout);
    }
  } catch (e) {
    debugError(`Upload failed: ${e?.message ?? e}`);
    return null;
  }
};
// 4. Manual cache invalidation (call this when configs change)
export const invalidateUploadConfigCache = () => {
  cachedUploadConfig = null;
  lastFetchTime = 0;
};
