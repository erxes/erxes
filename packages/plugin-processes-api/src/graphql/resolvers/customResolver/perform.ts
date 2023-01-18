import { IPerformDocument } from '../../../models/definitions/performs';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { getProductAndUoms } from './utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Performs.findOne({ _id });
  },

  async inProducts(perform: IPerformDocument, {}, { subdomain }: IContext) {
    const inProducts = perform.inProducts || [];

    const { productById, uomById } = await getProductAndUoms(
      subdomain,
      inProducts
    );

    for (let need of inProducts) {
      need.product = productById[need.productId] || {};
      need.uom = uomById[need.uomId] || {};
    }

    return inProducts;
  },
  async outProducts(perform: IPerformDocument, {}, { subdomain }: IContext) {
    const outProducts = perform.outProducts || [];

    const { productById, uomById } = await getProductAndUoms(
      subdomain,
      outProducts
    );

    for (const result of outProducts) {
      result.product = productById[result.productId] || {};
      result.uom = uomById[result.uomId] || {};
    }

    return outProducts;
  },

  async inBranch(perform: IPerformDocument, {}, { subdomain }: IContext) {
    const { inBranchId } = perform;

    if (!inBranchId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: inBranchId || '' },
      isRPC: true
    });
  },

  async outBranch(perform: IPerformDocument, {}, { subdomain }: IContext) {
    const { outBranchId } = perform;

    if (!outBranchId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: outBranchId || '' },
      isRPC: true
    });
  },

  async inDepartment(perform: IPerformDocument, {}, { subdomain }: IContext) {
    const { inDepartmentId } = perform;

    if (!inDepartmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: inDepartmentId || '' },
      isRPC: true
    });
  },

  async outDepartment(perform: IPerformDocument, {}, { subdomain }: IContext) {
    const { outDepartmentId } = perform;

    if (!outDepartmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: outDepartmentId || '' },
      isRPC: true
    });
  },

  async createdUser(perform: IPerformDocument, _, { subdomain }: IContext) {
    if (!perform.createdBy) {
      return;
    }

    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: perform.createdBy
      },
      isRPC: true
    });
  },

  async modifiedUser(perform: IPerformDocument, _, { subdomain }: IContext) {
    if (!perform.modifiedBy) {
      return;
    }

    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: perform.modifiedBy
      },
      isRPC: true
    });
  }
};
