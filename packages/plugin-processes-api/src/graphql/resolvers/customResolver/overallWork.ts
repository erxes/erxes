import { getProductsData } from './utils';
import { IContext } from '../../../connectionResolver';
import { IOverallWork } from './../../../models/definitions/overallWorks';
import { JOB_TYPES } from '../../../models/definitions/constants';
import {
  sendCoreMessage,
  sendInventoriesMessage,
  sendProductsMessage
} from '../../../messageBroker';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Works.findOne({ _id });
  },

  async type(work: IOverallWork, _, { }) {
    const { key } = work;
    const { type } = key;
    return type;
  },

  async jobRefer(work: IOverallWork, _, { models }: IContext) {
    const { key } = work;
    const { type, typeId } = key;
    if (![JOB_TYPES.ENDPOINT, JOB_TYPES.JOB].includes(type)) {
      return;
    }

    return await models.JobRefers.findOne({ _id: typeId }).lean();
  },

  async product(work: IOverallWork, _, { subdomain }: IContext) {
    const { key } = work;
    const { type, typeId } = key;
    if ([JOB_TYPES.ENDPOINT, JOB_TYPES.JOB].includes(type)) {
      return;
    }

    return await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: typeId },
      isRPC: true
    });
  },

  async inBranch(work: IOverallWork, _, { subdomain }: IContext) {
    const { key } = work;
    const { inBranchId } = key;

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

  async outBranch(work: IOverallWork, _, { subdomain }: IContext) {
    const { key } = work;
    const { outBranchId } = key;

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

  async inDepartment(work: IOverallWork, _, { subdomain }: IContext) {
    const { key } = work;
    const { inDepartmentId } = key;
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

  async outDepartment(work: IOverallWork, _, { subdomain }: IContext) {
    const { key } = work;
    const { outDepartmentId } = key;
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

  async needProducts(overallWork: IOverallWork, _, { }) {
    const { needProducts } = overallWork;

    if (!needProducts?.length) {
      return;
    }

    return getProductsData(needProducts);
  },

  async resultProducts(overallWork: IOverallWork, _, { }) {
    const { resultProducts } = overallWork;

    if (!resultProducts?.length) {
      return;
    }

    return getProductsData(resultProducts);
  }
};
