import { IScoreLogParams } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';

export const scoreLogQueries = {
  async scoreLogs(
    _root: undefined,
    params: IScoreLogParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');
    // Delegate to the model so every filter (date range, deal number,
    // board/pipeline/stage, description, action) is applied consistently.
    // The previous inline filter ignored `number` and `fromDate`/`toDate`,
    // so those filters silently did nothing.
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
