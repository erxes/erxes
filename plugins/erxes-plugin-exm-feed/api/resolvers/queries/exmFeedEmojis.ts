const exmFeedQueries = [
  {
    name: 'exmFeedLikedUsers',
    handler: async (
      _root,
      { feedId },
      { models }
    ) => {
      const reactedUserIds = await models.ExmFeedEmojis.find({ feedId, type: 'like' }).distinct('userId');
      
      return models.Users.find({ _id: { $in: reactedUserIds }});
    }
  }
];

export default exmFeedQueries;
