import { z } from 'zod';
import { UNIT_SCHEMA } from '../schemas/unitSchema';

export interface IUnitListItem {
  _id: string;
  code: string;
  title: string;
  departmentId: string;
  supervisorId: string;
  userCount: number;
}

export enum UnitHotKeyScope {
  UnitSettingsPage = 'unit-settings-page',
  UnitAddSheet = 'unit-add-sheet',
}

export type TUnitForm = z.infer<typeof UNIT_SCHEMA>;
