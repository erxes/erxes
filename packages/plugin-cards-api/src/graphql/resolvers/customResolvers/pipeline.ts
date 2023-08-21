import { IContext } from '../../../connectionResolver';
import { IPipelineDocument } from '../../../models/definitions/boards';
import {
  BOARD_TYPES,
  VISIBLITIES
} from '../../../models/definitions/constants';
import {
  generateDealCommonFilters,
  generatePurchaseCommonFilters,
  generateGrowthHackCommonFilters,
  generateTaskCommonFilters,
  generateTicketCommonFilters
} from '../queries/utils';

export default {
  createdUser(pipeline: IPipelineDocument) {
    if (!pipeline.userId) {
      return;
    }

    return { __typename: 'User', _id: pipeline.userId };
  },

  members(pipeline: IPipelineDocument, {}) {
    if (pipeline.visibility === VISIBLITIES.PRIVATE && pipeline.memberIds) {
      return pipeline.memberIds.map(memberId => ({
        __typename: 'User',
        _id: memberId
      }));
    }

    return [];
  },

  isWatched(pipeline: IPipelineDocument, _args, { user }: IContext) {
    const watchedUserIds = pipeline.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  state(pipeline: IPipelineDocument) {
    if (pipeline.startDate && pipeline.endDate) {
      const now = new Date().getTime();

      const startDate = new Date(pipeline.startDate).getTime();
      const endDate = new Date(pipeline.endDate).getTime();

      if (now > endDate) {
        return 'Completed';
      } else if (now < endDate && now > startDate) {
        return 'In progress';
      } else {
        return 'Not started';
      }
    }

    return '';
  },

  async itemsTotalCount(
    pipeline: IPipelineDocument,
    _args,
    { user, models, subdomain }: IContext
  ) {
    switch (pipeline.type) {
      case BOARD_TYPES.DEAL: {
        const filter = await generateDealCommonFilters(
          models,
          subdomain,
          user._id,
          {
            pipelineId: pipeline._id
          }
        );

        return models.Deals.find(filter).count();
      }

      case BOARD_TYPES.PURCHASE: {
        const filter = await generatePurchaseCommonFilters(
          models,
          subdomain,
          user._id,
          {
            pipelineId: pipeline._id
          }
        );

        return models.Purchases.find(filter).count();
      }

      case BOARD_TYPES.TICKET: {
        const filter = await generateTicketCommonFilters(
          models,
          subdomain,
          user._id,
          {
            pipelineId: pipeline._id
          }
        );

        return models.Tickets.find(filter).count();
      }
      case BOARD_TYPES.TASK: {
        const filter = await generateTaskCommonFilters(
          models,
          subdomain,
          user._id,
          {
            pipelineId: pipeline._id
          }
        );

        return models.Tasks.find(filter).count();
      }
      case BOARD_TYPES.GROWTH_HACK: {
        const filter = await generateGrowthHackCommonFilters(
          models,
          subdomain,
          user._id,
          {
            pipelineId: pipeline._id
          }
        );

        return models.GrowthHacks.find(filter).count();
      }
    }
  },

  async tag(pipeline: IPipelineDocument) {
    if (pipeline.tagId) {
      return {
        __typename: 'Tag',
        _id: pipeline.tagId
      };
    }
  }
};
