import { LayoutPage } from '../types';

const KEY = 'erxes:layout:pages';
const VERSION_KEY = 'erxes:layout:version';
const CURRENT_VERSION = '2';
const DEMO_SLUGS = new Set(['landing-demo', 'about']);

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
  const version = window.localStorage.getItem(VERSION_KEY);
  let pages = safeParse(window.localStorage.getItem(KEY)) ?? [];

  if (version !== CURRENT_VERSION) {
    pages = pages.filter((p) => !DEMO_SLUGS.has(p.slug));
    try {
      window.localStorage.setItem(KEY, JSON.stringify(pages));
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch {
      // ignore — return cleaned data anyway for this session
    }
  }
  return pages;
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
