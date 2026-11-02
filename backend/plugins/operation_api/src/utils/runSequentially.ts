export const runSequentially = <T>(
  items: readonly T[],
  run: (item: T) => Promise<unknown>,
) =>
  items.reduce<Promise<unknown>>(
    (previous, item) => previous.then(() => run(item)),
    Promise.resolve(),
  );
