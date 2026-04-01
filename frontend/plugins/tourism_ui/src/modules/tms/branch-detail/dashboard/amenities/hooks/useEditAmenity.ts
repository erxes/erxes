import { useMutation } from '@apollo/client';
import { EDIT_AMENITY } from '../graphql/mutation';

interface EditAmenityResponse {
  bmsElementEdit: {
    _id: string;
  };
}

export interface IEditAmenityVariables {
  id: string;
  name?: string;
  icon?: string;
  quick?: boolean;
}

export const useEditAmenity = () => {
  const [editAmenityMutation, { loading, error }] = useMutation<
    EditAmenityResponse,
    IEditAmenityVariables
  >(EDIT_AMENITY, {
    refetchQueries: ['BmsElements'],
    awaitRefetchQueries: true,
  });

  const editAmenity = (options: {
    variables: IEditAmenityVariables;
    onCompleted?: (data: EditAmenityResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editAmenityMutation(options);
  };

  return {
    editAmenity,
    loading,
    error,
  };
};
