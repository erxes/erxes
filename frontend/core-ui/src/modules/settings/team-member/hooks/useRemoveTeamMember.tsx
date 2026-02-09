import { useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import queries from '../graphql/usersQueries';

export const useTeamMemberRemove = () => {
  const [_removeTeamMember, { loading }] = useMutation(
    mutations.TEAM_MEMBER_REMOVE,
  );

  const removeTeamMember = async (teamMemberIds: string[]) => {
    await _removeTeamMember({
      variables: { _ids: teamMemberIds },
      refetchQueries: [queries.GET_USERS_QUERY],
      update: (cache) => {
        cache.updateQuery(
          {
            query: queries.GET_USERS_QUERY,
          },
          ({ users }) => {
            const updatedUsers = users.list.filter(
              (user: any) => !teamMemberIds.includes(user._id),
            );

            return {
              users: {
                ...users,
                list: updatedUsers,
                totalCount: users.totalCount - teamMemberIds.length,
              },
            };
          },
        );
      },
    });
  };

  return { removeTeamMember, loading };
};
