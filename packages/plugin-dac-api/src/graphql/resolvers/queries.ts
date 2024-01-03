import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { ICupon } from '../../models/definitions/cupon';
import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const dacQueries = {
  dac(_root, {}, _context: IContext) {
    return [];
  },
  async dacCuponCheck(
    _root,
    { customerId, _id }: ICupon,
    { models }: IContext
  ) {
    const result = await models.DacCupons.checkCupon(customerId, _id);

    return result?.status;
  }
};

//get active cupon
export async function dacUserActiveCupons(
  _root,
  {},
  { cpUser, models }: IContext
) {
  if (!cpUser) {
    throw new Error('You are not logged in');
  }
  const result = await models.DacCupons.find({
    status: 'new',
    customerId: cpUser.userId
  });
  return result;
}

moduleRequireLogin(dacQueries);
checkPermission(dacQueries, 'dacCuponCheck', 'manageCupon');

export default dacQueries;
