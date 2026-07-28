import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';

export const scoreLogMutations = {
  async changeScore(
    __root: undefined,
    { change, ...rest }: IScoreLog & { change?: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogChange');
    return models.ScoreLogs.changeScore({
      ...rest,
      changeScore: change ?? rest.changeScore,
    });
  },

  async loyaltyScoreRepairOwner(
    __root: undefined,
    args: { ownerId: string; ownerType: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogChange');
    return models.ScoreLogs.repairOwnerScore(args);
  },
};
