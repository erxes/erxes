import { IContext } from '../../../connectionResolver';
import { IStageDocument } from '../../../models/definitions/boards';
import {
  BOARD_TYPES,
  VISIBLITIES,
} from '../../../models/definitions/constants';
import { generateGrowthHackCommonFilters } from '../queries/utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Stages.findOne({ _id });
  },

  members(stage: IStageDocument, {}) {
    if (stage.visibility === VISIBLITIES.PRIVATE && stage.memberIds) {
      return stage.memberIds.map((memberId) => ({
        __typename: 'User',
        _id: memberId,
      }));
    }

    return [];
  },

  async itemsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const { GrowthHacks } = models;

    switch (stage.type) {
      case BOARD_TYPES.GROWTH_HACK: {
        const filter = await generateGrowthHackCommonFilters(
          models,
          subdomain,
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return GrowthHacks.find(filter).count();
      }
    }
  },
};
