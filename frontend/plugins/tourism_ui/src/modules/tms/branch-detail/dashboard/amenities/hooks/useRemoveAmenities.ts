import { useMutation } from '@apollo/client';
import { REMOVE_AMENITY } from '../graphql/mutation';

export const useRemoveAmenities = () => {
  const [removeAmenitiesMutation] = useMutation(REMOVE_AMENITY, {
    refetchQueries: ['BmsAmenities'],
  });

  return removeAmenitiesMutation;
};
