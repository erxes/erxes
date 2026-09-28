import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getLastIncomePrices } from '~/modules/accounting/utils/inventories';
import {
  SAFE_REMAINDER_ITEM_STATUSES,
  SAFE_REMAINDER_STATUSES,
} from '~/modules/inventories/@types/constants';
import {
  ISafeRemainderImportItem,
  ISafeRemainderItemDocument,
  ISafeRemainderItemTrInfo,
} from '~/modules/inventories/@types/safeRemainderItems';

type ProductReference = {
  _id: string;
  code: string;
  uom?: string;
};

type MergedImportItem = Omit<ISafeRemainderImportItem, 'productCode'>;

const getDefaultCountedCost = (
  item: Pick<
    ISafeRemainderItemDocument,
    'cost' | 'count' | 'preCount' | 'trInfo'
  >,
  count: number,
) => {
  const activeCost = Math.max(0, item.cost ?? item.trInfo?.activeCost ?? 0);
  return fixNum(
    activeCost === 0 && count > item.preCount
      ? (count - item.preCount) * (item.trInfo?.lastIncomePrice ?? 0)
      : item.preCount > 0
        ? (activeCost / item.preCount) * count
        : 0,
    6,
  );
};

const validateCountedValues = (
  count: number | undefined,
  trInfo?: ISafeRemainderItemTrInfo,
) => {
  if (count !== undefined && (!Number.isFinite(count) || count < 0)) {
    throw new Error('Counted remainder must be zero or greater');
  }

  const unitCost = trInfo?.unitCost;
  if (
    unitCost !== undefined &&
    (!Number.isFinite(unitCost) || unitCost < 0)
  ) {
    throw new Error('Counted cost must be zero or greater');
  }
};

