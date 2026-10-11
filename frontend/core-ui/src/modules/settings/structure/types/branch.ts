import { z } from 'zod';
import { BRANCH_CREATE_SCHEMA } from '../schemas/branchSchema';

export enum BranchHotKeyScope {
  BranchSettingsPage = 'branch-settings-page',
  BranchAddSheet = 'branch-add-sheet',
}

export type TBranchForm = z.infer<typeof BRANCH_CREATE_SCHEMA>;
