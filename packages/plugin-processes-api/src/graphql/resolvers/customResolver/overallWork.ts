import { IOverallWorkDocument } from './../../../models/definitions/overallWorks';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Works.findOne({ _id });
  },

  async job(work: IOverallWorkDocument, {}, { models }: IContext) {
    const { jobId, flowId } = work;
    const flow = await models.Flows.findOne({ _id: flowId });
    const jobs = flow?.jobs || [];
    const job = jobs.find(j => j.id === jobId);

    return { label: job?.label || '', description: job?.description || '' };
  },

  async flow(work: IOverallWorkDocument, {}, { models }: IContext) {
    const { flowId } = work;
    const flow = await models.Flows.findOne({ _id: flowId });

    return { name: flow?.name || '', status: flow?.status };
  },

  async inBranch(work: IOverallWorkDocument, {}, { subdomain }: IContext) {
    const { inBranchId } = work;

    const branch =
      (await sendCoreMessage({
        subdomain,
        action: 'branches.findOne',
        data: { _id: inBranchId || '' },
        isRPC: true
      })) || null;

    return branch ? branch.title : '';
  },

  async outBranch(work: IOverallWorkDocument, {}, { subdomain }: IContext) {
    const { outBranchId } = work;

    const branch =
      (await sendCoreMessage({
        subdomain,
        action: 'branches.findOne',
        data: { _id: outBranchId || '' },
        isRPC: true
      })) || null;

    return branch ? branch.title : '';
  },

  async inDepartment(work: IOverallWorkDocument, {}, { subdomain }: IContext) {
    const { inDepartmentId } = work;

    const department =
      (await sendCoreMessage({
        subdomain,
        action: 'departments.findOne',
        data: { _id: inDepartmentId || '' },
        isRPC: true
      })) || null;

    return department ? department.title : '';
  },

  async outDepartment(work: IOverallWorkDocument, {}, { subdomain }: IContext) {
    const { outDepartmentId } = work;

    const department =
      (await sendCoreMessage({
        subdomain,
        action: 'departments.findOne',
        data: { _id: outDepartmentId || '' },
        isRPC: true
      })) || null;

    return department ? department.title : '';
  },
  async needProductsDetail(
    overallWork: IOverallWorkDocument,
    {},
    { models, subdomain }: IContext
  ) {
    const jobRefers = await models.OverallWorks.findOne({
      _id: overallWork._id
    });

    const needProducts = jobRefers?.needProducts || [];

    const resolvedNeedProducts: any[] = [];
    for await (const need of needProducts) {
      const uom =
        (await sendProductsMessage({
          subdomain,
          action: 'findOneUom',
          data: { _id: need.uomId || '' },
          isRPC: true
        })) || null;

      const product =
        (await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: need.productId || '' },
          isRPC: true
        })) || null;

      need.product = product;
      need.uom = uom;
    }

    return needProducts;
  },
  async resultProductsDetail(
    overallWork: IOverallWorkDocument,
    {},
    { models, subdomain }: IContext
  ) {
    const jobRefers = await models.OverallWorks.findOne({
      _id: overallWork._id
    });

    const resultProducts = jobRefers?.resultProducts || [];

    for await (const result of resultProducts) {
      const uom =
        (await sendProductsMessage({
          subdomain,
          action: 'findOneUom',
          data: { _id: result.uomId || '' },
          isRPC: true
        })) || null;

      const product =
        (await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: result.productId || '' },
          isRPC: true
        })) || null;

      result.product = product;
      result.uom = uom;
    }

    return resultProducts;
  }
};
