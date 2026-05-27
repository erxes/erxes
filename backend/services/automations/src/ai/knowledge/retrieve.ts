import {
  extractKnowledgeTerms,
  getKnowledgeByteSize,
  normalizeKnowledgeText,
  uniqueKnowledgeValues,
} from './normalize';
import { scoreAiKnowledgeChunk } from './score';
import {
  TAiKnowledgeChunk,
  TAiKnowledgeQuery,
  TAiKnowledgeRetrievalConfig,
  TAiKnowledgeRetrievalResult,
  TAiKnowledgeScoredChunk,
} from './types';

const DEFAULT_TOP_K = 5;
const DEFAULT_MAX_CONTEXT_BYTES = 8000;

const fitChunksWithinBytes = (
  chunks: TAiKnowledgeChunk[],
  maxContextBytes: number,
) => {
  const selected: TAiKnowledgeChunk[] = [];
  let totalBytes = 0;

  for (const chunk of chunks) {
    const nextBytes = totalBytes + getKnowledgeByteSize(chunk.content);

    if (selected.length && nextBytes > maxContextBytes) {
      continue;
    }

    selected.push(chunk);
    totalBytes = nextBytes;
  }

  return {
    chunks: selected,
    totalBytes,
  };
};

const dedupeScoredChunks = (scored: TAiKnowledgeScoredChunk[]) => {
  const seen = new Set<string>();
  const result: TAiKnowledgeScoredChunk[] = [];

  for (const item of scored) {
    const key =
      item.chunk.id ||
      `${item.chunk.fileId}:${item.chunk.chunkIndex}:${item.chunk.contentHash}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
};

export const retrieveAiKnowledgeChunks = ({
  chunks,
  query,
  config = {},
}: {
  chunks: TAiKnowledgeChunk[];
  query: TAiKnowledgeQuery;
  config?: TAiKnowledgeRetrievalConfig;
}): TAiKnowledgeRetrievalResult => {
  const normalizedText = normalizeKnowledgeText(query.text);
  const terms = extractKnowledgeTerms(normalizedText);
  const topics = uniqueKnowledgeValues(query.topics || []);
  const keywords = uniqueKnowledgeValues([...(query.keywords || []), ...terms]);
  const fullQuery: Required<TAiKnowledgeQuery> = {
    text: normalizedText,
    topics,
    keywords,
  };
  const includeAlways = config.includeAlways !== false;
  const topK = config.topK || DEFAULT_TOP_K;
  const maxContextBytes =
    config.maxContextBytes || DEFAULT_MAX_CONTEXT_BYTES;
  const minScore = config.minScore ?? 1;

  const alwaysChunks = includeAlways
    ? chunks
        .filter((chunk) => chunk.priority === 'always')
        .map((chunk) => ({
          chunk,
          score: 1000,
          reasons: ['always'],
        }))
    : [];

  const scored = chunks
    .filter((chunk) => chunk.priority !== 'always')
    .map((chunk) => scoreAiKnowledgeChunk(chunk, fullQuery))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const selectedScored = dedupeScoredChunks([
    ...alwaysChunks,
    ...scored,
  ]).slice(0, Math.max(topK * 3, topK));

  const fitted = fitChunksWithinBytes(
    selectedScored.map(({ chunk }) => chunk),
    maxContextBytes,
  );

  return {
    chunks: fitted.chunks.slice(0, topK),
    scored: selectedScored,
    query: {
      normalizedText,
      terms,
      topics,
      keywords,
    },
    totalBytes: fitted.totalBytes,
  };
};

export const formatAiKnowledgeChunksForPrompt = (
  chunks: TAiKnowledgeChunk[],
) =>
  chunks
    .map((chunk) => {
      const heading = [
        `source="${chunk.fileName}"`,
        chunk.title ? `title="${chunk.title}"` : '',
        chunk.topics.length ? `topics="${chunk.topics.join(', ')}"` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `[Knowledge ${heading}]\n${chunk.content}`;
    })
    .join('\n\n');
