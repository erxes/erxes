import { useMutation } from '@apollo/client';
import { REMOVE_ITINERARY } from '../graphql/mutation';

export const useRemoveItineraries = () => {
  const [removeItinerariesMutation, { loading }] = useMutation(
    REMOVE_ITINERARY,
    {
      refetchQueries: ['BmsItineraries'],
      awaitRefetchQueries: true,
    },
  );

  const removeItineraries = async (ids: string[]) => {
    return removeItinerariesMutation({
      variables: { ids },
    });
  };

  return {
    removeItineraries,
    loading,
  };
};
