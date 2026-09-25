import type {
  IAiAgentFileSection,
  TAiAgentFileSectionRole,
} from 'erxes-api-shared/core-modules';
import { normalizeKnowledgeText } from './normalize';
import type { TAiKnowledgeChunk } from './types';

// Headings are the strongest signal an author gives about what a section is for.
const BEHAVIOR_HEADINGS = [
  'rule',
  'rules',
  'guideline',
  'guidelines',
  'instruction',
  'instructions',
  'response style',
  'style',
  'tone',
  'responsibilit',
  'policy',
  'greeting',
  'language',
  'мэндчилгээ',
  'дүрэм',
  'заавар',
  'хэв маяг',
  'үүрэг',
];

const EXAMPLE_HEADINGS = ['example', 'sample', 'жишээ', 'загвар хариулт'];

// Second-person and imperative lines: the voice of an instruction, not a fact.
const BEHAVIOR_LINE_PATTERNS = [
  /^you (are|should|must|will|can not|cannot)\b/,
  /^(always|never|avoid|do not|don't|make sure|ensure|keep|use|return|reply|respond|answer|ask|start|end|mention|preserve)\b/,
  /^(бүү|заавал)\b/,
  /(хариул|асуу|бичи|ашигла|төлөөл)(на|ж|аарай|аарай\.)?$/,
  /(болохгүй|хэрэггүй|ёстой|эрхэмл)/,
];

const EXAMPLE_LINE_PATTERNS = [/^(user|assistant|customer|бот|хэрэглэгч)\s*:/];

const MIN_BEHAVIOR_LINE_RATIO = 0.4;

// The section's own heading is not a body line; counting it dilutes the ratio
// enough to misread a short rule block as prose.
const toMeaningfulLines = (content: string) =>
  content
    .split('\n')
    .filter((line) => !/^#{1,6}\s/.test(line.trim()))
    .map((line) => line.replace(/^[\s•\-*\d.\\]+/, '').trim())
    .filter((line) => line.length > 2);

const matchesAny = (value: string, patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(value));

const includesAny = (value: string, needles: string[]) =>
  needles.some((needle) => value.includes(needle));

export const detectAiSectionRole = (
  chunk: Pick<TAiKnowledgeChunk, 'title' | 'headingPath' | 'content'>,
): TAiAgentFileSectionRole => {
  const heading = normalizeKnowledgeText(
    [chunk.title || '', ...(chunk.headingPath || [])].join(' '),
  );

  if (includesAny(heading, EXAMPLE_HEADINGS)) {
    return 'example';
  }

  if (includesAny(heading, BEHAVIOR_HEADINGS)) {
    return 'behavior';
  }

  const lines = toMeaningfulLines(chunk.content);

  if (!lines.length) {
    return 'content';
  }

  const normalizedLines = lines.map(normalizeKnowledgeText);

  if (
    normalizedLines.filter((line) => matchesAny(line, EXAMPLE_LINE_PATTERNS))
      .length >= 2
  ) {
    return 'example';
  }

  // A single imperative sentence inside a descriptive section ("Always represent
  // the club professionally.") must not turn facts into rules.
  const behaviorLines = normalizedLines.filter((line) =>
    matchesAny(line, BEHAVIOR_LINE_PATTERNS),
  ).length;

  return behaviorLines / normalizedLines.length >= MIN_BEHAVIOR_LINE_RATIO
    ? 'behavior'
    : 'content';
};

// Content shifts between uploads but headings rarely do, so the heading path is
// what keeps a human's role choice attached to the right section.
export const buildAiSectionKey = (
  chunk: Pick<TAiKnowledgeChunk, 'title' | 'headingPath'>,
  fallbackIndex: number,
) => {
  const path = [...(chunk.headingPath || [])];

  if (chunk.title && path[path.length - 1] !== chunk.title) {
    path.push(chunk.title);
  }

  const key = path
    .map((part) => normalizeKnowledgeText(part))
    .filter(Boolean)
    .join('/');

  return key || `section-${fallbackIndex}`;
};

export const buildAiSectionName = (
  chunk: Pick<TAiKnowledgeChunk, 'title' | 'headingPath'>,
  fallbackIndex: number,
) =>
  chunk.title?.trim() ||
  [...(chunk.headingPath || [])]
    .reverse()
    .find((part) => part.trim())
    ?.trim() ||
  `Section ${fallbackIndex + 1}`;

// Detected roles refresh on every index run; a human choice is kept forever.
export const mergeAiFileSections = ({
  storedSections,
  detectedSections,
}: {
  storedSections: IAiAgentFileSection[];
  detectedSections: IAiAgentFileSection[];
}): IAiAgentFileSection[] => {
  const storedByKey = new Map(
    storedSections.map((section) => [section.key, section]),
  );

  return detectedSections.map((detected) => {
    const stored = storedByKey.get(detected.key);

    if (!stored || stored.detected) {
      return detected;
    }

    return {
      ...detected,
      name: stored.name,
      role: stored.role,
      detected: false,
    };
  });
};
