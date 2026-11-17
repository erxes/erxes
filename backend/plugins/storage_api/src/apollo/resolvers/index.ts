import { IMainContext } from 'erxes-api-shared/core-types';
import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { IModels, IStorageItem, IToolAsset } from '../../modules/storage/db/models/Storage';
import { closePeriod, reopenPeriod } from '../../modules/storage/services/movementService';
import {
  breakSealedBox,
  IBreakBoxParams,
  IIssueParams,
  IReceiveParams,
  issueStock,
  receiveStock,
} from '../../modules/storage/services/stockService';
import {
  acceptHandover,
  initiateHandover,
  monthsInService,
  sendToRepair,
} from '../../modules/storage/services/toolService';
import {
  assertNonNegativeNumber,
  assertPositiveInt,
  LIMITS,
} from '../../modules/storage/services/validation';
import { autoReconcileVat, manualReconcileVat } from '../../modules/storage/services/vatService';
import { closeWorkOrderPercent, reopenWorkOrderLine } from '../../modules/storage/services/workOrderService';

interface IContext extends IMainContext {
  models: IModels;
}

interface IItemCreateArgs {
  sku: string;
  name: string;
  nickname?: string | null;
  itemType: IStorageItem['itemType'];
  useRfid: boolean;
  packSize: number;
  avgCost: number;
  costCenter: IStorageItem['costCenter'];
}

const userIdOf = (ctx: IContext) => (ctx.user?._id ? String(ctx.user._id) : undefined);

const loadItem = async (ctx: IContext, itemId: string) => {
  const item = await ctx.models.StorageItems.findById(itemId).lean();
  if (!item) throw new Error('Бараа олдсонгүй.');
  return item;
};

export const resolvers = {
  ...apolloCustomScalars,

  StorageToolAsset: {
    monthsUsed: (tool: IToolAsset) => monthsInService(tool),
  },

  Query: {
    storageItems: async (_: unknown, args: { company?: string }, ctx: IContext) => {
      await ctx.checkPermission('showStorageItems');
      const filter = args.company ? { 'costCenter.company': args.company } : {};
      return ctx.models.StorageItems.find(filter).lean();
    },
    storageRfidScan: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('showStorageItems');
      const items = await ctx.models.StorageItems.find({ useRfid: true }).lean();
      const counts = await ctx.models.RfidTags.aggregate<{ _id: string; count: number; sampleEpc: string }>([
        { $match: { itemId: { $in: items.map((it) => String(it._id)) }, zoneStatus: 'SEALED' } },
        { $group: { _id: '$itemId', count: { $sum: 1 }, sampleEpc: { $first: '$epcId' } } },
      ]);
      const byItem = new Map(counts.map((c) => [c._id, c]));
      return items.map((it) => {
        const c = byItem.get(String(it._id));
        return {
          itemId: String(it._id),
          sku: it.sku,
          name: it.name,
          systemPacks: it.sealedPacks,
          scannedPacks: c?.count || 0,
          openUnits: it.openUnits,
          sampleEpc: c?.sampleEpc || null,
        };
      });
    },
    storageWorkOrders: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('showStorageWorkOrders');
      return ctx.models.WorkOrders.find().sort({ createdAt: -1 }).lean();
    },
    storageToolAssets: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('showStorageTools');
      return ctx.models.ToolAssets.find().sort({ createdAt: -1 }).lean();
    },
    storageVatPayables: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return ctx.models.VatPayables.find().lean();
    },
    storageEBarimtReceipts: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return ctx.models.EBarimtReceipts.find().lean();
    },
    storagePeriodCloses: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('manageStoragePeriodClose');
      return ctx.models.PeriodCloses.find().sort({ createdAt: -1 }).limit(50).lean();
    },
  },

  Mutation: {
    storageItemCreate: async (_: unknown, args: IItemCreateArgs, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      assertPositiveInt(args.packSize, 'Хайрцагны багтаамж', LIMITS.MAX_OPEN_UNITS);
      assertNonNegativeNumber(args.avgCost, 'Дундаж өртөг');
      return ctx.models.StorageItems.create(args);
    },
    storageReceiveStock: async (_: unknown, args: IReceiveParams, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      const result = await receiveStock(ctx.models, args, userIdOf(ctx));
      return { item: await loadItem(ctx, result.itemId), notifiedUsers: result.notifiedUsers };
    },
    storageBreakSealedBox: async (_: unknown, args: IBreakBoxParams, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      const result = await breakSealedBox(ctx.models, args, userIdOf(ctx));
      return loadItem(ctx, result.itemId);
    },
    storageIssueStock: async (_: unknown, args: IIssueParams, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      const result = await issueStock(ctx.models, args, userIdOf(ctx));
      return { item: await loadItem(ctx, result.itemId), docNo: result.docNo };
    },
    storageWorkOrderClosePercent: async (
      _: unknown,
      args: { workOrderId: string; percent: number; requestKey?: string },
      ctx: IContext,
    ) => {
      await ctx.checkPermission('manageStorageWorkOrders');
      const result = await closeWorkOrderPercent(ctx.models, args, userIdOf(ctx));
      return ctx.models.WorkOrders.findById(result.workOrderId).lean();
    },
    storageWorkOrderReopenLine: async (
      _: unknown,
      args: { workOrderId: string; costLineId: string; requestKey?: string },
      ctx: IContext,
    ) => {
      await ctx.checkPermission('manageStorageWorkOrders');
      const result = await reopenWorkOrderLine(ctx.models, args, userIdOf(ctx));
      return ctx.models.WorkOrders.findById(result.workOrderId).lean();
    },
    storageToolInitiateHandover: async (
      _: unknown,
      args: { toolId: string; toCustodian?: string; toWarehouse?: boolean; workOrderCode?: string },
      ctx: IContext,
    ) => {
      await ctx.checkPermission('manageStorageTools');
      return initiateHandover(ctx.models, args);
    },
    storageToolAcceptHandover: async (_: unknown, args: { toolId: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTools');
      return acceptHandover(ctx.models, args.toolId);
    },
    storageToolSendToRepair: async (
      _: unknown,
      args: { toolId: string; fee: number; txDate?: Date; requestKey?: string },
      ctx: IContext,
    ) => {
      await ctx.checkPermission('manageStorageTools');
      const result = await sendToRepair(ctx.models, args, userIdOf(ctx));
      return ctx.models.ToolAssets.findById(result.toolId).lean();
    },
    storageVatAutoReconcile: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return autoReconcileVat(ctx.models);
    },
    storageVatManualReconcile: async (_: unknown, args: { payableIds: string[]; receiptId: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return manualReconcileVat(ctx.models, args.payableIds, args.receiptId);
    },
    storagePeriodClose: async (_: unknown, args: { closedUntil: Date }, ctx: IContext) => {
      await ctx.checkPermission('manageStoragePeriodClose');
      return closePeriod(ctx.models, args.closedUntil, userIdOf(ctx) || 'system');
    },
    storagePeriodReopen: async (_: unknown, args: { closeId: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStoragePeriodClose');
      return reopenPeriod(ctx.models, args.closeId, userIdOf(ctx) || 'system');
    },
  },
};
