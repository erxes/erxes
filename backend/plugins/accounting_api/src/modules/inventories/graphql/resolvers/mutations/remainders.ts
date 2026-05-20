import { IContext } from '~/connectionResolvers';
import { updateLiveRemainders } from './utils';

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
    const { departmentId, branchId, productCategoryId, productIds } = params;
    if (
      !departmentId &&
      !branchId &&
      !productCategoryId &&
      !productIds?.length
    ) {
      throw new Error('Please set at least one filter.');
    }

    const branchIds: string[] = [branchId || '_'];
    const departmentIds: string[] = [departmentId || '_'];

    const BATCH_SIZE = 10;
    const tasks: Promise<void>[] = [];

    for (const bId of branchIds) {
      for (const dId of departmentIds) {
        tasks.push(
          updateLiveRemainders({
            subdomain,
            models,
            branchId: bId,
            departmentId: dId,
            productCategoryId,
            productIds,
          }),
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

    return 'success';
  },
};

export default remainderMutations;
