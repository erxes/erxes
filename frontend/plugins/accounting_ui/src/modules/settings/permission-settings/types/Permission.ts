import {
  IconBan,
  IconMathEqualLower,
  IconMathGreater,
  IconMathLower,
  IconPlus,
  IconUser,
  type Icon,
  type IconProps,
} from '@tabler/icons-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

export interface IPermissionUser {
  _id?: string;
  email?: string;
  details?: { fullName?: string; avatar?: string };
}

export interface IPermissionAccount {
  _id?: string;
  code: string;
  name: string;
  categoryId?: string;
  currency?: string;
  kind?: string;
  journal?: string;
  isTemp?: boolean;
  isOutBalance?: boolean;
  status?: string;
}

export const PERMISSION_NONE = 'none';

export const ACCOUNT_PERMISSIONS = {
  READ: [
    { value: 'none', label: 'no-viewing-access', icon: IconBan },
    { value: 'own', label: 'view-own-records', icon: IconUser },
    {
      value: 'ltLvl',
      label: 'view-records-at-lower-access-levels',
      icon: IconMathLower,
    },
    {
      value: 'lteLvl',
      label: 'view-records-at-the-same-access-level',
      icon: IconMathEqualLower,
    },
    { value: 'gtLvl', label: 'view-all-records', icon: IconMathGreater },
  ],
  WRITE: [
    { value: 'none', label: 'no-editing-access', icon: IconBan },
    { value: 'add', label: 'create-only', icon: IconPlus },
    { value: 'own', label: 'edit-own-records', icon: IconUser },
    {
      value: 'ltLvl',
      label: 'edit-records-at-lower-access-levels',
      icon: IconMathLower,
    },
    {
      value: 'lteLvl',
      label: 'edit-records-at-the-same-access-level',
      icon: IconMathEqualLower,
    },
    { value: 'gtLvl', label: 'full-access', icon: IconMathGreater },
  ],
} as const satisfies Record<
  'READ' | 'WRITE',
  ReadonlyArray<{ value: string; label: string; icon: TablerIcon }>
>;

export type PermissionReadScope =
  (typeof ACCOUNT_PERMISSIONS.READ)[number]['value'];
export type PermissionWriteScope =
  (typeof ACCOUNT_PERMISSIONS.WRITE)[number]['value'];

export interface IPermission {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  accountId: string;
  level?: number;
  read?: PermissionReadScope;
  write?: PermissionWriteScope;
  user?: IPermissionUser;
  account?: IPermissionAccount;
}
