import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendClientPortalMessage } from '../../messageBroker';
import { ICupon } from '../../models/definitions/cupon';
const dacMutations = {
  /**
   * Creates a new dac
   */
  async dacAdd(_root, _doc, _context: IContext) {
    return null;
  },
  async dacCuponAdd(
    _root,
    { doc }: { doc: ICupon },
    { models, subdomain, user }: IContext
  ) {
    const isExistsCpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: doc.customerId
      },
      isRPC: true,
      defaultValue: null
    });
    if (isExistsCpUser) {
      const createdCupon = await models.DacCupons.createCupon(doc, user?._id);
      return createdCupon?._id || '0';
    }
    throw new Error('User not found');
  },
  async dacCuponUse(
    _root,
    { customerId, _id, status }: ICupon,
    { models, user }: IContext
  ) {
    const cupon = await models.DacCupons.checkCupon(customerId, _id);
    if (cupon) {
      if (cupon.status === 'new') {
        await models.DacCupons.updateOne(
          { _id: cupon._id },
          { $set: { status: status, modifiedBy: user?._id } }
        );
        return 'success';
      }
      throw new Error('Already used cupon');
    }
    throw new Error('Cupon not found');
  }
};

moduleRequireLogin(dacMutations);
moduleCheckPermission(dacMutations, 'manageCupon');

export default dacMutations;
