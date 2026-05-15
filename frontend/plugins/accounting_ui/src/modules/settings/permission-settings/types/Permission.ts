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

export const ACCOUNT_PERMISSION_SCOPES = {
  NONE: 'none',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  VALUES: ['none', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
} as const;

export const ACCOUNT_PERMISSION_WRITE_SCOPES = {
  NONE: 'none',
  ADD: 'add',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  VALUES: ['none', 'add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
} as const;

export type PermissionReadScope =
  | 'none'
  | 'own'
  | 'ltLvl'
  | 'lteLvl'
  | 'gtLvl';

export type PermissionWriteScope =
  | 'none'
  | 'add'
  | 'own'
  | 'ltLvl'
  | 'lteLvl'
  | 'gtLvl';

export const ACCOUNT_PERMISSION_LABELS = [
  { value: 'none', label: 'Уншихгүй' },
  { value: 'own', label: 'Өөрийнхийгөө уншина' },
  { value: 'ltLvl', label: 'Бага түвшнийг уншина' },
  { value: 'lteLvl', label: 'Чацуу түвшнийг уншина' },
  { value: 'gtLvl', label: 'Бүгдийг уншина' },
] as const;

export const ACCOUNT_PERMISSION_WRITE_LABELS = [
  { value: 'none', label: 'Бичихгүй' },
  { value: 'add', label: 'Зөвхөн үүсгэж чадна' },
  { value: 'own', label: 'Өөрийн үүсгэснийг засна' },
  { value: 'ltLvl', label: 'Бага түвшнийг засна' },
  { value: 'lteLvl', label: 'Чацуу түвшнийг засна' },
  { value: 'gtLvl', label: 'Бүх эрх' },
] as const;

export const PERMISSION_READ_LABELS: Record<PermissionReadScope, string> =
  Object.fromEntries(
    ACCOUNT_PERMISSION_LABELS.map(({ value, label }) => [value, label]),
  ) as Record<PermissionReadScope, string>;

export const PERMISSION_WRITE_LABELS: Record<PermissionWriteScope, string> =
  Object.fromEntries(
    ACCOUNT_PERMISSION_WRITE_LABELS.map(({ value, label }) => [value, label]),
  ) as Record<PermissionWriteScope, string>;

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

export interface ISetAccountPermissionForm {
  accountIds: string[];
  userId: string;
  level: number;
  read: PermissionReadScope;
  write: PermissionWriteScope;
}

export const PERMISSION_NONE = 'none';
