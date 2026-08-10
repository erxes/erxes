import crypto from 'crypto';
import { TAiKnowledgeLanguage } from './types';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'what',
  'when',
  'where',
  'with',
  'байна',
  'байгаа',
  'бол',
  'вэ',
  'уу',
  'юу',
  'ямар',
  'энэ',
  'тэр',
  'та',
  'би',
  'нь',
  'д',
  'т',
]);

export const normalizeKnowledgeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const extractKnowledgeTerms = (value: string, maxTerms = 24) => {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const term of normalizeKnowledgeText(value).split(' ')) {
    if (term.length < 2 || STOP_WORDS.has(term) || seen.has(term)) {
      continue;
    }

    seen.add(term);
    terms.push(term);

    if (terms.length >= maxTerms) {
      break;
    }
  }

  return terms;
};

export const uniqueKnowledgeValues = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeKnowledgeText(value || '');

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

export const detectKnowledgeLanguage = (
  value: string,
): TAiKnowledgeLanguage => {
  const letters = value.match(/\p{L}/gu) || [];

  if (!letters.length) {
    return 'unknown';
  }

  const cyrillic = value.match(/\p{Script=Cyrillic}/gu) || [];
  const latin = value.match(/\p{Script=Latin}/gu) || [];
  const cyrillicRatio = cyrillic.length / letters.length;
  const latinRatio = latin.length / letters.length;

  if (cyrillicRatio > 0.65) {
    return 'mn';
  }

  if (latinRatio > 0.65) {
    return 'en';
  }

  return 'mixed';
};

export const estimateKnowledgeTokenCount = (value: string) => {
  const normalizedLength = value.trim().length;

  if (!normalizedLength) {
    return 0;
  }

  return Math.ceil(normalizedLength / 4);
};

export const getKnowledgeByteSize = (value: string) =>
  Buffer.byteLength(value, 'utf-8');

export const hashKnowledgeContent = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');
