import { useMutation } from '@apollo/client';
import { FIELD_GROUP_ADD } from '../graphql/propertyFormMutations';
import { toast } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from '../graphql/fieldsQueries';
import { IPropertyContentScope } from '../types/fieldsTypes';

type TFieldGroupAddData = {
  fieldGroupAdd: { _id: string };
};

type TFieldGroupAddVariables = IPropertyContentScope & {
  name: string;
  code?: string;
  logics?: Record<string, unknown>;
  configs?: Record<string, unknown>;
};

export const useAddPropertyGroup = (
  contentType: string,
  contentTypeId?: string,
) => {
  const [addPropertyGroup, { loading }] = useMutation<
    TFieldGroupAddData,
    TFieldGroupAddVariables
  >(FIELD_GROUP_ADD, {
    refetchQueries: [
      {
        query: FIELD_GROUPS_QUERY,
        variables: { params: { contentType, contentTypeId } },
      },
    ],
    onCompleted: () => {
      toast({ title: 'Created a group', variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create a group',
        variant: 'destructive',
        description: error.message,
      });
    },
  });

  return {
    addPropertyGroup,
    loading,
  };
};
