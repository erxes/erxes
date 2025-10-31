import { IContext } from '~/connectionResolvers';
import { IScoreLog } from '~/modules/loyalty/@types/scoreLog';
import { getOwner } from '~/modules/loyalty/db/models/utils';

export default {
  async owner(voucher: IScoreLog, _args, { subdomain }: IContext) {
    return getOwner(subdomain, voucher.ownerType, voucher.ownerId);
  },
};
