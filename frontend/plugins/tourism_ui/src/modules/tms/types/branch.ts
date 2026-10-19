import type { BmsBranchListQuery } from '~/gql/graphql';

export type IBranch = NonNullable<
  NonNullable<NonNullable<BmsBranchListQuery['bmsBranchList']>['list']>[number]
>;

export interface IBranchUiOptions {
  logo?: string;
  favIcon?: string;
  mainLogo?: string;
  colors?: {
    primary?: string;
  };
}
