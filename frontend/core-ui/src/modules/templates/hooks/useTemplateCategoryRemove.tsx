import { TEMPLATE_CATEGORY_REMOVE } from '@/templates/graphql/mutations';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { QUERY_TEMPLATE_CATEGORIES } from 'ui-modules';

export interface ITemplateCategoryRemove {
  _ids?: string[];
}

export interface ITemplateCategoryRemoveResponse {
  templateCategoryRemove: boolean;
}

export const useTemplateCategoryRemove = () => {
  const [mutate, { loading }] = useMutation<
    ITemplateCategoryRemoveResponse,
    ITemplateCategoryRemove
  >(TEMPLATE_CATEGORY_REMOVE, {
    refetchQueries: [QUERY_TEMPLATE_CATEGORIES],
  });

  const templateCategoryRemove = ({
    variables,
    onError,
    onCompleted,
    ...options
  }: MutationHookOptions<
    ITemplateCategoryRemoveResponse,
    ITemplateCategoryRemove
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
          description: 'Category removed successfully',
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

  return { templateCategoryRemove, loading };
};
