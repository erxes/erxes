import { atom } from 'jotai';

// What the remove dialog is about; from Archived it can only be deleted.
export type TArchiveTarget = (
  | { kind: 'fields'; ids: string[] }
  | { kind: 'group'; id: string }
) & { label: string; archived?: boolean };

export const archiveTargetState = atom<TArchiveTarget | null>(null);
