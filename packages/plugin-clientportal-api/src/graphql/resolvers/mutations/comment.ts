import { IContext } from '../../../connectionResolver';
import { sendNotification } from '../../../utils';

const clientPortalCommentMutations = {
  async clientPortalCommentsAdd(
    _root,
    {
      type,
      typeId,
      content,
      userType
    }: { type: string; typeId: string; content: string; userType: string },
    { cpUser, user, models, subdomain }: IContext
  ) {
    let userId = '';

    if (userType === 'client') {
      if (!cpUser) {
        throw new Error('You are not logged in');
      }

      userId = cpUser._id;
    }

    const comment = await models.Comments.createComment({
      type,
      typeId,
      content,
      userType,
      userId: userId || user._id
    });

    const relatedCards = await models.ClientPortalUserCards.getUserIds(
      type,
      typeId
    );

    if (!relatedCards || relatedCards.length === 0 || userType === 'client') {
      return comment;
    }

    for (const cardUserId of relatedCards) {
      await sendNotification(models, subdomain, {
        receivers: [cardUserId],
        title: `${user.details?.fullName} has commented on your ${type}.`,
        content: `<a href=/tickets?itemId=${typeId}>Click here to go to the ${type}</a>`,
        notifType: 'system',
        link: `/tickets?itemId=${typeId}`
      });
    }

    return comment;
  },

  async clientPortalCommentsRemove(
    _root,
    { _id }: { _id: string },
    { cpUser, models }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    await models.Comments.deleteComment(_id);

    return 'deleted';
  }
};

export default clientPortalCommentMutations;
