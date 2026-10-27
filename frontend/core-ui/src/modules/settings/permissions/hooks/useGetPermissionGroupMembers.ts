import { useQuery } from '@apollo/client';
import { GET_PERMISSION_GROUP_MEMBERS } from '@/settings/permissions/graphql/permissionGroupQueries';
import { IPermissionGroupMember } from '@/settings/permissions/types';

export const useGetPermissionGroupMembers = ({
  groupId,
  page,
  perPage,
  skip,
}: {
  groupId: string;
  page: number;
  perPage: number;
  skip?: boolean;
}) => {
  const { data, loading, error } = useQuery<{
    permissionGroupMembers: {
      list: IPermissionGroupMember[];
      totalCount: number;
    };
  }>(GET_PERMISSION_GROUP_MEMBERS, {
    variables: { _id: groupId, page, perPage },
    skip,
    fetchPolicy: 'cache-and-network',
  });

  return {
    members: data?.permissionGroupMembers.list ?? [],
    totalCount: data?.permissionGroupMembers.totalCount ?? 0,
    loading,
    error,
  };
};
