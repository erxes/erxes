import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { IZoneLocation } from '../../modules/storage/@types/storage';
import { IContext } from '~/connectionResolvers';
import { breakBoxes, IBreakBoxesInput, retryAccounting } from '../../modules/storage/services/movementService';
import { submitScan, zoneSummary } from '../../modules/storage/services/scanService';
import { IRegisterTagsInput, registerTags, removeTags } from '../../modules/storage/services/tagService';
import { pageOf } from '../../modules/storage/services/validation';
import { IZoneInput, removeZone, saveZone } from '../../modules/storage/services/zoneService';

interface IPageArgs {
  page?: number;
  perPage?: number;
}

const userIdOf = (ctx: IContext) => (ctx.user?._id ? String(ctx.user._id) : undefined);

/** Federation references: the gateway resolves these from core. */
const productRef = ({ productId }: { productId?: string }) =>
  productId ? { __typename: 'Product', _id: productId } : null;

const withProduct = { product: productRef };

const definedOnly = (filter: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => Boolean(value)));

export const resolvers = {
  ...apolloCustomScalars,

  StorageZoneLocation: {
    branch: ({ branchId }: IZoneLocation) => ({ __typename: 'Branch', _id: branchId }),
    department: ({ departmentId }: IZoneLocation) => ({ __typename: 'Department', _id: departmentId }),
  },
  StorageRfidTag: withProduct,
  StorageRfidSummaryRow: withProduct,
  StorageMovementItem: withProduct,
  StorageScanProductRow: withProduct,

  Query: {
    storageZones: async (_: unknown, __: unknown, ctx: IContext) => {
      await ctx.checkPermission('showStorage');
      return ctx.models.Zones.find().sort({ name: 1 }).lean();
    },
    storageRfidTags: async (
      _: unknown,
      args: IPageArgs & { zoneId?: string; productId?: string; status?: string },
      ctx: IContext,
    ) => {
      await ctx.checkPermission('showStorage');
      const filter = definedOnly({ zoneId: args.zoneId, productId: args.productId, status: args.status });
      const { limit, skip } = pageOf(args.page, args.perPage);
      const [list, totalCount] = await Promise.all([
        ctx.models.RfidTags.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ctx.models.RfidTags.countDocuments(filter),
      ]);
      return { list, totalCount };
    },
    storageRfidSummary: async (_: unknown, args: { zoneId: string }, ctx: IContext) => {
      await ctx.checkPermission('showStorage');
      return zoneSummary(ctx.models, args.zoneId);
    },
    storageMovements: async (_: unknown, args: IPageArgs & { accountingStatus?: string }, ctx: IContext) => {
      await ctx.checkPermission('showStorage');
      const { limit, skip } = pageOf(args.page, args.perPage);
      return ctx.models.Movements.find(definedOnly({ accountingStatus: args.accountingStatus }))
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    },
    storageScanSessions: async (_: unknown, args: { zoneId: string; limit?: number }, ctx: IContext) => {
      await ctx.checkPermission('showStorage');
      const { limit } = pageOf(1, args.limit || 10);
      return ctx.models.ScanSessions.find({ zoneId: args.zoneId }).sort({ createdAt: -1 }).limit(limit).lean();
    },
  },

  Mutation: {
    storageZoneSave: async (_: unknown, args: IZoneInput, ctx: IContext) => {
      await ctx.checkPermission('manageStorageZones');
      return saveZone(ctx.models, args);
    },
    storageZoneRemove: async (_: unknown, args: { _id: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageZones');
      return removeZone(ctx.models, args._id);
    },
    storageRfidTagsRegister: async (_: unknown, args: IRegisterTagsInput, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTags');
      return registerTags(ctx.models, args, userIdOf(ctx));
    },
    storageRfidTagsRemove: async (_: unknown, args: { epcIds: string[] }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTags');
      return removeTags(ctx.models, args.epcIds);
    },
    storageBreakBoxes: async (_: unknown, args: IBreakBoxesInput, ctx: IContext) => {
      await ctx.checkPermission('manageStorageMovements');
      return breakBoxes(ctx.models, ctx.subdomain, args, userIdOf(ctx));
    },
    storageRfidScanSubmit: async (_: unknown, args: { zoneId: string; epcIds: string[] }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageTags');
      return submitScan(ctx.models, args, userIdOf(ctx));
    },
    storageMovementRetryAccounting: async (_: unknown, args: { _id: string }, ctx: IContext) => {
      await ctx.checkPermission('manageStorageMovements');
      return retryAccounting(ctx.models, ctx.subdomain, args._id, userIdOf(ctx));
    },
  },
};
