import { EMAIL_ADDRESSES } from '@/settings/email-addresses/graphql/queries';
import { IEmailAddress, TEmailLane } from '@/settings/email-addresses/types';
import { useQuery } from '@apollo/client';
import { ICursorListResponse } from 'erxes-ui';
import { useMemo } from 'react';

export const useEmailLanes = (emails: string[]) => {
  const wanted = useMemo(
    () => [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))],
    [emails],
  );

  const { data, loading } = useQuery<ICursorListResponse<IEmailAddress>>(
    EMAIL_ADDRESSES,
    {
      variables: { emails: wanted, limit: wanted.length },
      skip: !wanted.length,
    },
  );

  const lanes = useMemo(() => {
    const map = new Map<string, TEmailLane>();

    for (const address of data?.emailAddresses?.list || []) {
      map.set(address.email.toLowerCase(), address.lane);
    }

    return map;
  }, [data]);

  return {
    lanes,
    laneOf: (email?: string) =>
      (email && lanes.get(email.toLowerCase())) || 'unknown',
    loading,
  };
};
