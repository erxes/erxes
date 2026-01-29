import { IContext } from '~/connectionResolvers';
import { IScoreLog } from '@/score/@types/scoreLog';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  async owner(
    scoreLog: IScoreLog,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType: scoreLog.ownerType,
      ownerId: scoreLog.ownerId,
    });
  },
};
