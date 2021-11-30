interface IArgs {
  contentId: string;
  contentType: string;
  type: string;
}

const emojiQueries = [
  {
    name: 'emojiReactedUsers',
    handler: async (_root, doc: IArgs, { models }) => {
      const reactedUserIds = await models.Emojis.find(doc).distinct('userId');

      return models.Users.find({ _id: { $in: reactedUserIds } });
    }
  },
  {
    name: 'emojiCount',
    handler: (_root, doc: IArgs, { models }) => {
      return models.Emojis.find(doc).countDocuments();
    }
  },
  {
    name: 'emojiIsReacted',
    handler: async (_root, doc: IArgs, { models, user }) => {
      return models.Emojis.exists({
        ...doc,
        userId: user._id
      });
    }
  }
];

export default emojiQueries;
