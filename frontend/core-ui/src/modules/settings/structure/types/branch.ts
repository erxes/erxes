import { z } from 'zod';
import { BRANCH_CREATE_SCHEMA } from '../schemas/branchSchema';

export interface IBranchListItem {
  _id: string;
  code: string;
  address: string;
  parentId: string;
  supervisorId?: string;
  userCount: number;
  title: string;
  order: string;
  coordinate?: { latitude?: string | null; longitude?: string | null } | null;
  hasChildren?: boolean;
}
export enum BranchHotKeyScope {
  BranchSettingsPage = 'branch-settings-page',
  BranchAddSheet = 'branch-add-sheet',
}

export type TBranchForm = z.infer<typeof BRANCH_CREATE_SCHEMA>;
