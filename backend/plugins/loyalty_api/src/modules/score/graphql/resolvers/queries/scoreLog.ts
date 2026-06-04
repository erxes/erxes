import { IScoreLogDocument, IScoreLogParams } from '@/score/@types/scoreLog';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const scoreLogQueries = {
  async scoreLogs(
    _root: undefined,
    params: IScoreLogParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');
    const { ownerType, ownerId, searchValue, campaignId, action, clientPortal } = params;

    // Main list: when no specific owner is requested, collapse the logs into
    // one row per owner (owner name/email/phone, type and net total score). The
    // per-owner detail then re-queries with an `ownerId` to get the raw logs.
    if (!ownerId) {
      return models.ScoreLogs.getOwnerScoreList(params);
    }

    const filter: FilterQuery<IScoreLogDocument> = {};

    if (ownerType) {
      filter.ownerType = ownerType;
    }

    filter.ownerId = ownerId;

    if (searchValue) {
      filter.description = searchValue;
    }

    if (campaignId) {
      filter.campaignId = campaignId;
    }

    if (action) {
      filter.action = action;
    }
    if (clientPortal) {
      filter.clientPortal = clientPortal;
    }

    return cursorPaginate({
      model: models.ScoreLogs,
      params: { ...params, orderBy: { createdAt: -1 } },
      query: filter,
    });
  },

  async scoreLogList(
    _root: undefined,
    params: IScoreLogParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');
    return models.ScoreLogs.getScoreLogs(params);
  },

  async cpScoreLogList(
    _root: undefined,
    params: IScoreLogParams,
    { models }: IContext,
  ) {
    return models.ScoreLogs.getScoreLogs(params);
  },

  async scoreLogStatistics(
    _root: undefined,
    params: IScoreLogParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');
    return models.ScoreLogs.getStatistic(params);
  },
};

(scoreLogQueries.cpScoreLogList as any).wrapperConfig = {
  forClientPortal: true,
};