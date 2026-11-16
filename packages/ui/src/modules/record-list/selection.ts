/**
 * The rows a click on `id` picks. With `anchor` (the row clicked before), every row from it to
 * `id` in `order`, the rows as shown; without, or when either left the list, `id` alone.
 */
export const rowsBetween = (order: readonly string[], anchor: string | null, id: string) => {
  const from = anchor === null ? -1 : order.indexOf(anchor);
  const to = order.indexOf(id);

  if (from === -1 || to === -1) return [id];

  return order.slice(Math.min(from, to), Math.max(from, to) + 1);
};

/** `picked` with `ids` added (`on`) or taken out. */
export const withRows = (picked: ReadonlySet<string>, ids: readonly string[], on: boolean) => {
  const next = new Set(picked);

  for (const id of ids) {
    if (on) next.add(id);
    else next.delete(id);
  }

  return next;
};

/**
 * One list's picked rows, outside React: each row subscribes to its own state, so a click
 * renders only the rows it changes. Every change starts from the current state, so changes
 * made before a render all count.
 */
export const createSelection = () => {
  let picked: ReadonlySet<string> = new Set();
  let anchor: string | null = null;
  const listeners = new Set<() => void>();

  const set = (next: ReadonlySet<string>) => {
    picked = next;

    for (const listener of listeners) listener();
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    picked: () => picked,
    /** With `order` (the rows as shown), a shift-click: every row since the last click. */
    toggle: (id: string, order?: readonly string[]) => {
      const rows = order ? rowsBetween(order, anchor, id) : [id];

      anchor = id;
      set(withRows(picked, rows, !picked.has(id)));
    },
    /** Picks all of `ids`, or clears them when all are picked. */
    toggleAll: (ids: readonly string[]) =>
      set(withRows(picked, ids, !ids.every((id) => picked.has(id)))),
    clear: () => {
      anchor = null;
      set(new Set());
    },
  };
};

export type Selection = ReturnType<typeof createSelection>;
