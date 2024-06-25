import { IPerformDocument } from '../../../models/definitions/performs';
import { IContext } from '../../../connectionResolver';
import { sendContactsMessage, sendCoreMessage } from '../../../messageBroker';
import { getProductAndUoms } from './utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Performs.findOne({ _id });
  },

  async needProducts(perform: IPerformDocument, _, { subdomain }: IContext) {
    const needProducts = perform.needProducts || [];

    const { productById } = await getProductAndUoms(subdomain, needProducts);

    for (let need of needProducts) {
      need.product = productById[need.productId] || {};
      need.uom = (productById[need.productId] || {}).uom;
    }

    return needProducts;
  },
  async resultProducts(perform: IPerformDocument, _, { subdomain }: IContext) {
    const resultProducts = perform.resultProducts || [];

    const { productById } = await getProductAndUoms(subdomain, resultProducts);

    for (const result of resultProducts) {
      result.product = productById[result.productId] || {};
      result.uom = (productById[result.productId] || {}).uom;
    }

    return resultProducts;
  },
  async inProducts(perform: IPerformDocument, _, { subdomain }: IContext) {
    const inProducts = perform.inProducts || [];

    const { productById } = await getProductAndUoms(subdomain, inProducts);

    for (let need of inProducts) {
      need.product = productById[need.productId] || {};
      need.uom = (productById[need.productId] || {}).uom;
    }

    return inProducts;
  },
  async outProducts(perform: IPerformDocument, _, { subdomain }: IContext) {
    const outProducts = perform.outProducts || [];

    const { productById } = await getProductAndUoms(subdomain, outProducts);

    for (const result of outProducts) {
      result.product = productById[result.productId] || {};
      result.uom = (productById[result.productId] || {}).uom;
    }

    return outProducts;
  },

  async inBranch(perform: IPerformDocument, _, { subdomain }: IContext) {
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

  async outBranch(perform: IPerformDocument, _, { subdomain }: IContext) {
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

  async inDepartment(perform: IPerformDocument, _, { subdomain }: IContext) {
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

  async outDepartment(perform: IPerformDocument, _, { subdomain }: IContext) {
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
  },

  async customer(perform: IPerformDocument, _, { subdomain }: IContext) {
    if (!perform.customerId) {
      return;
    }

    return sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: perform.customerId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async company(perform: IPerformDocument, _, { subdomain }: IContext) {
    if (!perform.companyId) {
      return;
    }

    return sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: { _id: perform.companyId },
      isRPC: true,
      defaultValue: {}
    });
  },

  inProductsLen(perform: IPerformDocument, _, {}) {
    return (perform.inProducts || []).length;
  },
  outProductsLen(perform: IPerformDocument, _, {}) {
    return (perform.outProducts || []).length;
  }
};
