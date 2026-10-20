import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { VOUCHERS_QUERY } from '../graphql/queries/queries';
import { toVoucher } from '../utils/parseVoucher';
import { voucherDisplayStatus } from '../utils/voucherView';

const OWNER_VOUCHERS_LIMIT = 50;

/** One owner's vouchers: the ones still to use first, the rest counted. */
export const useOwnerVouchers = (ownerId: string, ownerType: string) => {
  const { data, loading } = useQuery(VOUCHERS_QUERY, {
    variables: { ownerId, ownerType, perPage: OWNER_VOUCHERS_LIMIT },
    skip: !ownerId,
  });

  const vouchers = useMemo(
    () => compactList(data?.vouchersMain?.list).map(toVoucher),
    [data?.vouchersMain?.list],
  );
  const open = vouchers.filter((voucher) =>
    ['new', 'onhold'].includes(voucherDisplayStatus(voucher)),
  );

  return {
    loading,
    open,
    closedCount: (data?.vouchersMain?.totalCount || 0) - open.length,
  };
};
