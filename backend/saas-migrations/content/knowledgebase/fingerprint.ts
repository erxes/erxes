import { createHash } from 'node:crypto';
import { BSON } from 'mongodb';
import { RecordDocument, TargetCollection } from './types';

const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
};

export const fingerprint = (value: unknown): string => {
  const serialized: unknown = JSON.parse(
    BSON.EJSON.stringify(value, { relaxed: false }),
  );
  return createHash('sha256')
    .update(JSON.stringify(canonical(serialized)))
    .digest('hex');
};

export const targetFingerprint = (
  collection: TargetCollection,
  document: RecordDocument,
): string => {
  // Live reader counters and Mongoose bookkeeping do not make a content edit.
  const fields = { ...document };
  delete fields.__v;
  delete fields.updatedAt;
  if (collection === 'cms_posts') {
    delete fields.viewCount;
    delete fields.reactionCounts;
  }
  return fingerprint(fields);
};

export const sourceFingerprint = (
  kind: string,
  document: RecordDocument,
): string =>
  kind === 'article'
    ? targetFingerprint('cms_posts', document)
    : fingerprint(document);
