
export default {
  setReadDominantUsers: async (_root, { accountId, userIds }, { models }) => {
    await models.Config.updateOne(
      { code: 'accountingDominantRead', subId: accountId },
      { $set: { value: { userIds } } },
      { upsert: true }
    );
    return { accountId, readDominantUserIds: userIds };
  },
};