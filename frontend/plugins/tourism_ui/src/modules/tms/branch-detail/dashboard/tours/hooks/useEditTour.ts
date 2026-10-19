import { useMutation } from '@apollo/client';
import { EDIT_TOUR } from '../graphql/mutation';
import {
  GET_TOURS,
  GET_TOUR_GROUPS,
  GET_TOUR_DETAIL,
} from '../graphql/queries';
import type { BmsTourEditMutationVariables } from '~/gql/graphql';

export const useEditTour = () => {
  const [editTourMutation, { loading, error }] = useMutation(EDIT_TOUR, {
    refetchQueries: [{ query: GET_TOURS }, { query: GET_TOUR_GROUPS }],
  });

  const editTour = async (variables: BmsTourEditMutationVariables) => {
    const result = await editTourMutation({
      variables,
      refetchQueries: [
        { query: GET_TOURS },
        { query: GET_TOUR_GROUPS },
        { query: GET_TOUR_DETAIL, variables: { id: variables.id } },
      ],
      awaitRefetchQueries: true,
    });

    return result.data?.bmsTourEdit;
  };

  return {
    editTour,
    loading,
    error,
  };
};
