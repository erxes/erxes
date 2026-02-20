import { OperationVariables, useMutation } from '@apollo/client';
import { mutations } from '@/settings/team-member/graphql';

const useUsersInvite = () => {
  const [invite, { loading }] = useMutation(mutations.USERS_INVITE, {
    onError(error) {
      console.error(error.message);
    },
  });
  const handleInvitations = async (options: OperationVariables) => {
    try {
      await invite({
        ...options,
      });
    } catch (error) {
      console.error('Error occurred', error);
    }
  };

  return {
    handleInvitations,
    loading,
  };
};

export { useUsersInvite };
