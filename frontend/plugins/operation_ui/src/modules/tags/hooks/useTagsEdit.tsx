import { MutationHookOptions, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'erxes-ui';

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
      order
    }
  }
`;

const EDIT_TAG = gql`
  mutation TagsEdit(
    $id: String!
    $name: String!
    $type: String
    $colorCode: String
    $parentId: String
    $description: String
    $isGroup: Boolean
  ) {
    tagsEdit(
      _id: $id
      name: $name
      type: $type
      colorCode: $colorCode
      parentId: $parentId
      description: $description
      isGroup: $isGroup
    ) {
      _id
    }
  }
`;

export const useTagsAdd = () => {
  const [addTag, { loading }] = useMutation(ADD_TAG);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addTag({
      ...options,
      variables,
      refetchQueries: ['Tags'],
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
      refetchQueries: ['Tags'],
      onCompleted: (data) => {
        if (data?.tagsEdit) {
          toast({ title: 'Tag updated successfully!' });
        }
      },
      onError: (error) => {
        toast({
          title: error?.message || 'Failed to update tag',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    tagsEdit: mutate,
    loading,
  };
};
