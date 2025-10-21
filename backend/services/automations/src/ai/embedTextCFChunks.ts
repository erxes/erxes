import { chunkText } from '@/utils/cloudflare';

export async function embedTextCFChunks(
  text: string,
  onProgress?: (info: {
    total: number;
    processed: number;
    failed: number;
    currentIndex?: number;
    message?: string;
  }) => void,
): Promise<number[]> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;

  if (!CLOUDFLARE_API_TOKEN) {
    throw new Error('CLOUDFLARE_API_TOKEN is required for AI embedding');
  }

  const MAX_CONCURRENCY = 4;
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 500;
  const REQUEST_TIMEOUT_MS = 30000;

  async function requestWithRetry(payload: { text: string }, index: number) {
    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const resp = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-large-en-v1.5`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          },
        );
        clearTimeout(timeout);

        if (!resp.ok) {
          if (resp.status >= 400 && resp.status < 500 && resp.status !== 429) {
            const bodyText = await resp.text().catch(() => '');
            throw new Error(
              `Cloudflare AI API error on chunk ${index + 1}: ${resp.status} ${
                resp.statusText
              }${bodyText ? ` - ${bodyText}` : ''}`,
            );
          }
          throw new Error(
            `Transient Cloudflare AI API error on chunk ${index + 1}: ${
              resp.status
            } ${resp.statusText}`,
          );
        }

        const data = (await resp.json().catch(() => null)) as {
          result?: { data?: number[][] };
        } | null;
        if (!data || !data.result || !Array.isArray(data.result.data)) {
          throw new Error(`Invalid response structure on chunk ${index + 1}`);
        }
        const vector = data.result.data[0];
        if (!Array.isArray(vector)) {
          throw new Error(`Missing embedding vector on chunk ${index + 1}`);
        }
        return vector as number[];
      } catch (error) {
        clearTimeout(timeout);
        attempt += 1;
        if (attempt > MAX_RETRIES) {
          throw error;
        }
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 200);
        await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
      }
    }
    return [] as number[];
  }

  const chunks = chunkText(text, 1000).filter((c) => c.trim().length > 0);
  const logProgress = (info: {
    total: number;
    processed: number;
    failed: number;
    currentIndex?: number;
    message?: string;
  }) => {
    if (onProgress) {
      onProgress(info);
      return;
    }
    const percent = info.total
      ? Math.floor(((info.processed + info.failed) / info.total) * 100)
      : 0;
    const parts = [
      `embed-chunks: ${percent}% (${info.processed}/${info.total})`,
      info.failed ? `failed=${info.failed}` : '',
      typeof info.currentIndex === 'number'
        ? `chunk=${info.currentIndex + 1}`
        : '',
      info.message || '',
    ].filter(Boolean);
    // eslint-disable-next-line no-console
    console.log(parts.join(' | '));
  };

  let nextIndex = 0;
  let results: number[] = Array(chunks.length);
  const errors: { index: number; error: unknown }[] = [];
  let processed = 0;
  let failed = 0;

  logProgress({ total: chunks.length, processed, failed, message: 'start' });

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      if (currentIndex >= chunks.length) return;
      nextIndex += 1;
      try {
        const vector = await requestWithRetry(
          { text: chunks[currentIndex] },
          currentIndex,
        );
        results = [...results, ...vector];
        processed += 1;
        logProgress({
          total: chunks.length,
          processed,
          failed,
          currentIndex,
          message: 'ok',
        });
      } catch (err) {
        errors.push({ index: currentIndex, error: err });
        failed += 1;
        logProgress({
          total: chunks.length,
          processed,
          failed,
          currentIndex,
          message: `error: ${String((err as Error)?.message || err)}`,
        });
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(MAX_CONCURRENCY, chunks.length) },
    () => worker(),
  );
  await Promise.all(workers);

  if (errors.length > 0) {
    const first = errors[0];
    throw new Error(
      `Failed to embed chunks: ${String(
        (first.error as Error)?.message || first.error,
      )}`,
    );
  }

  logProgress({ total: chunks.length, processed, failed, message: 'done' });
  return results;
}
