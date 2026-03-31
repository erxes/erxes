import { useMutation } from '@apollo/client';
import { CREATE_CATEGORY } from '../graphql/mutation';
import { IAttachment } from '../types/category';

interface CreateCategoryResponse {
  bmsTourCategoryAdd: {
    _id: string;
  };
}

export interface ICreateCategoryVariables {
  name?: string;
  code?: string;
  parentId?: string;
  branchId?: string;
  attachment?: IAttachment;
}

export const useCreateCategory = () => {
  const [createCategoryMutation, { loading, error }] = useMutation<
    CreateCategoryResponse,
    ICreateCategoryVariables
  >(CREATE_CATEGORY, {
    refetchQueries: ['BmsTourCategories'],
    awaitRefetchQueries: true,
  });

  const createCategory = (options: {
    variables: ICreateCategoryVariables;
    onCompleted?: (data: CreateCategoryResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createCategoryMutation(options);
  };

  return {
    createCategory,
    loading,
    error,
  };
};
