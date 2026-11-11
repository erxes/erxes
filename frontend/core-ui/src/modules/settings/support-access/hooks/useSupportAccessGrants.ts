import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { toast, useConfirm, useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AUTH_SUPPORT_ACCESS_ACTIVE,
  AUTH_SUPPORT_ACCESS_APPROVE,
  AUTH_SUPPORT_ACCESS_DENY,
  AUTH_SUPPORT_ACCESS_GRANTS,
  AUTH_SUPPORT_ACCESS_REVOKE,
} from '@/settings/support-access/graphql';
import { TSupportGrantApprovalForm } from '@/settings/support-access/schema';
import { ISupportGrant } from '@/settings/support-access/types';
import { groupSupportGrants } from '@/settings/support-access/utils';

// The banner reads the active list, so both refresh after every answer
const REFETCH = [AUTH_SUPPORT_ACCESS_GRANTS, AUTH_SUPPORT_ACCESS_ACTIVE];

export const APPROVE_GRANT_QUERY_KEY = 'support_grant_id';

export const useSupportAccessGrants = ({ poll = false } = {}) => {
  const { data, loading, error } = useQuery<{
    authSupportAccessGrants: ISupportGrant[];
  }>(AUTH_SUPPORT_ACCESS_GRANTS, {
    fetchPolicy: 'cache-and-network',
    // New requests arrive from erxes.io, not from this page
    pollInterval: poll ? 60_000 : 0,
  });

  const groups = useMemo(
    () => groupSupportGrants(data?.authSupportAccessGrants ?? []),
    [data],
  );

  return { ...groups, loading: loading && !data, error };
};

export const useSupportGrantActions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const [approveGrant, { loading: approving }] = useMutation(
    AUTH_SUPPORT_ACCESS_APPROVE,
    { refetchQueries: REFETCH },
  );
  const [denyGrant, { loading: denying }] = useMutation(
    AUTH_SUPPORT_ACCESS_DENY,
    { refetchQueries: REFETCH },
  );
  const [revokeGrant, { loading: revoking }] = useMutation(
    AUTH_SUPPORT_ACCESS_REVOKE,
    { refetchQueries: REFETCH },
  );

  const feedback = (title: string, onDone?: () => void) => ({
    onCompleted: () => {
      toast({ title, variant: 'success' });
      onDone?.();
    },
    onError: (e: ApolloError) =>
      toast({ title: e.message, variant: 'destructive' }),
  });

  const approve = (
    variables: TSupportGrantApprovalForm & { _id: string },
    onDone?: () => void,
  ) => approveGrant({ variables, ...feedback(t('approved'), onDone) });

  const deny = (_id: string) =>
    denyGrant({ variables: { _id }, ...feedback(t('denied')) });

  const revoke = (_id: string) =>
    revokeGrant({ variables: { _id }, ...feedback(t('revoked')) });

  return {
    approve,
    deny,
    revoke,
    busy: approving || denying || revoking,
  };
};

export const useSupportGrantRowActions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const { confirm } = useConfirm();
  const [, setApproveId] = useQueryState<string>(APPROVE_GRANT_QUERY_KEY);
  const { deny, revoke, busy } = useSupportGrantActions();

  const openApprove = (grant: ISupportGrant) => setApproveId(grant._id);

  const confirmDeny = (grant: ISupportGrant) =>
    confirm({ message: t('confirm-deny', { name: grant.staffName }) }).then(
      () => deny(grant._id),
    );

  const confirmRevoke = (grant: ISupportGrant) =>
    confirm({ message: t('confirm-revoke', { name: grant.staffName }) }).then(
      () => revoke(grant._id),
    );

  return { openApprove, confirmDeny, confirmRevoke, busy };
};
