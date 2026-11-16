import { IModels, IToolAsset } from '../db/models/Storage';
import { runMovement } from './movementService';
import { assertNonNegativeNumber, StorageInputError } from './validation';

const WAREHOUSE_CUSTODIAN = 'Төв нярав';

/** Whole months between when the tool went into service and now. */
export const monthsInService = (tool: Pick<IToolAsset, 'inServiceDate'>, now = new Date()) => {
  if (!tool.inServiceDate) return 0;
  const start = new Date(tool.inServiceDate);
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, now.getDate() >= start.getDate() ? months : months - 1);
};

export const initiateHandover = async (
  models: IModels,
  params: { toolId: string; toCustodian?: string | null; toWarehouse?: boolean | null; workOrderCode?: string | null },
) => {
  const toWarehouse = Boolean(params.toWarehouse);
  const custodian = toWarehouse ? WAREHOUSE_CUSTODIAN : (params.toCustodian || '').trim();

  if (!custodian) throw new StorageInputError('Хүлээн авагчийг заана уу.');

  const tool = await models.ToolAssets.findOneAndUpdate(
    { _id: params.toolId, status: { $in: ['IN_WAREHOUSE', 'IN_USE'] } },
    {
      $set: {
        status: 'PENDING_HANDOVER',
        pendingCustodian: custodian,
        pendingToWarehouse: toWarehouse,
        workOrderCode: toWarehouse ? null : params.workOrderCode || null,
      },
      $inc: { __v: 1 },
    },
    { new: true },
  ).lean();

  if (!tool) throw new StorageInputError('Багаж олдсонгүй эсвэл шилжүүлэх төлөвт биш байна.');
  return tool;
};

/**
 * Accepts a pending handover. The update is conditional on the exact version
 * that was read, so a concurrent repair (or a second accept) cannot be
 * overwritten by this one.
 */
export const acceptHandover = async (models: IModels, toolId: string) => {
  const tool = await models.ToolAssets.findById(toolId).lean();

  if (!tool || tool.status !== 'PENDING_HANDOVER' || !tool.pendingCustodian) {
    throw new StorageInputError('Хүлээн зөвшөөрөх хүсэлт алга байна.');
  }

  const toWarehouse = Boolean(tool.pendingToWarehouse);

  const updated = await models.ToolAssets.findOneAndUpdate(
    { _id: tool._id, status: 'PENDING_HANDOVER', __v: tool.__v },
    {
      $set: {
        custodianName: tool.pendingCustodian,
        pendingCustodian: null,
        pendingToWarehouse: false,
        status: toWarehouse ? 'IN_WAREHOUSE' : 'IN_USE',
        workOrderCode: toWarehouse ? null : tool.workOrderCode,
        inServiceDate: tool.inServiceDate || (toWarehouse ? null : new Date()),
      },
      $inc: { __v: 1 },
    },
    { new: true },
  ).lean();

  if (!updated) throw new StorageInputError('Багажны төлөв өөрчлөгдсөн байна. Дахин шалгана уу.');
  return updated;
};

export const sendToRepair = async (
  models: IModels,
  params: { toolId: string; fee: number; txDate?: Date | string | null; requestKey?: string | null },
  userId?: string,
) => {
  assertNonNegativeNumber(params.fee, 'Засварын зардал');

  return runMovement(models, {
    type: 'TOOL_REPAIR',
    requestKey: params.requestKey,
    txDate: params.txDate,
    userId,
    apply: async () => {
      const tool = await models.ToolAssets.findOneAndUpdate(
        { _id: params.toolId, status: { $in: ['IN_WAREHOUSE', 'IN_USE'] } },
        {
          $set: { status: 'IN_REPAIR', workOrderCode: null },
          $inc: { repairExpense: params.fee, __v: 1 },
        },
        { new: true },
      ).lean();

      if (!tool) throw new StorageInputError('Багаж олдсонгүй эсвэл засварт явуулах төлөвт биш байна.');
      return { toolId: String(tool._id) };
    },
  });
};
