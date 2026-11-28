import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';
import { OutboundError, requestOutbound } from '~/lib/outbound';

export const BROWSER = 'Mozilla/5.0 (X11; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0';

const ASSISTANT = 'erxes-assistant/1.0 (+https://erxes.io)';

const MAX_BYTES = 5 * 1024 * 1024;

const REDIRECTS = 5;

const INFLATE: Record<string, (body: Buffer) => Buffer> = {
  gzip: gunzipSync,
  'x-gzip': gunzipSync,
  br: brotliDecompressSync,
  deflate: inflateSync,
};

const header = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

const inflated = (body: Buffer, encoding: string) => {
  const inflate = INFLATE[encoding.trim().toLowerCase()];

  return inflate ? inflate(body) : body;
};

const charsetOf = (type: string, head: string) =>
  /charset=["']?([\w-]+)/i.exec(type)?.[1] ??
  /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
  'utf-8';

const decode = (bytes: Buffer, type: string) => {
  const charset = charsetOf(type, bytes.subarray(0, 2048).toString('latin1'));

  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
};

export interface Page {
  url: string;
  status: number;
  mimeType: string;
  bytes: Buffer;
  text: () => string;
}

interface Ask {
  accept: string;
  userAgent?: string;
}

export const getPage = async (url: string, ask: Ask, hops = 0): Promise<Page> => {
  const answer = await requestOutbound(url, {
    method: 'GET',
    body: '',
    headers: {
      'User-Agent': ask.userAgent ?? ASSISTANT,
      Accept: ask.accept,
      'Accept-Language': 'en-US,en;q=0.7',
      'Accept-Encoding': 'identity',
    },
    timeoutMs: 15_000,
    maxBytes: MAX_BYTES,
    overflow: 'fail',
  });

  const location = header(answer.headers.location);

  if (answer.status >= 300 && answer.status < 400 && location) {
    if (hops >= REDIRECTS) throw new OutboundError(`More than ${REDIRECTS} redirects`);

    return getPage(new URL(location, url).href, ask, hops + 1);
  }

  const type = header(answer.headers['content-type']);
  const bytes = inflated(answer.body, header(answer.headers['content-encoding']));

  return {
    url,
    status: answer.status,
    mimeType: type.split(';')[0]?.trim().toLowerCase() ?? '',
    bytes,
    text: () => decode(bytes, type),
  };
};
