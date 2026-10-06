import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { stripHtml } from 'string-strip-html';
import validator from 'validator';
import { isPublicTelegramFileAddress } from './publicAddress';

export interface TelegramLinkPreview {
  type: string;
  url: string;
  title: string;
  description?: string;
  provider: { name: string };
  image?: { url: string };
}

const MAX_HTML_BYTES = 512 * 1024;
const MAX_CACHE_ENTRIES = 200;
const cache = new Map<
  string,
  { expires: number; result: Promise<TelegramLinkPreview> }
>();

/** Decodes named and numeric HTML entities while discarding invalid code points. */
const decodeText = (value: string): string =>
  validator
    .unescape(value)
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) => {
      const point =
        code[0].toLowerCase() === 'x'
          ? Number.parseInt(code.slice(1), 16)
          : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '';
    });

// Scan once rather than repeatedly backtracking over untrusted URL suffixes.
const trimLinkPunctuation = (value: string): string => {
  let end = value.length;
  while (end > 0 && '.,!?;:'.includes(value[end - 1])) end--;
  let extraClosing = 0;
  for (let index = 0; index < end; index++) {
    if (value[index] === ')') extraClosing++;
    if (value[index] === '(') extraClosing--;
  }
  while (end > 0 && value[end - 1] === ')' && extraClosing > 0) {
    end--;
    extraClosing--;
  }
  return value.slice(0, end);
};

