import { IContext } from '../../../connectionResolver';
import { IScoreLog } from '../../../models/definitions/scoreLog';
import { getOwner } from '../../../models/utils';

export default {
  async owner(voucher: IScoreLog, _args, { subdomain }: IContext) {
    return getOwner(subdomain, voucher.ownerType, voucher.ownerId);
  }
};
