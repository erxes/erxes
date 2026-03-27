import { readImage } from 'erxes-ui';

/**
 * HTML entity decode map for safe parsing.
 */
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&#x2F;': '/',
};

const ENTITY_REGEX = new RegExp(Object.keys(HTML_ENTITIES).join('|'), 'gi');

/**
 * Safely strips HTML tags from rich text content, returning plain text.
 * Uses allowlist-based entity decoding instead of raw regex on untrusted HTML.
 */
export const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  let result = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
<<<<<<< HEAD
    .replace(/<\/li>/gi, '\n');

  // Loop to handle nested/malformed tags (e.g. <scr<script>ipt>)
  let prev;
  do {
    prev = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== prev);

  // Strip any remaining incomplete tags (e.g. <script without closing >)
  result = result.replace(/<[a-z][\s\S]*/gi, '');

  return result
=======
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
>>>>>>> 34ae83f752a22d497f86d6ef407c3d387444bf68
    .replace(
      ENTITY_REGEX,
      (match) => HTML_ENTITIES[match.toLowerCase()] || match,
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Generates a safe filename from the itinerary name.
 */
export const generateFilename = (name?: string | null): string => {
  const safeName = (name || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safeName}.pdf`;
};

/**
 * Returns multiple URL candidates for an image path (for fallback).
 */
export const getImageUrlCandidates = (path?: string | null): string[] => {
  if (!path) return [];

  return [readImage(path)];
};

const base64Cache = new Map<string, Promise<string>>();
const MAX_BASE64_CACHE = 100;

/**
 * Converts an image URL to base64 data URL for PDF rendering.
 */
export const toBase64 = async (url: string): Promise<string> => {
  if (!url) return '';

  const existing = base64Cache.get(url);
  if (existing) return existing;

  if (base64Cache.size >= MAX_BASE64_CACHE) {
    const firstKey = base64Cache.keys().next().value;
    if (firstKey) base64Cache.delete(firstKey);
  }

  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) return '';

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) return '';

      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  })();

  base64Cache.set(url, promise);
  return promise;
};

/**
 * Converts an array of image paths to base64 data URLs.
 */
export const convertImagesToBase64 = async (
  imagePaths: string[] = [],
  maxImages = 1,
): Promise<string[]> => {
  if (!imagePaths || imagePaths.length === 0) return [];

  const limitedPaths = imagePaths.slice(0, maxImages);

  const promises = limitedPaths.map(async (path) => {
    const candidates = getImageUrlCandidates(path);
    for (const url of candidates) {
      const base64 = await toBase64(url);
      if (base64) return base64;
    }
    return '';
  });

  const results = await Promise.allSettled(promises);
  return results
    .filter(
      (result): result is PromiseFulfilledResult<string> =>
        result.status === 'fulfilled' && Boolean(result.value),
    )
    .map((result) => result.value);
};
