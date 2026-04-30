import { IContext } from '~/connectionResolvers';
import { updateLiveRemainders } from './utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

interface IUpdateRemaindersParams {
  departmentId?: string;
  branchId?: string;
  productCategoryId?: string;
  productIds?: string[];
}

const remainderMutations = {
  reCalcRemainders: async (
    _root: any,
    params: IUpdateRemaindersParams,
    { subdomain, models }: IContext,
  ) => {
    const {
      departmentId,
      branchId,
      productCategoryId,
      productIds
    } = params;
    if (!departmentId && !branchId && !productCategoryId && !productIds?.length) {
      throw new Error('Please set at least one filter.')
    }

    let branchIds: string[] = branchId ? [branchId] : [];
    let departmentIds: string[] = departmentId ? [departmentId] : [];

    if (!branchId) {
      const branches = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'branches',
        action: 'find',
        input: { query: {}, fields: { _id: 1 } },
        defaultValue: [],
      });
      branchIds = branches.map(b => b._id)
    }


    if (!departmentId) {
      const departments = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'departments',
        action: 'find',
        input: { query: {}, fields: { _id: 1 } },
        defaultValue: [],
      });
      departmentIds = departments.map(d => d._id)
    }

    const BATCH_SIZE = 10;
    const tasks: Promise<void>[] = [];

    for (const bId of branchIds) {
      for (const dId of departmentIds) {
        tasks.push(
          updateLiveRemainders({
            subdomain, models,
            branchId: bId, departmentId: dId,
            productCategoryId, productIds,
          })
        );

        // Process in batches to avoid overwhelming the database
        if (tasks.length >= BATCH_SIZE) {
          await Promise.all(tasks);
          tasks.length = 0;
        }
      }
    }

    // Process remaining tasks
    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    return 'success'
  },
};

export default remainderMutations;
