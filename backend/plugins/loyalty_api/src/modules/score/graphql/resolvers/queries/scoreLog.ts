import { IScoreLogParams } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';

export const scoreLogQueries = {
  async scoreLogs(
    _root: undefined,
    params: IScoreLogParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');
    // Delegate to the model so every filter (date range, description,
    // action) is applied consistently. A source's own fields (a deal's
    // board or number) are filtered on the source's side.
    return models.ScoreLogs.getScoreLogs(params);
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

  // Net points each record moved, for a source listing its own records.
  async loyaltyScoreTargetTotals(
    _root: undefined,
    { targetIds }: { targetIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');

    return models.ScoreLogs.getTargetTotals(targetIds);
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
