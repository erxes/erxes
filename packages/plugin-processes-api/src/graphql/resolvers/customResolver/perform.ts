import { IPerformDocument } from '../../../models/definitions/performs';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Performs.findOne({ _id });
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
