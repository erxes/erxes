import { arrayMove } from '@dnd-kit/sortable';
import { stored } from 'erxes-ui';
import { useAtom } from 'jotai';
import { z } from 'zod';

/**
 * `items` in the member's saved order. Ids the order doesn't name yet (a plugin installed since)
 * keep their own order after the ones it does.
 */
export const sortBySaved = <T>(order: string[], items: T[], idOf: (item: T) => string): T[] => {
  const rank = (item: T) => {
    const index = order.indexOf(idOf(item));

    return index === -1 ? order.length : index;
  };

  return items.toSorted((a, b) => rank(a) - rank(b));
};

/**
 * The saved order after `from` is dropped on `to` among the `shown` ids. Ids saved but not shown
 * here (a plugin this record doesn't use) stay in the order after them.
 */
export const moveInSaved = (order: string[], shown: string[], from: string, to: string) => {
  const moved = arrayMove(shown, shown.indexOf(from), shown.indexOf(to));

  return [...moved, ...order.filter((id) => !moved.includes(id))];
};

/** An order a member drags into place, kept in this browser under `key`. */
export const savedOrderState = (key: string) =>
  stored({ key, schema: z.array(z.string()), initial: [] });

export const useSavedOrder = (state: ReturnType<typeof savedOrderState>) => {
  const [order, setOrder] = useAtom(state);

  return {
    sort: <T>(items: T[], idOf: (item: T) => string) => sortBySaved(order, items, idOf),
    move: (shown: string[], from: string, to: string) => {
      if (shown.includes(from) && shown.includes(to) && from !== to) {
        setOrder(moveInSaved(order, shown, from, to));
      }
    },
  };
};
