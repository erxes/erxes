import { readImage } from 'erxes-ui';
import { isRecord } from '@/shared/utils/isRecord';

const toAvatarUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.trim() || undefined;
  if (isRecord(value) && typeof value.url === 'string') return value.url;
  return undefined;
};

const parseAvatarValue = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const getFormAvatarUrl = (value: unknown): string | undefined => {
  const parsed = parseAvatarValue(value);
  const first = Array.isArray(parsed) ? parsed[0] : parsed;

  return toAvatarUrl(first);
};

const decodeAvatarUrl = (url: string): string => {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
};

export const getFormAvatarSrc = (value: unknown): string =>
  readImage(decodeAvatarUrl(getFormAvatarUrl(value) ?? ''));
