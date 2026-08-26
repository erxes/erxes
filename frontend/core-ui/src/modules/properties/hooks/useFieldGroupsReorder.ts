import { useApolloClient, useMutation } from '@apollo/client';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from 'ui-modules';
import { FIELD_GROUP_EDIT } from '../graphql/mutations/propertiesMutations';
import { IFieldGroup } from '../types/Properties';

export const useFieldGroupsReorder = ({
  contentType,
}: {
  contentType: string;
}) => {
  const client = useApolloClient();
  const [mutate, { loading }] = useMutation(FIELD_GROUP_EDIT);

  const reorderFieldGroups = async (
    fieldGroups: IFieldGroup[],
    activeId: string,
    overId: string,
  ) => {
    const from = fieldGroups.findIndex((group) => group._id === activeId);
    const to = fieldGroups.findIndex((group) => group._id === overId);

    if (from === -1 || to === -1 || from === to) {
      return;
    }

    // The list arrives sorted by `order`, so the existing order values can be
    // handed out again by position: only the groups between the drag source
    // and target end up with a different value.
    const orders = fieldGroups.map((group) => group.order);
    const reordered = arrayMove(fieldGroups, from, to).map((group, index) => ({
      ...group,
      order: orders[index],
    }));
    const previousOrders = new Map(
      fieldGroups.map((group) => [group._id, group.order]),
    );
    const changed = reordered.filter(
      (group) => previousOrders.get(group._id) !== group.order,
    );

    const variables = { params: { contentType } };

    client.cache.updateQuery(
      { query: FIELD_GROUPS_QUERY, variables },
      (data) =>
        data && {
          ...data,
          fieldGroups: { ...data.fieldGroups, list: reordered },
        },
    );

    try {
      for (const group of changed) {
        await mutate({ variables: { id: group._id, order: group.order } });
      }
    } catch (error) {
      await client.refetchQueries({ include: [FIELD_GROUPS_QUERY] });

      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return {
    reorderFieldGroups,
    loading,
  };
};
