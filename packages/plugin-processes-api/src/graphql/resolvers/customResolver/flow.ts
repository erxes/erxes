import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { IFlow, IFlowDocument } from '../../../models/definitions/flows';
import { getProductAndUoms } from './utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Flows.findOne({ _id });
  },

  async product(flow: IFlow, _, { subdomain }: IContext) {
    return (
      (await sendProductsMessage({
        subdomain,
        action: 'findOne',
        data: { _id: flow.productId || '' },
        isRPC: true
      })) || undefined
    );
  },

  async jobCount(flow: IFlow, _) {
    return (flow.jobs || []).length;
  },

  async latestBranch(flow: IFlowDocument, _, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: flow.latestBranchId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async latestDepartment(flow: IFlowDocument, _, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: flow.latestDepartmentId },
      isRPC: true,
      defaultValue: {}
    });
  },

  async latestNeedProducts(flow: IFlowDocument, _, { subdomain }: IContext) {
    const latestNeedProducts = flow.latestNeedProducts || [];

    if (!latestNeedProducts?.length) {
      return latestNeedProducts;
    }

    const { productById } = await getProductAndUoms(
      subdomain,
      latestNeedProducts
    );

    for (const need of latestNeedProducts || []) {
      need.product = productById[need.productId] || {};
      need.uom = productById[need.productId]?.uom;
    }

    return latestNeedProducts;
  },

  async latestResultProducts(flow: IFlowDocument, _, { subdomain }: IContext) {
    const latestResultProducts = flow.latestResultProducts || [];

    if (!latestResultProducts?.length) {
      return latestResultProducts;
    }

    const { productById } = await getProductAndUoms(
      subdomain,
      latestResultProducts
    );

    for (const result of latestResultProducts) {
      result.product = productById[result.productId] || {};
      result.uom = productById[result.productId]?.uom;
    }

    return latestResultProducts;
  }
};
