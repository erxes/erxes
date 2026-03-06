import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';

export const scoreLogMutations = {
  async changeScore(__root: undefined, doc: IScoreLog, { models }: IContext) {
    return models.ScoreLogs.changeScore(doc);
  },
};
