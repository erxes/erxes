import { IWorkDocument } from './../../../models/definitions/works';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Works.findOne({ _id });
  },

  async flow(work: IWorkDocument, {}, { models }: IContext) {
    const { flowId } = work;
    return await models.Flows.findOne({ _id: flowId }).lean();
  },

  async inBranch(work: IWorkDocument, {}, { subdomain }: IContext) {
    const { inBranchId } = work;

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

  async outBranch(work: IWorkDocument, {}, { subdomain }: IContext) {
    const { outBranchId } = work;

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

  async inDepartment(work: IWorkDocument, {}, { subdomain }: IContext) {
    const { inDepartmentId } = work;

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

  async outDepartment(work: IWorkDocument, {}, { subdomain }: IContext) {
    const { outDepartmentId } = work;

    if (!outDepartmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: outDepartmentId || '' },
      isRPC: true
    });
  }
};
