import { useQuery } from '@apollo/client';
import { LOYALTY_ACCOUNT_TYPE_LIST } from '../graphql/loyaltyAccountTypeQueries';
import {
  ILoyaltyAccountType,
  TLoyaltyOwnerType,
  TLoyaltyAccountTypeStatus,
} from '../types';

export const useLoyaltyAccountTypes = (
  variables: {
    status?: TLoyaltyAccountTypeStatus;
    ownerType?: TLoyaltyOwnerType;
  } = {},
  skip = false,
) => {
  const { data, loading, error } = useQuery<{
    loyaltyAccountTypes: ILoyaltyAccountType[];
  }>(LOYALTY_ACCOUNT_TYPE_LIST, { variables, skip });

  return { accounts: data?.loyaltyAccountTypes || [], loading, error };
};
