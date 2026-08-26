import { useApolloClient, useMutation } from '@apollo/client';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'erxes-ui';
import { useRef } from 'react';
import { FIELD_GROUPS_QUERY } from 'ui-modules';
import { FIELD_GROUPS_UPDATE_ORDER } from '../graphql/mutations/propertiesMutations';
import { IFieldGroup } from '../types/Properties';

type FieldGroupsReorder = {
  reorderFieldGroups: (
    fieldGroups: IFieldGroup[],
    activeId: string,
    overId: string,
  ) => Promise<void>;
  loading: boolean;
};

export const useFieldGroupsReorder = ({
  contentType,
}: {
  contentType: string;
}): FieldGroupsReorder => {
  const client = useApolloClient();
  const [mutate, { loading }] = useMutation(FIELD_GROUPS_UPDATE_ORDER);
  const pendingRef = useRef<Promise<void>>(Promise.resolve());

  const applyReorder = async (
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
    // handed out again by position: only the groups between the drag source and
    // the target end up with a different value.
    const orders = fieldGroups.map((group) => group.order);
    const nextList = arrayMove(fieldGroups, from, to).map((group, index) => ({
      ...group,
      order: orders[index],
    }));
    const previousOrders = new Map(
      fieldGroups.map((group) => [group._id, group.order]),
    );
    const changed = nextList
      .filter((group) => previousOrders.get(group._id) !== group.order)
      .map(({ _id, order }) => ({ _id, order }));

    client.cache.updateQuery(
      { query: FIELD_GROUPS_QUERY, variables: { params: { contentType } } },
      (data) =>
        data && {
          ...data,
          fieldGroups: { ...data.fieldGroups, list: nextList },
        },
    );

    try {
      await mutate({ variables: { orders: changed } });
    } catch (error) {
      await client.refetchQueries({ include: [FIELD_GROUPS_QUERY] });

      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  // A drop only writes the cache before its request goes out, so a second drag
  // already reads the new order. Chaining the requests keeps them from landing
  // out of order and overwriting each other on the server.
  const reorderFieldGroups = (
    fieldGroups: IFieldGroup[],
    activeId: string,
    overId: string,
  ) => {
    pendingRef.current = pendingRef.current.then(() =>
      applyReorder(fieldGroups, activeId, overId),
    );

    return pendingRef.current;
  };

  return {
    reorderFieldGroups,
    loading,
  };
};
