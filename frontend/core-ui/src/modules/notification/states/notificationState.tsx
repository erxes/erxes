import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const hiddenNotificationIdsState = atom<string[]>([]);

export const selectedNotificationIdsState = atom<string[]>([]);

export const nextNotificationIdState = atom<string | null>(null);

export interface InboxDisplayOptions {
  unreadFirst: boolean;
  showPriority: boolean;
  showSender: boolean;
  grouping: 'none' | 'date' | 'plugin';
}

export const inboxDisplayOptionsState = atomWithStorage<InboxDisplayOptions>(
  'my-inbox:display',
  {
    unreadFirst: true,
    showPriority: true,
    showSender: true,
    grouping: 'none',
  },
);
