import { loadMessageTarget } from '../messageNavigation';

it('loads older pages until the selected message becomes available', async () => {
  let count = 50;
  const target = { id: 'old-message' };
  const loadMore = jest.fn(async () => {
    count += 50;
  });
  const result = await loadMessageTarget({
    findTarget: () => (count === 150 ? target : null),
    loadMore,
    getMessageCount: () => count,
    getTotalCount: () => 200,
    isCancelled: () => false,
  });
  expect(result).toBe(target);
  expect(loadMore).toHaveBeenCalledTimes(2);
});

it('stops if a page adds no messages', async () => {
  const loadMore = jest.fn(async () => undefined);
  const result = await loadMessageTarget({
    findTarget: () => null,
    loadMore,
    getMessageCount: () => 50,
    getTotalCount: () => 200,
    isCancelled: () => false,
  });
  expect(result).toBeNull();
  expect(loadMore).toHaveBeenCalledTimes(1);
});

it('stops loading pages after navigation is cancelled', async () => {
  let cancelled = false;
  const loadMore = jest.fn(async () => {
    cancelled = true;
  });
  await expect(
    loadMessageTarget({
      findTarget: () => null,
      loadMore,
      getMessageCount: () => 50,
      getTotalCount: () => 200,
      isCancelled: () => cancelled,
    }),
  ).resolves.toBeNull();
  expect(loadMore).toHaveBeenCalledTimes(1);
});
