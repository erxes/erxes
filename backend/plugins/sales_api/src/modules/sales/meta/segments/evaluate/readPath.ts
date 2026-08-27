/** Walks a dotted path, spreading over arrays so `productsData.productId` works. */
export const readPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) {
      const collected = current
        .map((item) => (item as Record<string, unknown>)?.[segment])
        .filter((item) => item !== undefined && item !== null);

      return collected.length ? collected : undefined;
    }

    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
