import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IUpdateRemaindersParams } from '~/modules/inventories/@types/safeRemainders';
import { updateLiveRemainders } from './utils';

const getLocationIds = async (
  subdomain: string,
  module: 'branches' | 'departments',
  id?: string,
): Promise<string[]> => {
  if (id) return [id];
  const locations: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module,
    action: 'find',
    input: { query: {}, fields: { _id: 1 } },
    defaultValue: [],
  });
  return ['_', ...locations.map((location) => location._id)];
};

export const remainderMutations = {
  reCalcRemainders: async (
    _root: unknown,
    params: IUpdateRemaindersParams,
    { subdomain, models, user }: IContext,
  ): Promise<string> => {
    if (!user?._id) throw new Error('Login required');
    const { branchId, departmentId, productCategoryId, productIds } = params;
    const [branchIds, departmentIds] = await Promise.all([
      getLocationIds(subdomain, 'branches', branchId),
      getLocationIds(subdomain, 'departments', departmentId),
    ]);
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
        if (tasks.length >= BATCH_SIZE) {
          await Promise.all(tasks);
          tasks.length = 0;
        }
      }
    }
    if (tasks.length) await Promise.all(tasks);
    return 'success';
  },
};
