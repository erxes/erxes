import { useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';

const useUsersGroups = () => {
  const { data, loading, error } = useQuery(queries.GET_USERS_GROUPS_QUERY, {
    onError(error) {
      console.error(error.message);
    },
  });
  const usersGroups = data?.usersGroups || [];
  return {
    usersGroups,
    loading,
    error,
  };
};

export { useUsersGroups };
