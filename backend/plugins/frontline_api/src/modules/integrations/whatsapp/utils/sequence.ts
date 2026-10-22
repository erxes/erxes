/**
 * Runs `run` for each item one after another, in order, and stops at the
 * first rejection. Used where order matters or parallel runs would race.
 */
export const forEachSequentially = <T>(
  items: readonly T[],
  run: (item: T) => Promise<unknown>,
): Promise<void> =>
  items.reduce<Promise<void>>(
    (previous, item) =>
      previous.then(async () => {
        await run(item);
      }),
    Promise.resolve(),
  );
