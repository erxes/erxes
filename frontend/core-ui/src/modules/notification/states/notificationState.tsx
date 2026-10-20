import { atom } from 'jotai';

export const hiddenNotificationIdsState = atom<string[]>([]);

export const selectedNotificationIdsState = atom<string[]>([]);

export const nextNotificationIdState = atom<string | null>(null);
