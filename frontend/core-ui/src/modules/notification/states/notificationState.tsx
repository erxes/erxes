import { atom } from 'jotai';

export const refetchNewNotificationsState = atom(false);

export const hiddenNotificationIdsState = atom<string[]>([]);

export const nextNotificationIdState = atom<string | null>(null);
