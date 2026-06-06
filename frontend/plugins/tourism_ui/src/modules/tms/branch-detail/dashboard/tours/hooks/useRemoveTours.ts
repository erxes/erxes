import { ApolloError, useMutation } from '@apollo/client';
import { REMOVE_TOUR } from '../graphql/mutation';

interface RemoveToursResponse {
  bmsTourRemove: string;
}

interface IRemoveToursVariables {
  ids: string[];
}

export const useRemoveTours = () => {
  const [removeToursMutation, { loading, error }] = useMutation<
    RemoveToursResponse,
    IRemoveToursVariables
  >(REMOVE_TOUR, {
    refetchQueries: ['BmsTours', 'BmToursGroup'],
    awaitRefetchQueries: true,
  });

  const removeTours = (options: {
    variables: IRemoveToursVariables;
    onCompleted?: (data: RemoveToursResponse) => void;
    onError?: (error: ApolloError) => void;
  }) => {
    return removeToursMutation(options);
  };

  return {
    removeTours,
    loading,
    error,
  };
};
