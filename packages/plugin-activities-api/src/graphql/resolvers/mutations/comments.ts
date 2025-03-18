import { IContext } from "../../../connectionResolver";

const activityCommentMutations = {
  activityCommentAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const comment = await models.Comments.createComment(doc);

    return comment;
  },
  activityCommentEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }
  ) => {
    const updated = await models.Comments.updateComment(_id, doc);

    return updated;
  },
  activityCommentRemove: async (
    _root,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext
  ) => {
    await models.Comments.deleteComment(_id);

    return _id;
  },
};

export default activityCommentMutations;
