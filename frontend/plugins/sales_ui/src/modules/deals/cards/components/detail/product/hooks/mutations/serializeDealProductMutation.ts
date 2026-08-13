const dealProductMutationQueues = new Map<string, Promise<void>>();

export const serializeDealProductMutation = <T>(
  dealId: string,
  mutation: () => Promise<T>,
): Promise<T> => {
  const previous = dealProductMutationQueues.get(dealId) || Promise.resolve();
  const result = previous.then(mutation);
  const tail = result.then(
    () => undefined,
    () => undefined,
  );

  dealProductMutationQueues.set(dealId, tail);

  void tail.then(() => {
    if (dealProductMutationQueues.get(dealId) === tail) {
      dealProductMutationQueues.delete(dealId);
    }
  });

  return result;
};
