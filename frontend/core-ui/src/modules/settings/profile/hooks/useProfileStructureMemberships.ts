import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { PROFILE_STRUCTURE_MEMBERSHIPS } from '@/settings/profile/graphql/queries/userDetail';
import { IUserStructureMembership } from '@/settings/team-member/types';

export const useProfileStructureMemberships = () => {
  const currentUser = useAtomValue(currentUserState);

  const { data, loading, error } = useQuery<{
    userDetail?: { structureMemberships?: IUserStructureMembership[] };
  }>(PROFILE_STRUCTURE_MEMBERSHIPS, {
    variables: { _id: currentUser?._id },
    skip: !currentUser?._id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    memberships: data?.userDetail?.structureMemberships ?? [],
    loading,
    error,
  };
};
