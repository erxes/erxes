import { useQuery } from '@apollo/client';
import { LOYALTY_ACCOUNT_OF_OWNER } from '../graphql';
import { ILoyaltyAccount } from '../types';

export const useLoyaltyAccountOfOwner = ({
  ownerType,
  ownerId,
}: {
  ownerType?: string;
  ownerId?: string;
}) => {
  const { data, loading, error } = useQuery<{
    loyaltyAccountOfOwner: ILoyaltyAccount | null;
  }>(LOYALTY_ACCOUNT_OF_OWNER, {
    variables: { ownerType, ownerId },
    skip: !ownerType || !ownerId,
    fetchPolicy: 'cache-and-network',
  });

  return { account: data?.loyaltyAccountOfOwner || null, loading, error };
};
