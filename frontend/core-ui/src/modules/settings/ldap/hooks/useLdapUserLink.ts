import { useMutation, useQuery } from '@apollo/client';
import { usePermissionCheck } from 'ui-modules';
import { LDAP_LINKED_USER_IDS } from '@/settings/ldap/graphql/queries';
import {
  LDAP_LINK_USER,
  LDAP_UNLINK_USER,
} from '@/settings/ldap/graphql/mutations';

export const useLdapLinkedUserIds = () => {
  const { hasActionPermission } = usePermissionCheck();
  const canManage = hasActionPermission('permissionsManage');

  const { data, loading } = useQuery<{ authLdapLinkedUserIds: string[] }>(
    LDAP_LINKED_USER_IDS,
    { skip: !canManage },
  );

  const linkedUserIds = data?.authLdapLinkedUserIds ?? [];

  return {
    canManage,
    loading,
    isLinked: (userId: string) => linkedUserIds.includes(userId),
  };
};

const refetchLinkedUserIds = { refetchQueries: [LDAP_LINKED_USER_IDS] };

export const useLdapUserLink = () => {
  const [link, { loading: linking }] = useMutation<
    { authLdapLinkUser: boolean },
    { userId: string; identifier: string }
  >(LDAP_LINK_USER, refetchLinkedUserIds);

  const [unlink, { loading: unlinking }] = useMutation<
    { authLdapUnlinkUser: boolean },
    { userId: string }
  >(LDAP_UNLINK_USER, refetchLinkedUserIds);

  return { link, unlink, linking, unlinking };
};
