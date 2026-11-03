import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { AUTH_SUPPORT_ACCESS_ACTIVE } from '@/settings/support-access/graphql';
import { ISupportGrantSummary } from '@/settings/support-access/types';
import { formatGrantEnd } from '@/settings/support-access/utils';

export type TSupportAccessBanner = {
  messageKey: 'banner-self' | 'banner-owner' | 'banner-owner-many';
  values: Record<string, string | number>;
  canManage: boolean;
};

export const useSupportAccessBanner = (): TSupportAccessBanner | null => {
  const currentUser = useAtomValue(currentUserState);
  const isSupportUser = currentUser?.passwordManagedBy === 'erxes_support';

  const { data } = useQuery<{
    authSupportAccessActive: ISupportGrantSummary[];
  }>(AUTH_SUPPORT_ACCESS_ACTIVE, {
    // Only owners and the support user themselves are told about a visit
    skip: !currentUser?.isOwner && !isSupportUser,
    pollInterval: 60_000,
  });

  const grants = data?.authSupportAccessActive ?? [];

  if (!grants.length) {
    return null;
  }

  const [first] = grants;
  const endsAt = formatGrantEnd(first.endsAt);

  if (isSupportUser) {
    return { messageKey: 'banner-self', values: { endsAt }, canManage: false };
  }

  if (grants.length > 1) {
    return {
      messageKey: 'banner-owner-many',
      values: { count: grants.length },
      canManage: true,
    };
  }

  return {
    messageKey: 'banner-owner',
    values: { name: first.staffName, endsAt },
    canManage: true,
  };
};
