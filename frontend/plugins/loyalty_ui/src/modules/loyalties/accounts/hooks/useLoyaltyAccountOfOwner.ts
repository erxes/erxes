import { useQuery } from '@apollo/client';
import { LOYALTY_ACCOUNT_OF_OWNER } from '../graphql';

export const useLoyaltyAccountOfOwner = ({
  ownerType,
  ownerId,
}: {
  ownerType?: string;
  ownerId?: string;
}) => {
  const { data, loading, error } = useQuery(LOYALTY_ACCOUNT_OF_OWNER, {
    variables: { ownerType: ownerType || '', ownerId: ownerId || '' },
    skip: !ownerType || !ownerId,
    fetchPolicy: 'cache-and-network',
  });

  return { account: data?.loyaltyAccountOfOwner || null, loading, error };
};
