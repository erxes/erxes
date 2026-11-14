/**
 * Async work that must run one step at a time. `no-await-in-loop` is on, so a
 * loop that queries per item is a lint error: batch it with `inArray` or a
 * set-based update. These two are for the loops that are sequential on
 * purpose, so every one of them can be found by name.
 */

/**
 * Runs `run` on each item, each after the previous one finished: savepoints,
 * a hash chain, commit order, or a remote that must not get them all at once.
 * The first error stops it.
 */
export const inOrder = <T>(items: Iterable<T>, run: (item: T, index: number) => Promise<unknown>) =>
  Array.from(items).reduce<Promise<void>>(async (previous, item, index) => {
    await previous;
    await run(item, index);
  }, Promise.resolve());

/**
 * Runs `round` again while it returns true, at most `rounds` times: batched
 * deletes and paged reads that stop when a batch comes back short.
 */
export const repeatWhile = async (rounds: number, round: () => Promise<boolean>): Promise<void> => {
  if (rounds > 0 && (await round())) await repeatWhile(rounds - 1, round);
};

/**
 * Runs `remove` (a `delete … limit batch`) until it removes fewer than `batch`
 * rows, at most `rounds` times, so a long backlog never becomes one huge
 * delete. Returns how many rows it removed.
 */
export const deleteInBatches = async (
  rounds: number,
  batch: number,
  remove: () => Promise<{ rowCount: number | null }>,
) => {
  let removed = 0;

  await repeatWhile(rounds, async () => {
    const count = (await remove()).rowCount ?? 0;

    removed += count;

    return count === batch;
  });

  return removed;
};
