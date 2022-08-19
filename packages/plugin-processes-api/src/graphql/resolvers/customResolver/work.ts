import { IJobRefer } from './../../../models/definitions/jobs';
import { IWorkDocument } from './../../../models/definitions/works';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Works.findOne({ _id });
  },

  async job(work: IWorkDocument, {}, { models }: IContext) {
    const { jobId } = work;
    const jobRefer: IJobRefer | null = await models.JobRefers.findOne({
      _id: jobId
    });

    return { label: jobRefer?.name || '', description: jobRefer?.code || '' };
  },

  async flow(work: IWorkDocument, {}, { models }: IContext) {
    const { flowId } = work;
    const flow = await models.Flows.findOne({ _id: flowId });

    return { name: flow?.name || '', status: flow?.status };
  },

  async product(work: IWorkDocument, {}, { subdomain }: IContext) {
    const { productId } = work;

    const product =
      (await sendProductsMessage({
        subdomain,
        action: 'findOne',
        data: { _id: productId || '' },
        isRPC: true
      })) || null;

    const { name, code } = product;

    return { name, code };
  },

  async inBranch(work: IWorkDocument, {}, { subdomain }: IContext) {
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

  async outBranch(work: IWorkDocument, {}, { subdomain }: IContext) {
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

  async inDepartment(work: IWorkDocument, {}, { subdomain }: IContext) {
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

  async outDepartment(work: IWorkDocument, {}, { subdomain }: IContext) {
    const { outDepartmentId } = work;

    const department =
      (await sendCoreMessage({
        subdomain,
        action: 'departments.findOne',
        data: { _id: outDepartmentId || '' },
        isRPC: true
      })) || null;

    return department ? department.title : '';
  }
};
