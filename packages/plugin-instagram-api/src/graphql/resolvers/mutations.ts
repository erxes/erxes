import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateConfigs } from '../../helpers';
import { sendInboxMessage } from '../../messageBroker';
import { sendReply } from '../../utils';

interface ICommentStatusParams {
  commentId: string;
}

interface IReplyParams extends ICommentStatusParams {
  conversationId: string;
  content: string;
  attachments: any;
}

const instagramMutations = {
  async instagramUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },

  async instagramRepair(_root, { _id }: { _id: string }, { models }: IContext) {
    await repairIntegrations(models, _id);

    return 'success';
  }
  // async instagramChangeCommentStatus(

  //   _root,
  //   params: ICommentStatusParams,
  //   { models }: IContext
  // ) {
  //   const { commentId } = params;
  //   const comment = await models.Comments.findOne({ commentId });

  //   if (!comment) {
  //     throw new Error('Comment not found');
  //   }

  //   await models.Comments.updateOne(
  //     { commentId },
  //     { $set: { isResolved: comment.isResolved ? false : true } }
  //   );

  //   return models.Comments.findOne({ _id: comment._id });
  // }
};

export default instagramMutations;
