import { MAX_VIBER_FILE_BYTES } from '../constants';

export const readViberMediaResponse = async (
  response: Response,
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

    const declaredSize = Number(response.headers.get('content-length'));
    if (declaredSize > MAX_VIBER_FILE_BYTES) {
      throw new Error('Viber attachment exceeds the 25 MiB limit');
    }

    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.byteLength;
      if (size > MAX_VIBER_FILE_BYTES) {
        throw new Error('Viber attachment exceeds the 25 MiB limit');
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
