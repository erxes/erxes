import { useMutation } from '@apollo/client';
import { EDIT_AMENITY } from '../graphql/mutation';
import { IAmenityTranslationInput } from './useCreateAmenity';

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
  language?: string;
  translations?: IAmenityTranslationInput[];
}

export const useEditAmenity = () => {
  const [editAmenityMutation, { loading, error }] = useMutation<
    EditAmenityResponse,
    IEditAmenityVariables
  >(EDIT_AMENITY, {
    refetchQueries: ['BmsAmenities'],
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
