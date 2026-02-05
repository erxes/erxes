import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  async owner(
    { ownerType, ownerId }: IScoreLog,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, { ownerType, ownerId });
  },
};
