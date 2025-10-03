import { z } from 'zod';
import { DEPARTMENT_SCHEMA } from '../schemas/departmentSchema';

export interface IDepartmentListItem {
  _id: string;
  code: string;
  title: string;
  supervisorId: string;
  userCount: number;
  parentId: string;
  order?: string;
  hasChildren?: boolean;
}

export enum DepartmentHotKeyScope {
  DepartmentSettingsPage = 'department-settings-page',
  DepartmentAddSheet = 'department-add-sheet',
}

export type TDepartmentForm = z.infer<typeof DEPARTMENT_SCHEMA>;
