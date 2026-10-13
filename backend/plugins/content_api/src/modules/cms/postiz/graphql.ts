import type { IContext } from '~/connectionResolvers';
import { channelsSchema, postizBridge } from './bridge';
import { deliveryTenantFilter } from './tenant';
import {
  queueCmsShare,
  requireShareAccess,
  requireSharePost,
  retryCmsShare,
  type ShareContext,
} from './service';
import { triggerCmsDeliveries } from './worker';

// Stay below the gateway timeout; an unfinished run keeps its lease and the
// next refresh shows its result.
const REFRESH_WAIT_MS = 20000;

const startDeliveries = (context: ShareContext) => {
  void triggerCmsDeliveries(context.subdomain, context.models);
};

async function listDeliveries(
  context: ShareContext,
  postId: string,
  language: string,
) {
  await requireSharePost(context, postId, language);
  await postizBridge(context.subdomain, context.user._id, 'channels', {});
  return context.models.CmsShares.find({
    ...deliveryTenantFilter(context.subdomain),
    postId,
    language,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export const postizTypes = `
  type CmsPostizChannel { id: String!, name: String!, provider: String!, usable: Boolean! }
  type CmsPostizOptions { enabled: Boolean!, canManage: Boolean!, channels: [CmsPostizChannel!]! }
  type CmsPostizDelivery { _id: String!, postId: String!, channelName: String!, state: String!, url: String, message: String }
  input CmsPostizShareInput { postId: String!, requestId: String!, language: String!, channelIds: [String!]!, caption: String!, media: [String!]! }
`;
export const postizQueries = `cmsPostizOptions(clientPortalId: String!, language: String): CmsPostizOptions!
  cmsPostizDeliveries(postId: String!, language: String!): [CmsPostizDelivery!]!`;
export const postizMutations = `cmsPostizShare(input: CmsPostizShareInput!): [CmsPostizDelivery!]!
  cmsPostizValidate(input: CmsPostizShareInput!): Boolean!
  cmsPostizRetry(id: String!, reviewedInPostiz: Boolean!): CmsPostizDelivery!
  cmsPostizRefresh(postId: String!, language: String!): [CmsPostizDelivery!]!
  cmsPostizEnable(clientPortalId: String!, language: String!, enabled: Boolean!): Boolean!`;
export const cmsPostizQueries = {
  cmsPostizOptions: async (
    _: unknown,
    args: { clientPortalId: string; language?: string },
    context: IContext,
  ) => {
    await requireShareAccess(context, args.clientPortalId, args.language);
    return channelsSchema.parse(
      await postizBridge(context.subdomain, context.user._id, 'channels', {}),
    );
  },
  cmsPostizDeliveries: (
    _: unknown,
    args: { postId: string; language: string },
    context: IContext,
  ) => listDeliveries(context, args.postId, args.language),
};
export const cmsPostizMutations = {
  cmsPostizValidate: async (
    _: unknown,
    args: { input: unknown },
    context: IContext,
  ) => {
    await queueCmsShare(context, args.input, true);
    return true;
  },
  cmsPostizRetry: async (
    _: unknown,
    args: { id: string; reviewedInPostiz: boolean },
    context: IContext,
  ) => {
    const delivery = await retryCmsShare(
      context,
      args.id,
      args.reviewedInPostiz,
    );
    startDeliveries(context);
    return delivery;
  },
  cmsPostizShare: async (
    _: unknown,
    args: { input: unknown },
    context: IContext,
  ) => {
    const deliveries = await queueCmsShare(context, args.input);
    startDeliveries(context);
    return deliveries;
  },
  cmsPostizRefresh: async (
    _: unknown,
    args: { postId: string; language: string },
    context: IContext,
  ) => {
    await requireSharePost(context, args.postId, args.language);
    let timer: NodeJS.Timeout | undefined;
    await Promise.race([
      triggerCmsDeliveries(context.subdomain, context.models),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, REFRESH_WAIT_MS);
      }),
    ]);
    clearTimeout(timer);
    return listDeliveries(context, args.postId, args.language);
  },
  cmsPostizEnable: async (
    _: unknown,
    args: { clientPortalId: string; language: string; enabled: boolean },
    context: IContext,
  ) => {
    await requireShareAccess(context, args.clientPortalId, args.language);
    await postizBridge(context.subdomain, context.user._id, 'enable', {
      enabled: args.enabled,
    });
    return true;
  },
};
