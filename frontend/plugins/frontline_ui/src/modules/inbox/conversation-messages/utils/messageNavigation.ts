/** Fetch older pages until a target is found, stopping when a page adds nothing. */
export const loadMessageTarget = async <T>({
  findTarget,
  loadMore,
  getMessageCount,
  getTotalCount,
  isCancelled,
}: {
  findTarget: () => T | null;
  loadMore: () => Promise<unknown>;
  getMessageCount: () => number;
  getTotalCount: () => number;
  isCancelled: () => boolean;
}): Promise<T | null> => {
  let lastMessageCount = -1;
  const totalCount = getTotalCount();

  while (!isCancelled()) {
    const target = findTarget();
    if (target) return target;

    const messageCount = getMessageCount();
    if (messageCount >= totalCount || messageCount <= lastMessageCount) {
      return null;
    }
    lastMessageCount = messageCount;
    await loadMore();
  }

  return null;
};
