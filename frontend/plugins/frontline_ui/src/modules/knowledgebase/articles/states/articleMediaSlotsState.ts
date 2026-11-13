import { atom } from 'jotai';

export const articleMediaSlotsState = atom<Record<string, HTMLElement>>({});

export const getArticleSlotKey = (articleId: string, tab: string) =>
  `${articleId}:${tab}`;
