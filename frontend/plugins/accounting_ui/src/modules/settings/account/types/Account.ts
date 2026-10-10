import type { AccountingAccountDetailQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';

export type IAccount = GraphqlView<
  NonNullable<AccountingAccountDetailQuery['accountDetail']>
>;

export enum AccountKind {
  ACTIVE = 'active',
  PASSIVE = 'passive',
}

export const ACCOUNT_KIND_LABELS = {
  [AccountKind.ACTIVE]: 'Актив',
  [AccountKind.PASSIVE]: 'Пассив',
};

export enum AccountStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export const ACCOUNT_STATUS_LABELS = {
  [AccountStatus.ACTIVE]: 'Идэвхтэй',
  [AccountStatus.DELETED]: 'Устгасан',
};

export enum JournalEnum {
  MAIN = 'main',
  TAX = 'tax',
  CASH = 'cash',
  BANK = 'bank',
  DEBT = 'debt',
  EXCHANGE_DIFF = 'exchangeDiff',
  INVENTORY = 'inventory',
  INV_FOLLOW = 'invFollow',
  FIXED_ASSET = 'fixedAsset',
  FXA_FOLLOW = 'fxaFollow',
}
