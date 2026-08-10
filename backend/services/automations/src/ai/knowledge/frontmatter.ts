import { TAiKnowledgeMetadata } from './types';

const parseListValue = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return null;
  }

  return trimmed
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
};

const parseScalarValue = (value: string) => {
  const list = parseListValue(value);

  if (list) {
    return list;
  }

  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  const numericValue = Number(trimmed);

  if (trimmed && Number.isFinite(numericValue)) {
    return numericValue;
  }

  return trimmed;
};

export const parseKnowledgeFrontmatter = (
  content: string,
): { metadata: TAiKnowledgeMetadata; body: string } => {
  const normalized = content.replace(/\r\n/g, '\n');

  if (!normalized.startsWith('---\n')) {
    return { metadata: {}, body: normalized.trim() };
  }

  const endIndex = normalized.indexOf('\n---', 4);

  if (endIndex === -1) {
    return { metadata: {}, body: normalized.trim() };
  }

  const metadata: TAiKnowledgeMetadata = {};
  const frontmatter = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 4).trim();

  for (const line of frontmatter.split('\n')) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    metadata[key] = parseScalarValue(value);
  }

  return { metadata, body };
};
