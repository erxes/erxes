import { IAutomation } from '@/automations/types';
import { atom } from 'jotai';

export type TAutomationFolderChildren = {
  list: IAutomation[];
  totalCount: number;
  loading: boolean;
};

/** Folders opened in the list; they stay open across visits in the session. */
export const automationExpandedFoldersState = atom<string[]>([]);

/** Each open folder's automations, published by its loader. */
export const automationFolderChildrenState = atom<
  Record<string, TAutomationFolderChildren>
>({});
