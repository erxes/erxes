import { IMainContext } from 'erxes-api-shared/core-types';
import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { IModels } from '../../modules/storage/db/models/Storage';
import { StorageService } from '../../modules/storage/services/storageService';

interface IContext extends IMainContext {
  models: IModels;
}

export const resolvers = {
  ...apolloCustomScalars,
  Query: {
    storageItems: async (_: any, args: { company?: string }, ctx: IContext) => {
      await ctx.checkPermission('showStorageItems');
      const filter = args.company ? { 'costCenter.company': args.company } : {};
      return ctx.models.StorageItems.find(filter).lean();
    },
    storageRfidScan: async (_: any, __: any, ctx: IContext) => {
      await ctx.checkPermission('showStorageItems');
      const items = await ctx.models.StorageItems.find({ useRfid: true }).lean();
      return Promise.all(
        items.map(async (it) => {
          const tags = await ctx.models.RfidTags.find({ itemId: String(it._id), zoneStatus: 'SEALED' }).lean();
          return { itemId: String(it._id), sku: it.sku, name: it.name, systemPacks: it.sealedPacks, scannedPacks: tags.length, openUnits: it.openUnits, sampleEpc98: tags[0]?.epcId || null };
        })
      );
    },
    storageWorkOrders: async (_: any, __: any, ctx: IContext) => {
      await ctx.checkPermission('showStorageWorkOrders');
      return ctx.models.WorkOrders.find().sort({ createdAt: -1 }).lean();
    },
    storageToolAssets: async (_: any, __: any, ctx: IContext) => {
      await ctx.checkPermission('showStorageTools');
      return ctx.models.ToolAssets.find().sort({ createdAt: -1 }).lean();
    },
    storageVatPayables: async (_: any, __: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return ctx.models.VatPayables.find().lean();
    },
    storageEBarimtReceipts: async (_: any, __: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return ctx.models.EBarimtReceipts.find().lean();
    },
  },
  Mutation: {
    storageItemCreate: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      return ctx.models.StorageItems.create(args);
    },
    storageReceiveStock: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      return StorageService.receiveStock(ctx.models, args);
    },
    storageBreakSealedBox: async (_: any, args: { itemId: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      return StorageService.breakSealedBox(ctx.models, args.itemId);
    },
    storageIssueStock: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageItems');
      const item = await StorageService.issueStock(ctx.models, args);
      return { item, docNo: `PL-${Date.now().toString().slice(-6)}` };
    },
    storageWorkOrderClosePercent: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageWorkOrders');
      return StorageService.closeWorkOrderPercent(ctx.models, args.workOrderId, args.percent);
    },
    storageWorkOrderReopenLine: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageWorkOrders');
      return StorageService.reopenWorkOrderClose(ctx.models, args.workOrderId, args.costLineId);
    },
    storageToolInitiateHandover: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTools');
      return ctx.models.ToolAssets.findByIdAndUpdate(args.toolId, { $set: { status: 'PENDING_HANDOVER', pendingCustodian: args.toCustodian, workOrderCode: args.workOrderCode || null } }, { new: true });
    },
    storageToolAcceptHandover: async (_: any, args: { toolId: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTools');
      return StorageService.acceptToolHandover(ctx.models, args.toolId);
    },
    storageToolSendToRepair: async (_: any, args: { toolId: string; fee: number }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTools');
      return ctx.models.ToolAssets.findByIdAndUpdate(args.toolId, { $set: { status: 'IN_REPAIR', workOrderCode: null }, $inc: { repairExpense: args.fee } }, { new: true });
    },
    storageVatAutoReconcile: async (_: any, __: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return StorageService.autoReconcileVat(ctx.models);
    },
    storageVatManualReconcile: async (_: any, args: any, ctx: IContext) => {
      await ctx.checkPermission('manageStorageVat');
      return StorageService.manualReconcileVat(ctx.models, args.payableIds, args.receiptId);
    },
    storagePeriodClose: async (_: any, args: { closedUntil: Date }, ctx: IContext) => {
      await ctx.checkPermission('manageStoragePeriodClose');
      await ctx.models.PeriodCloses.create({ closedUntil: args.closedUntil, closedBy: ctx.user._id, status: 'CLOSED' });
      return true;
    },
  },
};