const safeRemainderItemMutations = {
  async safeRemainderItemEdit(
    _root: unknown,
    params: {
      _id: string;
      status?: string;
      remainder?: number;
      trInfo?: ISafeRemainderItemTrInfo;
    },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageSafeRemainders');

    const { _id, status, remainder, trInfo } = params;
    validateCountedValues(remainder, trInfo);
    let nextTrInfo = trInfo;

    if (remainder !== undefined && trInfo === undefined) {
      const storedItem = await models.SafeRemainderItems.getItem(_id);
      const lastIncomePrices = await getLastIncomePrices(models, [
        storedItem.productId,
      ]);
      const item = {
        ...storedItem,
        trInfo: {
          ...storedItem.trInfo,
          lastIncomePrice: lastIncomePrices[storedItem.productId] ?? 0,
        },
      } as ISafeRemainderItemDocument;
      const storedTargetCost = item.trInfo?.unitCost;
      const currentDefaultCost = getDefaultCountedCost(item, item.count);
      const usesDefaultCost =
        item.trInfo?.isCostExplicit === false ||
        (item.trInfo?.isCostExplicit === undefined &&
          (storedTargetCost === undefined ||
            fixNum(storedTargetCost, 6) === currentDefaultCost ||
            storedTargetCost === item.trInfo?.activeCost));

      if (usesDefaultCost) {
        nextTrInfo = {
          ...item.trInfo,
          unitCost: getDefaultCountedCost(item, remainder),
          isCostExplicit: false,
        };
      }
    }

    const doc = {
      ...(remainder !== undefined ? { count: remainder } : {}),
      status: status || SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
      ...(nextTrInfo !== undefined ? { trInfo: nextTrInfo } : {}),
    };

    return await models.SafeRemainderItems.updateItem(_id, doc, user._id);
  },

  async safeRemainderItemsBulkEdit(
    _root: unknown,
    {
      safeRemainderId,
      productsData,
      duplicateRule = 'last',
    }: {
      safeRemainderId: string;
      productsData: ISafeRemainderImportItem[];
      duplicateRule?: 'skip' | 'last' | 'add';
    },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageSafeRemainders');

    const safeRemainder = await models.SafeRemainders.getRemainder(
      safeRemainderId,
    );
    if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      throw new Error('Cant edit cause remainder has submitted');
    }

    const merged: Record<string, MergedImportItem> = {};
    for (const item of productsData) {
      validateCountedValues(item.count, item.trInfo);

      const existing = merged[item.productCode];
      const normalizedItem = {
        count: fixNum(item.count, 4),
        trInfo: item.trInfo,
      };

      if (!existing || duplicateRule === 'last') {
        merged[item.productCode] = normalizedItem;
      } else if (duplicateRule === 'add') {
        merged[item.productCode] = {
          count: fixNum(existing.count + normalizedItem.count, 4),
          trInfo: {
            ...existing.trInfo,
            ...normalizedItem.trInfo,
          },
        };
      }
    }

    const productCodes = Object.keys(merged);

    const products: ProductReference[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { code: { $in: productCodes } },
        fields: { _id: 1, code: 1, uom: 1 },
      },
      defaultValue: [],
    });

    const productByCode: Record<string, ProductReference> = {};
    for (const p of products) {
      productByCode[p.code] = p;
    }

    const productIds = products.map((product) => product._id);
    const lastIncomePrices = await getLastIncomePrices(models, productIds);
    const existingItems: ISafeRemainderItemDocument[] =
      await models.SafeRemainderItems.find({
        remainderId: safeRemainderId,
        productId: { $in: productIds },
      }).lean();
    const existingItemByProductId = new Map(
      existingItems.map((item) => [item.productId, item]),
    );

    const bulkOps: Parameters<typeof models.SafeRemainderItems.bulkWrite>[0] =
      [];
    const now = new Date();

    for (const code of productCodes) {
      const product = productByCode[code];
      if (!product) continue;
      const importItem = merged[code];
      const existingItem = existingItemByProductId.get(product._id);
      const nextCount =
        duplicateRule === 'add'
          ? (existingItem?.count ?? 0) + importItem.count
          : importItem.count;
      const defaultCountedCost = existingItem
        ? getDefaultCountedCost(
            {
              ...existingItem,
              trInfo: {
                ...existingItem.trInfo,
                lastIncomePrice: lastIncomePrices[product._id] ?? 0,
              },
            } as ISafeRemainderItemDocument,
            nextCount,
          )
        : 0;
      const importedTrInfo = importItem.trInfo;
      const trInfoSet = Object.entries(importedTrInfo ?? {}).reduce<
        Record<string, number | boolean>
      >((set, [key, value]) => {
        if (value !== undefined) {
          set[`trInfo.${key}`] = value;
        }
        return set;
      }, {});
      trInfoSet['trInfo.unitCost'] =
        importedTrInfo?.unitCost ?? defaultCountedCost;
      trInfoSet['trInfo.isCostExplicit'] =
        importedTrInfo?.unitCost !== undefined;
      trInfoSet['trInfo.lastIncomePrice'] =
        lastIncomePrices[product._id] ?? 0;

      const setOnInsert = {
        remainderId: safeRemainderId,
        productId: product._id,
        branchId: safeRemainder.branchId,
        departmentId: safeRemainder.departmentId,
        uom: product.uom,
        preCount: 0,
        'trInfo.activeCost': 0,
        createdAt: now,
        createdBy: user._id,
      };

      if (duplicateRule === 'add') {
        bulkOps.push({
          updateOne: {
            filter: { remainderId: safeRemainderId, productId: product._id },
            update: {
              $inc: { count: importItem.count },
              $set: {
                ...trInfoSet,
                status: SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
                modifiedAt: now,
                modifiedBy: user._id,
              },
              $setOnInsert: setOnInsert,
            },
            upsert: true,
          },
        });
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: { remainderId: safeRemainderId, productId: product._id },
          update: {
            $set: {
              count: importItem.count,
              ...trInfoSet,
              status: SAFE_REMAINDER_ITEM_STATUSES.CHECKED,
              modifiedAt: now,
              modifiedBy: user._id,
            },
            $setOnInsert: setOnInsert,
          },
          upsert: true,
        },
      });
    }

    if (!bulkOps.length) return 0;

    const result = await models.SafeRemainderItems.bulkWrite(bulkOps, {
      ordered: false,
    });
    return (result.modifiedCount ?? 0) + (result.upsertedCount ?? 0);
  },

  async safeRemainderItemsRemove(
    _root: unknown,
    { ids }: { ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeSafeRemainders');

    return models.SafeRemainderItems.removeItems(ids);
  },
};

export default safeRemainderItemMutations;
