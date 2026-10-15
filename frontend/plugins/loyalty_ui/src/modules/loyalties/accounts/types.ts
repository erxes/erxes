import type {
  LoyaltyAccountFieldsFragment,
  LoyaltyAccountsQuery,
  LoyaltyTierLogsQuery,
} from '~/gql/graphql';

export type TLoyaltyAccountStatus = 'active' | 'frozen' | 'closed';

const ACCOUNT_STATUSES: TLoyaltyAccountStatus[] = [
  'active',
  'frozen',
  'closed',
];

export const isLoyaltyAccountStatus = (
  value: string,
): value is TLoyaltyAccountStatus =>
  ACCOUNT_STATUSES.some((status) => status === value);

export type ILoyaltyAccount = LoyaltyAccountFieldsFragment;

export type ILoyaltyAccountRow = NonNullable<
  NonNullable<
    NonNullable<LoyaltyAccountsQuery['loyaltyAccounts']>['list']
  >[number]
>;

export type ILoyaltyAccountBalance = NonNullable<
  NonNullable<ILoyaltyAccount['balances']>[number]
>;

export type ILoyaltyTierLog = NonNullable<
  NonNullable<LoyaltyTierLogsQuery['loyaltyTierLogs']>[number]
>;
