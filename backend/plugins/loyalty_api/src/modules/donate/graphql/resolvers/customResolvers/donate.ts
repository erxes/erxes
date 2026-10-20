import { IDonateDocument } from '@/donate/@types/donate';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  async owner(
    { ownerType, ownerId }: IDonateDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType,
      ownerId,
    });
  },
};
