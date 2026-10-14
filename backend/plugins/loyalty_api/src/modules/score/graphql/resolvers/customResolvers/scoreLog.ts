import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  async owner(
    { ownerType, ownerId, owner }: IScoreLog & { owner?: any },
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if (owner) return owner;
    return getLoyaltyOwner(subdomain, { ownerType, ownerId });
  },
};
