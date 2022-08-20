import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { ISafeRemainderDocument } from '../../../models/definitions/safeRemainders';

export default {
  async modifiedUser(
    safeRemainder: ISafeRemainderDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: safeRemainder.modifiedBy
      },
      isRPC: true
    });
  },

  async department(
    safeRemainder: ISafeRemainderDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: {
        _id: safeRemainder.departmentId
      },
      isRPC: true
    });
  },

  async branch(
    safeRemainder: ISafeRemainderDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: {
        _id: safeRemainder.branchId
      },
      isRPC: true
    });
  },

  async productCategory(
    safeRemainder: ISafeRemainderDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: {
        _id: safeRemainder.productCategoryId
      },
      isRPC: true
    });
  }
};
