import { Types } from 'mongoose';
import { IModels, IStorageItem, ITechCard } from '../db/models/Storage';
import { runMovement } from './movementService';
import {
  assertNonNegativeInt,
  assertNonNegativeNumber,
  assertPositiveInt,
  assertPositiveNumber,
  LIMITS,
  newAssetCode,
  newEpcId,
  newSerialNo,
  StorageInputError,
} from './validation';

type ItemSnapshot = IStorageItem & { _id: Types.ObjectId | string };

/** What a single deduction changed, so it can be undone exactly. */
interface IDeductPlan {
  itemId: string;
  openDelta: number;
  packsOpened: number;
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;

const available = (item: Pick<IStorageItem, 'sealedPacks' | 'packSize' | 'openUnits'>) =>
  item.sealedPacks * item.packSize + item.openUnits;

const findItem = async (models: IModels, itemId: string): Promise<ItemSnapshot> => {
  const item = await models.StorageItems.findById(itemId).lean();
  if (!item) throw new StorageInputError('Бараа олдсонгүй.');
  return item as ItemSnapshot;
};

const insufficient = (name: string) =>
  new StorageInputError(`"${name}" барааны үлдэгдэл хүрэлцэхгүй байна.`);

/** Runs `fn` for chunk sizes covering `total`, one chunk at a time. */
const forEachChunk = async (
  total: number,
  size: number,
  fn: (count: number, offset: number) => Promise<void>,
  offset = 0,
): Promise<void> => {
  if (offset >= total) return;
  const count = Math.min(size, total - offset);
  await fn(count, offset);
  return forEachChunk(total, size, fn, offset + count);
};

// ---------------------------------------------------------------------------
// Atomic deduct / restore
// ---------------------------------------------------------------------------

/**
 * Deducts `qty` units, taking open units first and then breaking sealed packs.
 * Uses compare-and-set on the counts it read, retrying on concurrent changes,
 * so two concurrent issues can never both succeed against the same stock.
 */
const deductUnits = async (
  models: IModels,
  itemId: string,
  qty: number,
  movementId: string,
  attempt = 0,
): Promise<IDeductPlan> => {
  const item = await findItem(models, itemId);

  const takeOpen = Math.min(item.openUnits, qty);
  const remaining = round(qty - takeOpen);
  const packsOpened = remaining > 0 ? Math.ceil(remaining / item.packSize) : 0;

  if (item.sealedPacks < packsOpened) throw insufficient(item.name);

  const newOpen = round(item.openUnits - takeOpen + packsOpened * item.packSize - remaining);

  const res = await models.StorageItems.updateOne(
    { _id: item._id, openUnits: item.openUnits, sealedPacks: item.sealedPacks },
    { $set: { openUnits: newOpen, sealedPacks: item.sealedPacks - packsOpened }, $inc: { __v: 1 } },
  );

  if (res.modifiedCount === 0) {
    if (attempt + 1 >= LIMITS.CAS_RETRIES) {
      throw new StorageInputError('Үлдэгдэл зэрэг өөрчлөгдөж байна. Дахин оролдоно уу.');
    }
    return deductUnits(models, itemId, qty, movementId, attempt + 1);
  }

  if (packsOpened > 0) await openTags(models, itemId, packsOpened, movementId);

  return { itemId, openDelta: round(newOpen - item.openUnits), packsOpened };
};

const restoreUnits = async (models: IModels, plan: IDeductPlan, movementId: string) => {
  await models.StorageItems.updateOne(
    { _id: plan.itemId },
    { $inc: { openUnits: -plan.openDelta, sealedPacks: plan.packsOpened, __v: 1 } },
  );
  if (plan.packsOpened > 0) {
    await models.RfidTags.updateMany(
      { itemId: plan.itemId, movementId, zoneStatus: 'OPENED' },
      { $set: { zoneStatus: 'SEALED' } },
    );
  }
};

/** Marks the oldest `count` sealed tags of an item as opened (FIFO). */
const openTags = async (models: IModels, itemId: string, count: number, movementId: string) => {
  const tags = await models.RfidTags.find({ itemId, zoneStatus: 'SEALED' })
    .sort({ createdAt: 1 })
    .limit(count)
    .select({ _id: 1 })
    .lean();

  if (tags.length === 0) return;

  await models.RfidTags.updateMany(
    { _id: { $in: tags.map((t) => t._id) }, zoneStatus: 'SEALED' },
    { $set: { zoneStatus: 'OPENED', movementId } },
  );
};

/** Deducts several items; if one fails, the earlier deductions are restored. */
const deductAll = async (
  models: IModels,
  lines: { itemId: string; qty: number }[],
  movementId: string,
  done: IDeductPlan[] = [],
): Promise<IDeductPlan[]> => {
  if (done.length === lines.length) return done;
  const line = lines[done.length];
  try {
    const plan = await deductUnits(models, line.itemId, line.qty, movementId);
    return deductAll(models, lines, movementId, [...done, plan]);
  } catch (e) {
    await Promise.all(done.map((p) => restoreUnits(models, p, movementId)));
    throw e;
  }
};

// ---------------------------------------------------------------------------
// Receive
// ---------------------------------------------------------------------------

export interface IReceiveParams {
  itemId: string;
  sealedPacks: number;
  openUnits: number;
  txDate?: Date | string | null;
  requestKey?: string | null;
}

const insertTags = async (models: IModels, item: ItemSnapshot, packs: number, movementId: string) =>
  forEachChunk(packs, LIMITS.RFID_INSERT_CHUNK, async (count) => {
    const tags = Array.from({ length: count }, () => ({
      epcId: newEpcId(),
      itemId: String(item._id),
      unitsInPack: item.packSize,
      zoneStatus: 'SEALED' as const,
      movementId,
    }));
    await models.RfidTags.insertMany(tags, { ordered: true });
  });

export const receiveStock = async (models: IModels, params: IReceiveParams, userId?: string) => {
  assertNonNegativeInt(params.sealedPacks, 'Битүү хайрцагны тоо', LIMITS.MAX_RECEIVE_PACKS);
  assertNonNegativeNumber(params.openUnits, 'Задгай тоо');
  if (params.openUnits > LIMITS.MAX_OPEN_UNITS) {
    throw new StorageInputError(`Задгай тоо ${LIMITS.MAX_OPEN_UNITS}-аас их байж болохгүй.`);
  }
  if (params.sealedPacks === 0 && params.openUnits === 0) {
    throw new StorageInputError('Орлогын тоо хэмжээ 0 байна.');
  }

  return runMovement(models, {
    type: 'RECEIVE',
    requestKey: params.requestKey,
    txDate: params.txDate,
    userId,
    apply: async ({ movementId }) => {
      const item = await findItem(models, params.itemId);

      if (item.useRfid && params.sealedPacks > 0) {
        await insertTags(models, item, params.sealedPacks, movementId);
      }

      try {
        const before = await models.StorageItems.findOneAndUpdate(
          { _id: item._id },
          {
            $inc: { sealedPacks: params.sealedPacks, openUnits: params.openUnits, __v: 1 },
            $set: { pendingPrUsers: [] },
          },
          { new: false },
        ).lean();

        if (!before) throw new StorageInputError('Бараа олдсонгүй.');

        return { itemId: String(item._id), notifiedUsers: before.pendingPrUsers || [] };
      } catch (e) {
        await models.RfidTags.deleteMany({ movementId });
        throw e;
      }
    },
  });
};

// ---------------------------------------------------------------------------
// Break a sealed box into the open zone
// ---------------------------------------------------------------------------

export interface IBreakBoxParams {
  itemId: string;
  epcId?: string | null;
  txDate?: Date | string | null;
  requestKey?: string | null;
}

const claimTagForBreak = async (models: IModels, item: ItemSnapshot, epcId: string | null | undefined, movementId: string) => {
  const filter = epcId
    ? { epcId: epcId.toUpperCase(), itemId: String(item._id), zoneStatus: 'SEALED' }
    : { itemId: String(item._id), zoneStatus: 'SEALED' };

  const tag = await models.RfidTags.findOneAndUpdate(
    filter,
    { $set: { zoneStatus: 'OPENED', movementId } },
    { new: true, sort: { createdAt: 1 } },
  ).lean();

  if (!tag) {
    throw new StorageInputError(
      epcId ? `${epcId} ялтас энэ бараанд битүү төлөвтэй олдсонгүй.` : 'Задлах битүү хайрцагны ялтас олдсонгүй.',
    );
  }

  return tag;
};

export const breakSealedBox = async (models: IModels, params: IBreakBoxParams, userId?: string) =>
  runMovement(models, {
    type: 'BREAK_BOX',
    requestKey: params.requestKey,
    txDate: params.txDate,
    userId,
    apply: async ({ movementId }) => {
      const item = await findItem(models, params.itemId);
      const tag = item.useRfid ? await claimTagForBreak(models, item, params.epcId, movementId) : null;

      const res = await models.StorageItems.updateOne(
        { _id: item._id, sealedPacks: { $gte: 1 }, packSize: item.packSize },
        { $inc: { sealedPacks: -1, openUnits: item.packSize, __v: 1 } },
      );

      if (res.modifiedCount === 0) {
        if (tag) {
          await models.RfidTags.updateOne({ _id: tag._id, movementId }, { $set: { zoneStatus: 'SEALED' } });
        }
        throw new StorageInputError('Задлах битүү хайрцаг үлдэгдэлгүй байна.');
      }

      return { itemId: String(item._id), epcId: tag?.epcId || null };
    },
  });

// ---------------------------------------------------------------------------
// Kit conversion (tech cards)
// ---------------------------------------------------------------------------

/** Builds `kits` kits from components. Checks every component before deducting any. */
const assembleKits = async (models: IModels, kit: ItemSnapshot, card: ITechCard, kits: number, movementId: string) => {
  const lines = card.components.map((c) => ({ itemId: c.itemId, qty: c.qty * kits }));
  const components = await models.StorageItems.find({ _id: { $in: lines.map((l) => l.itemId) } }).lean();
  const byId = new Map(components.map((c) => [String(c._id), c]));

  const short = lines.filter((l) => {
    const comp = byId.get(l.itemId);
    return !comp || available(comp) < l.qty;
  });

  if (short.length > 0) {
    const names = short.map((l) => byId.get(l.itemId)?.name || l.itemId).join(', ');
    throw new StorageInputError(`"${kit.name}" угсрахад эд анги хүрэлцэхгүй: ${names}.`);
  }

  const plans = await deductAll(models, lines, movementId);

  try {
    await models.StorageItems.updateOne({ _id: kit._id }, { $inc: { openUnits: kits, __v: 1 } });
  } catch (e) {
    await Promise.all(plans.map((p) => restoreUnits(models, p, movementId)));
    throw e;
  }
};

/** Breaks enough parent kits to cover a component shortage. */
const disassembleKits = async (models: IModels, part: ItemSnapshot, card: ITechCard, shortage: number, movementId: string) => {
  const compDef = card.components.find((c) => c.itemId === String(part._id));
  if (!compDef) return;

  const kitsToBreak = Math.ceil(shortage / compDef.qty);
  const kit = await models.StorageItems.findById(card.kitItemId).lean();
  if (!kit || available(kit) < kitsToBreak) return;

  const plan = await deductUnits(models, String(kit._id), kitsToBreak, movementId);

  try {
    await models.StorageItems.bulkWrite(
      card.components.map((c) => ({
        updateOne: {
          filter: { _id: c.itemId },
          update: { $inc: { openUnits: c.qty * kitsToBreak, __v: 1 } },
        },
      })),
    );
  } catch (e) {
    await restoreUnits(models, plan, movementId);
    throw e;
  }
};

const ensureAvailability = async (models: IModels, item: ItemSnapshot, qty: number, movementId: string) => {
  const shortage = round(qty - available(item));
  if (shortage <= 0) return;

  const kitCard = await models.TechCards.findOne({ kitItemId: String(item._id) }).lean();
  if (kitCard) {
    await assembleKits(models, item, kitCard, Math.ceil(shortage), movementId);
    return;
  }

  const partCard = await models.TechCards.findOne({ 'components.itemId': String(item._id) }).lean();
  if (partCard) {
    await disassembleKits(models, item, partCard, shortage, movementId);
  }
};

// ---------------------------------------------------------------------------
// Issue
// ---------------------------------------------------------------------------

export interface IIssueParams {
  itemId: string;
  qty: number;
  workOrderCode?: string | null;
  taxCode?: string | null;
  directDrop?: boolean | null;
  autoConvert?: boolean | null;
  txDate?: Date | string | null;
  requestKey?: string | null;
}

const DEFAULT_TAX_CODE = 'АЗ-54';

const requireActiveWorkOrder = async (models: IModels, code: string) => {
  const wo = await models.WorkOrders.findOne({ code }).select({ _id: 1, status: 1 }).lean();
  if (!wo) throw new StorageInputError(`#${code} ажлын захиалга олдсонгүй.`);
  if (wo.status !== 'ACTIVE') throw new StorageInputError(`#${code} ажлын захиалга хаагдсан байна.`);
  return wo;
};

const validateIssue = (item: ItemSnapshot, params: IIssueParams) => {
  if (item.itemType === 'TOOL_ASSET') {
    assertPositiveInt(params.qty, 'Багажны тоо', LIMITS.MAX_TOOL_ASSETS_PER_ISSUE);
  }
};

const addCostLine = async (models: IModels, item: ItemSnapshot, params: IIssueParams, txDate: Date) => {
  const lineId = new Types.ObjectId();
  const res = await models.WorkOrders.updateOne(
    { code: params.workOrderCode, status: 'ACTIVE' },
    {
      $push: {
        costLines: {
          _id: lineId,
          date: txDate,
          category: 'MATERIAL',
          taxCode: params.taxCode || DEFAULT_TAX_CODE,
          itemId: String(item._id),
          description: item.name,
          qty: params.qty,
          unitCost: item.avgCost,
          totalAmount: round(params.qty * item.avgCost),
          closedAmount: 0,
          directDrop: Boolean(params.directDrop),
        },
      },
      $inc: { __v: 1 },
    },
  );

  if (res.modifiedCount === 0) {
    throw new StorageInputError(`#${params.workOrderCode} ажлын захиалга хаагдсан эсвэл олдсонгүй.`);
  }

  return lineId;
};

const createToolAssets = async (models: IModels, item: ItemSnapshot, params: IIssueParams, movementId: string) => {
  const assets = Array.from({ length: params.qty }, () => ({
    assetCode: newAssetCode(),
    name: item.name,
    serialNo: newSerialNo(),
    cost: item.avgCost,
    finLifeYears: 5,
    taxLifeYears: 10,
    status: 'PENDING_HANDOVER' as const,
    custodianName: 'Төв нярав',
    pendingCustodian: params.workOrderCode ? `Төсөл #${params.workOrderCode} хариуцагч` : 'Хэрэглэгч',
    pendingToWarehouse: false,
    workOrderCode: params.workOrderCode || null,
    repairExpense: 0,
    movementId,
  }));
  const created = await models.ToolAssets.insertMany(assets, { ordered: true });
  return created.map((a) => a._id);
};

/** Undoes whatever `applyIssue` had written before the failure. */
const rollbackIssue = async (
  models: IModels,
  movementId: string,
  state: { plan?: IDeductPlan; lineId?: Types.ObjectId; code?: string | null },
) => {
  const undo: Promise<unknown>[] = [models.ToolAssets.deleteMany({ movementId })];
  if (state.plan) undo.push(restoreUnits(models, state.plan, movementId));
  if (state.lineId && state.code) {
    undo.push(
      models.WorkOrders.updateOne({ code: state.code }, { $pull: { costLines: { _id: state.lineId } }, $inc: { __v: 1 } }),
    );
  }
  await Promise.all(undo);
};

export const issueStock = async (models: IModels, params: IIssueParams, userId?: string) => {
  assertPositiveNumber(params.qty, 'Зарлагын тоо', LIMITS.MAX_ISSUE_QTY);

  return runMovement(models, {
    type: 'ISSUE',
    requestKey: params.requestKey,
    txDate: params.txDate,
    userId,
    apply: async ({ movementId, txDate }) => {
      const item = await findItem(models, params.itemId);
      validateIssue(item, params);

      if (params.workOrderCode) await requireActiveWorkOrder(models, params.workOrderCode);

      if (!params.directDrop && params.autoConvert) {
        await ensureAvailability(models, item, params.qty, movementId);
      }

      const state: { plan?: IDeductPlan; lineId?: Types.ObjectId; code?: string | null } = {
        code: params.workOrderCode,
      };

      try {
        if (!params.directDrop) state.plan = await deductUnits(models, String(item._id), params.qty, movementId);
        if (params.workOrderCode) state.lineId = await addCostLine(models, item, params, txDate);
        const toolIds = item.itemType === 'TOOL_ASSET' ? await createToolAssets(models, item, params, movementId) : [];

        return {
          itemId: String(item._id),
          docNo: `PL-${movementId.slice(-8).toUpperCase()}`,
          toolIds: toolIds.map(String),
        };
      } catch (e) {
        await rollbackIssue(models, movementId, state);
        throw e;
      }
    },
  });
};
