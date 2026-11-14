import { arrayMove } from '@dnd-kit/sortable';

/**
 * Moves `activeId` onto `overId` and gives the list its old order values in
 * the new arrangement; returns only the items whose order changed.
 */
export const reorderItems = <T extends { id: string; order: number }>(
  items: T[],
  activeId: string,
  overId: string,
) => {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);

  if (from === -1 || to === -1 || from === to) {
    return { list: items, changed: [] };
  }

  return withOrders(items, arrayMove(items, from, to));
};

/** `next` (a rearranged `items`) with `items`' order values; only changed ones in `changed`. */
export const withOrders = <T extends { id: string; order: number }>(items: T[], next: T[]) => {
  let orders = items.map((item) => item.order).toSorted((a, b) => a - b);

  // Equal orders cannot express a new arrangement: number them from the first.
  if (new Set(orders).size !== orders.length) {
    orders = orders.map((_, index) => (orders[0] ?? 0) + index);
  }

  const previous = new Map(items.map((item) => [item.id, item.order]));
  const list = next.map((item, index) => ({ ...item, order: orders[index] ?? index }));

  return {
    list,
    changed: list
      .filter((item) => previous.get(item.id) !== item.order)
      .map(({ id, order }) => ({ id, order })),
  };
};
