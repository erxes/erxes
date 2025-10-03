import { z } from 'zod';
import { BRANCH_CREATE_SCHEMA } from '../schemas/branchSchema';

export interface IBranchListItem {
  _id: string;
  code: string;
  address: string;
  parentId: string;
  userCount: number;
  title: string;
  order: string;
  hasChildren?: boolean;
}
export enum BranchHotKeyScope {
  BranchSettingsPage = 'branch-settings-page',
  BranchAddSheet = 'branch-add-sheet',
}

export type TBranchForm = z.infer<typeof BRANCH_CREATE_SCHEMA>;
