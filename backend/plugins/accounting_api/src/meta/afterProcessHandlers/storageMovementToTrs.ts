import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import { activeCost } from '~/modules/accounting/utils/inventories';

export const STORAGE_MOVEMENT_CONTENT_TYPE = 'storage:storage.movements';

type TStorageLocation = {
  accountId?: string;
  branchId?: string;
  departmentId?: string;
};

type TStorageMovementItem = {
  productId?: string;
  quantity?: number;
};

export type TStorageMovement = {
  _id: string;
  type?: string;
  number?: string;
  date?: string | Date;
  source?: TStorageLocation;
  destination?: TStorageLocation;
  items?: TStorageMovementItem[];
};

const assertLocation = (location: TStorageLocation | undefined, label: string) => {
  if (!location?.accountId || !location.branchId || !location.departmentId) {
    throw new Error(
      `Storage movement ${label} needs an account, branch and department.`,
    );
  }

  return location as Required<TStorageLocation>;
};

/**
 * Books a storage movement (sealed packs moved to the open area) as one
 * inventory-move transaction, valued at the source location's current cost.
 * Running it again for the same movement updates the existing transaction.
 */
export const storageMovementToTrs = async ({
  models,
  userId,
  movement,
}: {
  models: IModels;
  userId?: string;
  movement: TStorageMovement;
}) => {
  const actingUserId = userId || '';
  const source = assertLocation(movement.source, 'source');
  const destination = assertLocation(movement.destination, 'destination');

  const items = (movement.items || []).filter(
    (item): item is Required<TStorageMovementItem> =>
      !!item.productId && !!item.quantity && item.quantity > 0,
  );

  if (!items.length) {
    throw new Error('Storage movement has no products with positive quantity.');
  }

  const [contentType, contentId] = [STORAGE_MOVEMENT_CONTENT_TYPE, movement._id];

  const oldTrs = await models.Transactions.find({
    contentType,
    contentId,
    journal: JOURNALS.INV_MOVE,
  }).lean();

  const oldMoveTr = oldTrs[0];
  const mainId = oldMoveTr?._id || nanoid();
  const ptrId = oldMoveTr?.ptrId || nanoid();
  const parentId = oldMoveTr?.parentId || mainId;

  const costs = await activeCost(
    models,
    source.accountId,
    source.branchId,
    source.departmentId,
    items.map((item) => item.productId),
    oldTrs.map((transaction) => transaction._id).filter(Boolean),
  );

  const moveTrDoc: ITransaction = {
    _id: mainId,
    ptrId,
    parentId,
    number: movement.number,
    date: oldMoveTr?.date || (movement.date ? new Date(movement.date) : new Date()),
    description: `RFID ${movement.number || movement._id}`,
    journal: JOURNALS.INV_MOVE,
    side: TR_SIDES.CREDIT,
    status: TR_STATUSES.COMPLETE,
    followInfos: {
      moveInAccountId: destination.accountId,
      moveInBranchId: destination.branchId,
      moveInDepartmentId: destination.departmentId,
    },
    branchId: source.branchId,
    departmentId: source.departmentId,
    contentType,
    contentId,
    details: items.map((item) => {
      const unitPrice = fixNum(costs?.[item.productId]?.unitCost ?? 0, 6);

      return {
        _id: nanoid(),
        accountId: source.accountId,
        amount: fixNum(item.quantity * unitPrice, 4),
        productId: item.productId,
        count: item.quantity,
        unitPrice,
        branchId: source.branchId,
        departmentId: source.departmentId,
        followInfos: {
          moveInBranchId: destination.branchId,
          moveInDepartmentId: destination.departmentId,
        },
      };
    }),
  };

  if (oldTrs.length) {
    await models.Transactions.updatePTransaction(
      parentId,
      [moveTrDoc],
      actingUserId,
      { skipAccountPermission: true },
    );
  } else {
    await models.Transactions.createPTransaction([moveTrDoc], actingUserId, {
      skipAccountPermission: true,
    });
  }
};
