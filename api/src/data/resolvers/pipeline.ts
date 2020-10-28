import { Deals, GrowthHacks, Tasks, Tickets, Users } from '../../db/models';
import { IPipelineDocument } from '../../db/models/definitions/boards';
import {
  BOARD_TYPES,
  PIPELINE_VISIBLITIES
} from '../../db/models/definitions/constants';
import { IContext } from '../types';
import {
  generateDealCommonFilters,
  generateGrowthHackCommonFilters,
  generateTaskCommonFilters,
  generateTicketCommonFilters
} from './queries/boardUtils';

export default {
  members(pipeline: IPipelineDocument, {}) {
    if (pipeline.visibility === PIPELINE_VISIBLITIES.PRIVATE) {
      return Users.find({ _id: { $in: pipeline.memberIds } });
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
    { user }: IContext
  ) {
    switch (pipeline.type) {
      case BOARD_TYPES.DEAL: {
        const filter = await generateDealCommonFilters(user._id, {
          pipelineId: pipeline._id
        });

        return Deals.find(filter).countDocuments();
      }
      case BOARD_TYPES.TICKET: {
        const filter = await generateTicketCommonFilters(user._id, {
          pipelineId: pipeline._id
        });

        return Tickets.find(filter).countDocuments();
      }
      case BOARD_TYPES.TASK: {
        const filter = await generateTaskCommonFilters(user._id, {
          pipelineId: pipeline._id
        });

        return Tasks.find(filter).countDocuments();
      }
      case BOARD_TYPES.GROWTH_HACK: {
        const filter = await generateGrowthHackCommonFilters(user._id, {
          pipelineId: pipeline._id
        });

        return GrowthHacks.find(filter).countDocuments();
      }
    }
  }
};
