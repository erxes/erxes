import { TEMPLATE_CATEGORY_CREATE } from '@/templates/graphql/mutations';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { QUERY_TEMPLATE_CATEGORIES } from 'ui-modules';

export interface ITemplateCategoryAdd {
  name?: string;
  code?: string;
  parentId?: string;
}

export interface ITemplateCategoryAddResponse {
  templateCategoryCreate: {
    _id: string;
    name: string;
    code: string;
    parentId?: string;
    createdAt: string;
    createdBy: {
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

export const useTemplateCategoryAdd = () => {
  const [mutate, { loading }] = useMutation<
    ITemplateCategoryAddResponse,
    ITemplateCategoryAdd
  >(TEMPLATE_CATEGORY_CREATE, {
    refetchQueries: [QUERY_TEMPLATE_CATEGORIES],
  });

  const templateCategoryAdd = ({
    variables,
    onError,
    onCompleted,
    ...options
  }: MutationHookOptions<
    ITemplateCategoryAddResponse,
    ITemplateCategoryAdd
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
          description: 'Category added successfully',
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

  return { templateCategoryAdd, loading };
};
