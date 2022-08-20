import { IGrowthHackDocument } from '../../../models/definitions/growthHacks';
import { boardId } from '../../utils';
import { IContext } from '../../../connectionResolver';
import { sendFormsMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.GrowthHacks.findOne({ _id });
  },

  async formSubmissions(
    growthHack: IGrowthHackDocument,
    _args,
    { subdomain, models }: IContext
  ) {
    const stage = await models.Stages.getStage(growthHack.stageId);

    const result = {};

    if (stage.formId) {
      const submissions = await sendFormsMessage({
        subdomain,
        action: 'submissions.find',
        data: {
          contentTypeId: growthHack._id,
          contentType: 'growthHack',
          formId: stage.formId
        },
        isRPC: true,
        defaultValue: []
      });

      for (const submission of submissions) {
        if (submission.formFieldId) {
          result[submission.formFieldId] = submission.value;
        }
      }
    }

    return result;
  },

  async formFields(
    growthHack: IGrowthHackDocument,
    _args,
    { models, subdomain }: IContext
  ) {
    const stage = await models.Stages.getStage(growthHack.stageId);

    const query: any = { contentType: 'form' };

    if (stage.formId) {
      query.contentTypeId = stage.formId;
    }

    return sendFormsMessage({
      subdomain,
      action: 'fields.find',
      data: { query, order: 1 },
      isRPC: true,
      defaultValue: []
    });
  },

  assignedUsers(growthHack: IGrowthHackDocument) {
    return (growthHack.assignedUserIds || [])
      .filter(e => e)
      .map(_id => ({
        __typename: 'User',
        _id
      }));
  },

  votedUsers(growthHack: IGrowthHackDocument) {
    return (growthHack.votedUserIds || []).map(votedUserId => ({
      __typename: 'User',
      _id: votedUserId
    }));
  },

  isVoted(growthHack: IGrowthHackDocument, _args, { user }: IContext) {
    return growthHack.votedUserIds && growthHack.votedUserIds.length > 0
      ? growthHack.votedUserIds.indexOf(user._id) !== -1
      : false;
  },

  async pipeline(growthHack: IGrowthHackDocument, _args, { models }: IContext) {
    const stage = await models.Stages.getStage(growthHack.stageId);

    return models.Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(growthHack: IGrowthHackDocument, _args, { models }: IContext) {
    return boardId(models, growthHack);
  },

  async formId(growthHack: IGrowthHackDocument, _args, { models }: IContext) {
    const stage = await models.Stages.getStage(growthHack.stageId);

    return stage.formId;
  },

  async scoringType(
    growthHack: IGrowthHackDocument,
    _args,
    { models }: IContext
  ) {
    const stage = await models.Stages.getStage(growthHack.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

    return pipeline.hackScoringType;
  },

  stage(growthHack: IGrowthHackDocument, _args, { models }: IContext) {
    return models.Stages.getStage(growthHack.stageId);
  },

  isWatched(growthHack: IGrowthHackDocument, _args, { user }: IContext) {
    const watchedUserIds = growthHack.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  labels(growthHack: IGrowthHackDocument, _args, { models }: IContext) {
    return models.PipelineLabels.find({
      _id: { $in: growthHack.labelIds || [] }
    });
  },

  createdUser(growthHack: IGrowthHackDocument) {
    if (!growthHack.userId) {
      return;
    }

    return { __typename: 'User', _id: growthHack.userId };
  }
};
