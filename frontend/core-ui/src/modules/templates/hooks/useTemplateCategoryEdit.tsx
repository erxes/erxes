import { TEMPLATE_CATEGORY_UPDATE } from '@/templates/graphql/mutations';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { QUERY_TEMPLATE_CATEGORIES } from 'ui-modules';

export interface ITemplateCategoryEdit {
  _id?: string;
  name?: string;
  code?: string;
  parentId?: string;
}

export interface ITemplateCategoryEditResponse {
  templateCategoryUpdate: {
    _id: string;
    name: string;
    code: string;
    parentId?: string;
    updatedAt: string;
    updatedBy: {
      _id: string;
      email: string;
      details: {
        avatar?: string;
        firstName?: string;
        fullName?: string;
        lastName?: string;
      };
    };
  };
}

export const useTemplateCategoryEdit = () => {
  const [mutate, { loading }] = useMutation<
    ITemplateCategoryEditResponse,
    ITemplateCategoryEdit
  >(TEMPLATE_CATEGORY_UPDATE, {
    refetchQueries: [QUERY_TEMPLATE_CATEGORIES],
  });

  const templateCategoryEdit = ({
    variables,
    onError,
    onCompleted,
    ...options
  }: MutationHookOptions<
    ITemplateCategoryEditResponse,
    ITemplateCategoryEdit
  >) => {
    return mutate({
      ...options,
      variables,
      onCompleted: (data) => {
        if (onCompleted) {
          onCompleted(data);
        }
        toast({
          title: 'Success',
          description: 'Category updated successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        }
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { templateCategoryEdit, loading };
};
