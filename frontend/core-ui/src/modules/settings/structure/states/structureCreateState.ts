import { atom } from 'jotai';

export type TStructureCreateTarget = {
  parentId?: string;
  // Existing child that moves under the new record (insert between)
  insertBefore?: { _id: string; code: string };
};

// null keeps the create sheet closed
export const departmentCreateState = atom<TStructureCreateTarget | null>(null);
export const branchCreateState = atom<TStructureCreateTarget | null>(null);
