import { normalizeKnowledgeText } from './normalize';
import {
  TAiKnowledgeChunk,
  TAiKnowledgeQuery,
  TAiKnowledgeScoredChunk,
} from './types';

const PRIORITY_BOOST = {
  low: 0,
  normal: 4,
  high: 12,
  always: 100,
};

const includesAny = (values: string[], terms: string[]) =>
  values.some((value) => terms.includes(normalizeKnowledgeText(value)));

// A term found in most passages says little about which one is asked for, so
// each term counts by how rare it is among the candidates.
export const scoreAiKnowledgeChunk = (
  chunk: TAiKnowledgeChunk,
  query: Required<TAiKnowledgeQuery>,
  termWeights: Map<string, number> = new Map(),
): TAiKnowledgeScoredChunk => {
  const weightOf = (term: string) => termWeights.get(term) ?? 1;
  let matchScore = 0;
  const reasons: string[] = [];
  const normalizedTitle = normalizeKnowledgeText(chunk.title || '');
  const normalizedContent = normalizeKnowledgeText(chunk.content);
  const normalizedHeadingPath = chunk.headingPath.map(normalizeKnowledgeText);
  const normalizedTopics = chunk.topics.map(normalizeKnowledgeText);
  const normalizedKeywords = chunk.keywords.map(normalizeKnowledgeText);

  if (chunk.priority !== 'low') {
    reasons.push(`priority:${chunk.priority}`);
  }

  for (const topic of query.topics.map(normalizeKnowledgeText)) {
    if (normalizedTopics.includes(topic)) {
      matchScore += 28;
      reasons.push(`topic:${topic}`);
    }
  }

  for (const keyword of query.keywords.map(normalizeKnowledgeText)) {
    if (normalizedKeywords.includes(keyword)) {
      matchScore += 16 * weightOf(keyword);
      reasons.push(`keyword:${keyword}`);
    }
  }

  for (const term of query.text
    .split(' ')
    .map(normalizeKnowledgeText)
    .filter(Boolean)) {
    const weight = weightOf(term);

    if (normalizedTitle.includes(term)) {
      matchScore += 14 * weight;
      reasons.push(`title:${term}`);
    }

    if (includesAny(normalizedHeadingPath, [term])) {
      matchScore += 10 * weight;
      reasons.push(`heading:${term}`);
    }

    if (normalizedKeywords.includes(term)) {
      matchScore += 8 * weight;
      reasons.push(`term-keyword:${term}`);
    }

    if (normalizedContent.includes(term)) {
      matchScore += 3 * weight;
    }
  }

  // Priority only breaks ties between chunks the query already reached; on its
  // own it used to lift every unrelated chunk above the relevance floor.
  return {
    chunk,
    score: matchScore + PRIORITY_BOOST[chunk.priority],
    matchScore,
    reasons,
  };
};
