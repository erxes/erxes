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
    { value: 'none', label: 'no-read-access', icon: IconBan },
    { value: 'own', label: 'view-own-records', icon: IconUser },
    { value: 'ltLvl', label: 'view-lower-access-levels', icon: IconMathLower },
    {
      value: 'lteLvl',
      label: 'view-same-access-level',
      icon: IconMathEqualLower,
    },
    { value: 'gtLvl', label: 'view-all', icon: IconMathGreater },
  ],
  WRITE: [
    { value: 'none', label: 'no-write-access', icon: IconBan },
    { value: 'add', label: 'create-access-only', icon: IconPlus },
    { value: 'own', label: 'edit-own-records', icon: IconUser },
    { value: 'ltLvl', label: 'edit-lower-access-levels', icon: IconMathLower },
    {
      value: 'lteLvl',
      label: 'edit-same-access-level',
      icon: IconMathEqualLower,
    },
    { value: 'gtLvl', label: 'all-permissions', icon: IconMathGreater },
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
