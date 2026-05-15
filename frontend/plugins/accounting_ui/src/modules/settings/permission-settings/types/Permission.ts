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
    { value: 'none', label: 'Уншихгүй', icon: IconBan },
    { value: 'own', label: 'Өөрийнхийгөө уншина', icon: IconUser },
    { value: 'ltLvl', label: 'Бага түвшнийг уншина', icon: IconMathLower },
    {
      value: 'lteLvl',
      label: 'Чацуу түвшнийг уншина',
      icon: IconMathEqualLower,
    },
    { value: 'gtLvl', label: 'Бүгдийг уншина', icon: IconMathGreater },
  ],
  WRITE: [
    { value: 'none', label: 'Бичихгүй', icon: IconBan },
    { value: 'add', label: 'Зөвхөн үүсгэж чадна', icon: IconPlus },
    { value: 'own', label: 'Өөрийн үүсгэснийг засна', icon: IconUser },
    { value: 'ltLvl', label: 'Бага түвшнийг засна', icon: IconMathLower },
    { value: 'lteLvl', label: 'Чацуу түвшнийг засна', icon: IconMathEqualLower },
    { value: 'gtLvl', label: 'Бүх эрх', icon: IconMathGreater },
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
