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
