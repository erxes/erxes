import { gql, MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ITag } from 'ui-modules/index';

const ADD_TAG = gql`
  mutation TagsAdd(
    $name: String!
    $type: String
    $colorCode: String
    $parentId: String
    $description: String
    $isGroup: Boolean
  ) {
    tagsAdd(
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
      description: $description
      isGroup: $isGroup
    ) {
      _id
      name
      colorCode
      parentId
      relatedIds
      isGroup
      description
      type
      order
      objectCount
      totalObjectCount
      createdAt
    }
  }
`;

const EDIT_TAG = gql`
  mutation TagsEdit(
    $id: String!
    $name: String
    $type: String
    $colorCode: String
    $parentId: String
    $isGroup: Boolean
    $description: String
  ) {
    tagsEdit(
      _id: $id
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
      isGroup: $isGroup
      description: $description
    ) {
      _id
      name
      colorCode
      parentId
      isGroup
      description
      type
    }
  }
`;

export const useTagsAdd = () => {
  const [addTag, { loading }] = useMutation(ADD_TAG);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addTag({
      ...options,
      variables,
      onCompleted: (data) => {
        if (data?.tagsAdd) {
          toast({ title: 'Tag added successfully!' });
        }
      },
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to add tag',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    addTag: mutate,
    loading,
  };
};

export const useTagsEdit = () => {
  const [editTag, { loading }] = useMutation(EDIT_TAG);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editTag({
      ...options,
      variables,
      optimisticResponse: {
        tagsEdit: {
          id: variables?.id,
          __typename: 'Tag',
          ...variables,
        },
      },
      update: (cache, { data: { tagsEdit } }) => {
        cache.modify({
          id: cache.identify(tagsEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field as keyof ITag];
              return fields;
            },
            {},
          ),
        });
      },
      onCompleted: (data) => {
        if (data?.tagsEdit) {
          toast({ title: 'Tag updated successfully!' });
        }
        options.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to update tag',
          variant: 'destructive',
        });
        options.onError?.(error);
      },
    });
  };

  return {
    tagsEdit: mutate,
    loading,
  };
};
