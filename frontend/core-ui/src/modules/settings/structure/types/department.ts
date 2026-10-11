import { z } from 'zod';
import { DEPARTMENT_SCHEMA } from '../schemas/departmentSchema';

export enum DepartmentHotKeyScope {
  DepartmentSettingsPage = 'department-settings-page',
  DepartmentAddSheet = 'department-add-sheet',
}

export type TDepartmentForm = z.infer<typeof DEPARTMENT_SCHEMA>;
