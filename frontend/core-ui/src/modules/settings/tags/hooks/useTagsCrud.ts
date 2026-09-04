import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import {
  ADD_TAG,
  EDIT_TAG,
  REMOVE_TAG,
} from 'ui-modules/modules/tags-new/graphql/tagMutations';
import { TAGS_QUERY } from 'ui-modules/modules/tags-new/graphql/tagQueries';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';

type AddTagVariables = {
  name: string;
  type: string | null;
  colorCode: string;
  parentId?: string;
  description?: string;
  isGroup?: boolean;
};

type EditTagVariables = {
  id: string;
  name?: string;
  description?: string;
  parentId?: string | null;
  isGroup?: boolean;
  colorCode?: string;
};

export const useTagsCrud = (type: string | null) => {
  const { toast } = useToast();
  const [addMutation, addState] = useMutation(ADD_TAG);
  const [editMutation, editState] = useMutation(EDIT_TAG);
  const [removeMutation, removeState] = useMutation(REMOVE_TAG);

  const addTag = async (variables: AddTagVariables) => {
    try {
      const response = await addMutation({
        variables,
        optimisticResponse: {
          tagsAdd: {
            __typename: 'Tag',
            _id: `new-tag-${Date.now()}`,
            name: variables.name,
            colorCode: variables.colorCode,
            isGroup: variables.isGroup || false,
            parentId: variables.parentId || null,
            description: variables.description || null,
            type: variables.type,
            createdAt: new Date().toISOString(),
            relatedIds: null,
            objectCount: 0,
            totalObjectCount: 0,
          },
        },
        update: (cache, { data }) => {
          const tagsAdd = data?.tagsAdd;
          if (!tagsAdd) return;

          cache.updateQuery(
            {
              query: TAGS_QUERY,
              variables: {
                excludeWorkspaceTags: true,
                type: variables.type,
              },
            },
            (current) => ({
              tagsMain: [tagsAdd, ...(current?.tagsMain || [])],
            }),
          );
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      return response.data?.tagsAdd as ITag | undefined;
    } catch {
      return undefined;
    }
  };

  const editTag = async (variables: EditTagVariables) => {
    try {
      const response = await editMutation({
        variables,
        optimisticResponse: {
          tagsEdit: {
            __typename: 'Tag',
            _id: variables.id,
            name: variables.name,
            colorCode: variables.colorCode,
            parentId:
              variables.parentId === undefined ? undefined : variables.parentId,
            isGroup: variables.isGroup,
            description: variables.description,
            type,
          },
        },
        update: (cache, { data }) => {
          const tagsEdit = data?.tagsEdit;
          if (!tagsEdit) return;

          cache.modify({
            id: cache.identify(tagsEdit),
            fields: Object.keys(variables).reduce(
              (fields: Record<string, () => unknown>, key) => {
                if (key === 'id') return fields;
                fields[key] = () =>
                  variables[key as keyof EditTagVariables] ?? null;
                return fields;
              },
              {},
            ),
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      return response.data?.tagsEdit as ITag | undefined;
    } catch {
      return undefined;
    }
  };

  const removeTag = async (id: string) => {
    await removeMutation({
      variables: { id },
      refetchQueries: [
        {
          query: TAGS_QUERY,
          variables: {
            excludeWorkspaceTags: true,
            type,
          },
        },
      ],
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    addTag,
    editTag,
    removeTag,
    loading: addState.loading || editState.loading || removeState.loading,
  };
};
