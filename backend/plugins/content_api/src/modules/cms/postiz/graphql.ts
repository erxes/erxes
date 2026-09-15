import type { IContext } from '~/connectionResolvers';
import { channelsSchema, postizBridge } from './bridge';
import {
  queueCmsShare,
  requireShareAccess,
  requireSharePost,
  retryCmsShare,
} from './service';

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
  cmsPostizDeliveries: async (
    _: unknown,
    args: { postId: string; language: string },
    context: IContext,
  ) => {
    await requireSharePost(context, args.postId, args.language);
    await postizBridge(context.subdomain, context.user._id, 'channels', {});
    return context.models.CmsShares.find({
      postId: args.postId,
      language: args.language,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  },
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
  cmsPostizRetry: (
    _: unknown,
    args: { id: string; reviewedInPostiz: boolean },
    context: IContext,
  ) => retryCmsShare(context, args.id, args.reviewedInPostiz),
  cmsPostizShare: (_: unknown, args: { input: unknown }, context: IContext) =>
    queueCmsShare(context, args.input),
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
