import { TFilesPrincipalType, TFilesRole } from 'ui-modules';

export const FILES_PRINCIPAL_TYPES = [
  'user',
  'entity',
  'everyone',
] as const satisfies readonly TFilesPrincipalType[];

export const FILES_ROLES = [
  'viewer',
  'contributor',
  'manager',
] as const satisfies readonly TFilesRole[];
