// ---------------------------------------------------------------------------
// Company Knowledge RAG — article → text chunks (pure, unit-testable).
//
// Knowledge-base article `content` is HTML (Blocknote). We strip markup to
// plain text and split into ~1500-char chunks on paragraph boundaries so each
// Qdrant point stays well within embedder token limits while preserving
// enough context to answer from.
// ---------------------------------------------------------------------------

import {
  decodeHtmlEntities,
  stripAllTags,
  stripScriptAndStyleBlocks,
} from '~/mastra/html';

export interface KbArticleLike {
  _id: string;
  title?: string;
  summary?: string;
  content?: string;
}

export interface ArticleChunk {
  chunkIndex: number;
  text: string;
}

const MAX_CHUNK_CHARS = 1500;

/** Strip HTML to readable plain text. Block-level tags become line breaks. */
export function htmlToText(html: string): string {
  return decodeHtmlEntities(
    stripAllTags(
      stripScriptAndStyleBlocks(html)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|pre)>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- '),
    ),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Split plain text into chunks of at most `max` chars on paragraph/sentence boundaries. */
export function splitIntoChunks(text: string, max = MAX_CHUNK_CHARS): string[] {
  if (text.length <= max) return text ? [text] : [];

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  // Close the current chunk and start a new one.
  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = '';
  };

  for (const para of paragraphs) {
    if (para.length > max) {
      // Oversized paragraph: hard-split on sentence boundaries, then raw.
      flush();
      let rest = para;
      while (rest.length > max) {
        let cut = rest.lastIndexOf('. ', max);
        if (cut < max * 0.5) cut = max;
        chunks.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1);
      }
      current = rest;
      continue;
    }
    if (current.length + para.length + 2 > max) flush();
    current = current ? `${current}\n\n${para}` : para;
  }
  flush();

  return chunks;
}

/**
 * Serialize one article into embeddable chunks. Every chunk is prefixed with
 * the article title so retrieval hits stay self-describing even mid-article.
 */
export function articleToChunks(article: KbArticleLike): ArticleChunk[] {
  const title = (article.title || '').trim();
  const summary = (article.summary || '').trim();
  const body = htmlToText(article.content || '');

  const full = [summary, body].filter(Boolean).join('\n\n');
  if (!title && !full) return [];

  const bodyChunks = splitIntoChunks(full);
  if (!bodyChunks.length) {
    return [{ chunkIndex: 0, text: title }];
  }

  return bodyChunks.map((text, chunkIndex) => ({
    chunkIndex,
    text: title ? `${title}\n\n${text}` : text,
  }));
}
