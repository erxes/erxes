import { ISetAccountPermissionForm } from '../types/Permission';

export const PERMISSIONS_PER_PAGE = 30;

export const PERMISSION_DEFAULT_VALUES: ISetAccountPermissionForm = {
  userId: '',
  accountIds: [],
  level: 0,
  read: 'own',
  write: 'own',
};
