import { FormSubmissions, Pipelines, Stages, Users } from '../../db/models';
import { IGrowthHackDocument } from '../../db/models/definitions/growthHacks';
import { IUserDocument } from '../../db/models/definitions/users';
import { boardId } from './boardUtils';

export default {
  async formSubmissions(growthHack: IGrowthHackDocument) {
    const stage = await Stages.getStage(growthHack.stageId || '');

    const result = {};

    if (stage.formId) {
      const submissions = await FormSubmissions.find({
        contentTypeId: growthHack._id,
        contentType: 'growthHack',
        formId: stage.formId,
      });

      for (const submission of submissions) {
        if (submission.formFieldId) {
          result[submission.formFieldId] = submission.value;
        }
      }
    }

    return result;
  },

  assignedUsers(growthHack: IGrowthHackDocument) {
    return Users.find({ _id: { $in: growthHack.assignedUserIds } });
  },

  async pipeline(growthHack: IGrowthHackDocument) {
    const stage = await Stages.getStage(growthHack.stageId || '');

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(growthHack: IGrowthHackDocument) {
    return boardId(growthHack);
  },

  async formId(growthHack: IGrowthHackDocument) {
    const stage = await Stages.getStage(growthHack.stageId || '');

    return stage.formId;
  },

  async scoringType(growthHack: IGrowthHackDocument) {
    const stage = await Stages.getStage(growthHack.stageId || '');
    const pipeline = await Pipelines.getPipeline(stage.pipelineId);

    return pipeline.hackScoringType;
  },

  stage(growthHack: IGrowthHackDocument) {
    return Stages.getStage(growthHack.stageId || '');
  },

  isWatched(growthHack: IGrowthHackDocument, _args, { user }: { user: IUserDocument }) {
    const watchedUserIds = growthHack.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },
};
