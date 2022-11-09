import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateConfigs } from '../../helpers';

interface ICommentStatusParams {
  commentId: string;
}

const integrationMutations = {
  async facebookUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },
  async facebookRepair(_root, { _id }: { _id: string }, { models }: IContext) {
    await repairIntegrations(models, _id);

    return 'success';
  },
  async facebookChangeCommentStatus(
    _root,
    params: ICommentStatusParams,
    { models }: IContext
  ) {
    const { commentId } = params;
    const comment = await models.Comments.findOne({ commentId });

    if (!comment) {
      throw new Error('Comment not found');
    }

    await models.Comments.updateOne(
      { commentId },
      { $set: { isResolved: comment.isResolved ? false : true } }
    );

    return models.Comments.findOne({ _id: comment._id });
  }
};

export default integrationMutations;
