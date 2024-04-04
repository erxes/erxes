import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { IFlow, IFlowDocument } from '../../../models/definitions/flows';
import { getProductAndUoms } from './utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Flows.findOne({ _id });
  },

  async product(flow: IFlow, {}, { subdomain }: IContext) {
    return (
      (await sendProductsMessage({
        subdomain,
        action: 'findOne',
        data: { _id: flow.productId || '' },
        isRPC: true
      })) || undefined
    );
  },

  async jobCount(flow: IFlow, {}, {}: IContext) {
    return (flow.jobs || []).length;
  },

  async latestBranch(flow: IFlowDocument, {}, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: flow.latestBranchId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async latestDepartment(flow: IFlowDocument, {}, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: flow.latestDepartmentId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async latestNeedProducts(flow: IFlowDocument, {}, { subdomain }: IContext) {
    const latestNeedProducts = flow.latestNeedProducts || [];

    if (!latestNeedProducts || !latestNeedProducts.length) {
      return latestNeedProducts;
    }

    const { productById } = await getProductAndUoms(
      subdomain,
      latestNeedProducts
    );

    for (const need of latestNeedProducts || []) {
      need.product = productById[need.productId] || {};
      need.uom = (productById[need.productId] || {}).uom;
    }

    return latestNeedProducts;
  },

  async latestResultProducts(flow: IFlowDocument, {}, { subdomain }: IContext) {
    const latestResultProducts = flow.latestResultProducts || [];

    if (!latestResultProducts || !latestResultProducts.length) {
      return latestResultProducts;
    }

    const { productById } = await getProductAndUoms(
      subdomain,
      latestResultProducts
    );

    for (const result of latestResultProducts) {
      result.product = productById[result.productId] || {};
      result.uom = (productById[result.productId] || {}).uom;
    }

    return latestResultProducts;
  }
};
