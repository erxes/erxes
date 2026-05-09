import { LayoutPage } from '../types';
import { buildSeedPages } from './seed';

const KEY = 'erxes:layout:pages';

const safeParse = (raw: string | null): LayoutPage[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as LayoutPage[];
  } catch {
    return null;
  }
};

export const readPages = (): LayoutPage[] => {
  if (typeof window === 'undefined') return [];
  const parsed = safeParse(window.localStorage.getItem(KEY));
  if (parsed) return parsed;
  const seeded = buildSeedPages();
  try {
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
  } catch {
    // ignore — read still returns the seed for this session
  }
  return seeded;
};

export class StorageQuotaError extends Error {
  constructor() {
    super('Storage full — delete pages to free space.');
    this.name = 'StorageQuotaError';
  }
}

export const writePages = (pages: LayoutPage[]): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(pages));
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new StorageQuotaError();
    }
    throw err;
  }
};

export const STORAGE_KEY = KEY;
