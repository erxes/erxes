import { useMutation } from '@apollo/client';
import { CREATE_AMENITY } from '../graphql/mutation';

interface CreateAmenityResponse {
  bmsElementAdd: {
    _id: string;
  };
}

export interface IAmenityTranslationInput {
  language: string;
  name?: string;
}

export interface ICreateAmenityVariables {
  branchId?: string;
  name?: string;
  icon?: string;
  quick?: boolean;
  language?: string;
  translations?: IAmenityTranslationInput[];
}

export const useCreateAmenity = () => {
  const [createAmenityMutation, { loading, error }] = useMutation<
    CreateAmenityResponse,
    ICreateAmenityVariables
  >(CREATE_AMENITY, {
    refetchQueries: ['BmsAmenities'],
    awaitRefetchQueries: true,
  });

  const createAmenity = (options: {
    variables: ICreateAmenityVariables;
    onCompleted?: (data: CreateAmenityResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createAmenityMutation(options);
  };

  return {
    createAmenity,
    loading,
    error,
  };
};
