import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import type { IStorageMovement } from '../@types/storage';
import { newId } from './validation';

/** contentType/contentId on the accounting transaction point back to the movement. */
export const MOVEMENT_CONTENT_TYPE = 'storage:storage.movements';

// Values of accounting's JOURNALS.INV_MOVE, TR_SIDES.CREDIT and TR_STATUSES.COMPLETE.
const INV_MOVE = 'invMove';
const CREDIT = 'ct';
const COMPLETE = 'complete';

type TMovement = IStorageMovement & { _id: string };

type TCosts = Record<string, { unitCost: number }>;

type TOldTransaction = { _id: string; ptrId?: string; parentId?: string; date?: Date };

const callAccounting = <T>(
  subdomain: string,
  method: 'query' | 'mutation',
  action: string,
  input: unknown,
): Promise<T | undefined> =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'accounting',
    method,
    module: 'accountingTransaction',
    action,
    input,
    throwOnError: true,
  });

const errorMessage = (e: unknown) =>
  (e as { message?: string })?.message || String(e);

/**
 * One inventory-move transaction: from the zone's sealed location to its open
 * location, at the sealed location's current cost.
 */
export const buildMoveTransaction = (
  movement: TMovement,
  costs: TCosts,
  old?: TOldTransaction,
) => {
  const { source, destination } = movement;
  const mainId = old?._id || newId();

  return {
    _id: mainId,
    ptrId: old?.ptrId || newId(),
    parentId: old?.parentId || mainId,
    number: movement.number,
    date: old?.date || movement.date,
    description: `RFID ${movement.number}`,
    journal: INV_MOVE,
    side: CREDIT,
    status: COMPLETE,
    branchId: source.branchId,
    departmentId: source.departmentId,
    contentType: MOVEMENT_CONTENT_TYPE,
    contentId: movement._id,
    followInfos: {
      moveInAccountId: destination.accountId,
      moveInBranchId: destination.branchId,
      moveInDepartmentId: destination.departmentId,
    },
    details: movement.items
      .filter((item) => item.quantity > 0)
      .map((item) => {
        const unitPrice = fixNum(costs[item.productId]?.unitCost ?? 0, 6);

        return {
          _id: newId(),
          accountId: source.accountId,
          productId: item.productId,
          count: item.quantity,
          unitPrice,
          amount: fixNum(item.quantity * unitPrice, 4),
          branchId: source.branchId,
          departmentId: source.departmentId,
          followInfos: {
            moveInBranchId: destination.branchId,
            moveInDepartmentId: destination.departmentId,
          },
        };
      }),
  };
};

/**
 * Sends a movement to accounting as an inventory-move transaction and stores
 * the result on the movement. Sending the same movement again replaces its
 * earlier transaction instead of adding a second one.
 */
export const bookMovement = async (
  models: IModels,
  subdomain: string,
  movement: TMovement,
  userId?: string,
) => {
  try {
    if (!movement.items.some((item) => item.quantity > 0)) {
      throw new Error('Хөдөлгөөнд тоо ширхэгтэй бараа алга.');
    }

    const oldTrs =
      (await callAccounting<TOldTransaction[]>(subdomain, 'query', 'getTransactions', {
        query: { contentType: MOVEMENT_CONTENT_TYPE, contentId: movement._id, journal: INV_MOVE },
      })) || [];

    const costs =
      (await callAccounting<TCosts>(subdomain, 'query', 'activeCost', {
        accountId: movement.source.accountId,
        branchId: movement.source.branchId,
        departmentId: movement.source.departmentId,
        productIds: movement.items.map((item) => item.productId),
        excludedTransactionIds: oldTrs.map((tr) => tr._id),
      })) || {};

    const doc = buildMoveTransaction(movement, costs, oldTrs[0]);

    const result = await callAccounting<{ parentId?: string }>(
      subdomain,
      'mutation',
      'savePTransaction',
      { parentId: oldTrs[0]?.parentId, docs: [doc], userId },
    );

    if (!result?.parentId) {
      throw new Error('Санхүүгийн модуль идэвхгүй эсвэл хариу ирсэнгүй.');
    }

    await models.Movements.setAccountingResult(movement._id, {
      status: 'success',
      message: 'success',
      trId: result.parentId,
    });
  } catch (e) {
    await models.Movements.setAccountingResult(movement._id, {
      status: 'error',
      message: errorMessage(e),
    });
  }

  return models.Movements.findOne({ _id: movement._id }).lean();
};
