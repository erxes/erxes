const checkSyncedMutations = {
  async toCheckSynced(_root, { ids }: { ids: string[] }) {
    return ids;
  },
};

export default checkSyncedMutations;
