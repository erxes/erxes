import { VIBER_INCOMING_MEDIA_MAX_BYTES } from '../constants';
import type { ViberMediaType } from '../constants';

export const getViberMediaMaxBytes = (messageType: ViberMediaType): number => {
  const maxBytes = VIBER_INCOMING_MEDIA_MAX_BYTES[messageType];

  if (typeof maxBytes !== 'number') {
    throw new Error('Unsupported Viber media type');
  }

  return maxBytes;
};

export const readViberMediaResponse = async (
  response: Response,
  messageType: ViberMediaType,
): Promise<{ buffer: Buffer; mimetype: string }> => {
  const reader = response.body?.getReader();

  try {
    if (!response.ok) {
      throw new Error(
        `Viber attachment download failed (HTTP ${response.status})`,
      );
    }

    if (!reader) {
      throw new Error('Viber attachment response has no body');
    }

    const maxBytes = getViberMediaMaxBytes(messageType);
    const sizeError = `Viber ${messageType} exceeds the ${
      maxBytes / (1024 * 1024)
    } MiB limit`;

    const declaredSize = Number(response.headers.get('content-length'));
    if (declaredSize > maxBytes) {
      throw new Error(sizeError);
    }

    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.byteLength;
      if (size > maxBytes) {
        throw new Error(sizeError);
      }

      chunks.push(value);
    }

    const mimetype =
      response.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase() || 'application/octet-stream';

    return { buffer: Buffer.concat(chunks, size), mimetype };
  } finally {
    // Cleanup must not replace the original HTTP or stream error.
    await reader?.cancel().catch(() => undefined);
    reader?.releaseLock();
  }
};

export const downloadViberMedia = async (
  source: string,
  messageType: ViberMediaType,
  allowedHostnames: readonly string[],
): Promise<{ buffer: Buffer; mimetype: string }> => {
  if (typeof source !== 'string' || !source || source !== source.trim()) {
    throw new Error('Invalid Viber media URL');
  }

  getViberMediaMaxBytes(messageType);

  let url: URL;

  try {
    url = new URL(source);
  } catch {
    throw new Error('Invalid Viber media URL');
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash
  ) {
    throw new Error('Unsupported Viber media URL');
  }

  if (!allowedHostnames.includes(url.hostname)) {
    throw new Error('Unapproved Viber media host');
  }

  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });

  return readViberMediaResponse(response, messageType);
};