/** Extracts at most two distinct HTTP links from editor HTML or provider text. */
export const telegramMessageLinks = (content: string): string[] => {
  const text = stripHtml(content, { skipHtmlDecoding: true }).result;
  const hrefs = Array.from(
    content.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi),
    (match) => decodeText(match[1]),
  );
  const plain = Array.from(
    decodeText(text).matchAll(/https?:\/\/[^\s<>"']+/gi),
    (match) => trimLinkPunctuation(match[0]),
  );
  return [...new Set([...hrefs, ...plain])]
    .filter((value) => {
      try {
        return ['https:', 'http:'].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    })
    .slice(0, 2);
};

/** Rejects credentials, non-HTTPS schemes and custom ports before preview fetching. */
const publicUrl = (value: string, base?: string): URL => {
  const url = new URL(value, base);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443')
  ) {
    throw new Error('Preview requires public HTTPS');
  }
  return url;
};

/** Resolves and checks public IPs within the preview deadline for DNS pinning. */
const resolvePublicAddress = async (url: URL, signal: AbortSignal) => {
  signal.throwIfAborted();
  /** Replaced by the active DNS cancellation handler and removed after lookup. */
  let onAbort: () => void = () => undefined;
  try {
    const addresses = await Promise.race([
      lookup(url.hostname.replace(/^\[|\]$/g, ''), { all: true }),
      new Promise<never>((_, reject) => {
        onAbort = () => reject(new Error('Preview timed out'));
        signal.addEventListener('abort', onAbort, { once: true });
      }),
    ]);
    if (
      !addresses.length ||
      addresses.some(({ address }) => !isPublicTelegramFileAddress(address))
    )
      throw new Error('Preview address is not public');
    return addresses[0];
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
};

// Preserve the checked DNS address through the HTTPS connection, including each
// redirect. No cookies, workspace headers, auth, proxy, or page scripts are used.
export const readTelegramPreviewHtml = async (
  initial: string,
): Promise<{ html: string; url: string }> => {
  const signal = AbortSignal.timeout(5_000);
  let url = publicUrl(initial);
  for (let redirects = 0; redirects <= 2; redirects++) {
    const pinned = await resolvePublicAddress(url, signal);
    const result = await new Promise<{ html?: string; redirect?: string }>(
      (resolve, reject) => {
        const req = request(
          url,
          {
            signal,
            headers: {
              Accept: 'text/html',
              'Accept-Encoding': 'identity',
              'User-Agent': 'erxes-link-preview-bot',
            },
            family: pinned.family,
            lookup: (_host, _options, callback) =>
              callback(null, pinned.address, pinned.family),
          },
          (response) => {
            const status = response.statusCode ?? 0;
            if (
              [301, 302, 303, 307, 308].includes(status) &&
              response.headers.location
            ) {
              response.destroy();
              resolve({ redirect: response.headers.location });
              return;
            }
            if (
              status !== 200 ||
              !/^text\/html\b/i.test(response.headers['content-type'] || '') ||
              Number(response.headers['content-length']) > MAX_HTML_BYTES
            ) {
              response.destroy();
              reject(new Error('No HTML preview available'));
              return;
            }
            const chunks: Buffer[] = [];
            let bytes = 0;
            response.on('data', (chunk: Buffer) => {
              bytes += chunk.length;
              if (bytes > MAX_HTML_BYTES) {
                response.destroy(new Error('Preview is too large'));
                return;
              }
              chunks.push(chunk);
            });
            response.on('end', () =>
              resolve({ html: Buffer.concat(chunks).toString('utf8') }),
            );
            response.on('error', reject);
          },
        );
        req.on('error', reject);
        req.end();
      },
    );
    if (result.html !== undefined) return { html: result.html, url: url.href };
    url = publicUrl(result.redirect || '', url.href);
  }
  throw new Error('Too many preview redirects');
};

/** Maps bounded page metadata into a native link card without executing scripts. */
export const parseTelegramLinkPreview = (
  html: string,
  original: string,
  finalUrl = original,
): TelegramLinkPreview => {
  const meta = new Map<string, string>();
  const head = html
    .split(/<\/head\s*>/i)[0]
    .replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>/gi, '');
  for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = new Map(
      Array.from(
        tag.matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/g),
        (match) => [
          match[1].toLowerCase(),
          decodeText(match[2] ?? match[3] ?? match[4]),
        ],
      ),
    );
    const key = attrs.get('property') || attrs.get('name');
    if (key && attrs.get('content'))
      meta.set(key.toLowerCase(), attrs.get('content') || '');
  }
  /** Strips markup, decodes entities and bounds a display metadata field. */
  const plain = (value: string, max: number) =>
    decodeText(stripHtml(value, { skipHtmlDecoding: true }).result)
      .trim()
      .slice(0, max);
  const title = plain(
    meta.get('og:title') ||
      meta.get('twitter:title') ||
      head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
      new URL(original).hostname,
    200,
  );
  const preview: TelegramLinkPreview = {
    type:
      meta.get('twitter:card') === 'player' ||
      meta.get('og:type')?.startsWith('video')
        ? 'video'
        : 'link',
    url: original,
    title,
    provider: {
      name: plain(meta.get('og:site_name') || new URL(original).hostname, 100),
    },
    description:
      plain(
        meta.get('og:description') ||
          meta.get('twitter:description') ||
          meta.get('description') ||
          '',
        500,
      ) || undefined,
  };
  try {
    const image = meta.get('og:image') || meta.get('twitter:image');
    if (image) preview.image = { url: publicUrl(image, finalUrl).href };
  } catch {
    /* Metadata is optional; keep the usable link card. */
  }
  return preview;
};

/** Caches bounded, tenant-keyed preview fetches and falls back to usable links. */
export const getTelegramLinkPreviews = (
  subdomain: string,
  content: string,
): Promise<TelegramLinkPreview[]> =>
  Promise.all(
    telegramMessageLinks(content).map((url) => {
      const key = JSON.stringify([subdomain, url]);
      const existing = cache.get(key);
      if (existing && existing.expires > Date.now()) return existing.result;
      const result = readTelegramPreviewHtml(url)
        .then(async ({ html, url: finalUrl }) => {
          const preview = parseTelegramLinkPreview(html, url, finalUrl);
          // An HTML page cannot turn its preview image into a private-network request.
          if (preview.image) {
            const imageUrl = new URL(preview.image.url);
            try {
              await resolvePublicAddress(imageUrl, AbortSignal.timeout(2_000));
            } catch {
              delete preview.image;
            }
          }
          return preview;
        })
        .catch(() => ({
          type: 'link',
          url,
          title: url,
          provider: { name: new URL(url).hostname },
        }));
      if (cache.size >= MAX_CACHE_ENTRIES)
        cache.delete(cache.keys().next().value || '');
      cache.set(key, { expires: Date.now() + 5 * 60_000, result });
      return result;
    }),
  );
