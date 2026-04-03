import { useMutation } from '@apollo/client';
import { EDIT_CATEGORY } from '../graphql/mutation';
import { IAttachment } from '../types/category';

interface EditCategoryResponse {
  bmsTourCategoryEdit: {
    _id: string;
  };
}

export interface IEditCategoryVariables {
  id: string;
  name?: string;
  code?: string;
  parentId?: string;
  branchId?: string;
  attachment?: IAttachment;
}

export const useEditCategory = () => {
  const [editCategoryMutation, { loading, error }] = useMutation<
    EditCategoryResponse,
    IEditCategoryVariables
  >(EDIT_CATEGORY, {
    refetchQueries: ['BmsTourCategories'],
    awaitRefetchQueries: true,
  });

  const editCategory = (options: {
    variables: IEditCategoryVariables;
    onCompleted?: (data: EditCategoryResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editCategoryMutation(options);
  };

  return {
    editCategory,
    loading,
    error,
  };
};
