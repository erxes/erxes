import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';

export const scoreLogMutations = {
  async changeScore(
    __root: undefined,
    { change, ...rest }: IScoreLog & { change?: number },
    { models }: IContext,
  ) {
    return models.ScoreLogs.changeScore({
      ...rest,
      changeScore: change ?? rest.changeScore,
    });
  },
};
