import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { IContext } from '~/connectionResolvers';
import { CMS_POST_ACTIONS } from '~/meta/permissions';
import { assertCmsAccessByClientPortal } from '../utils/cms-access';
import {
  assertCmsDocumentAccess,
  assertCmsLanguageAccess,
  requireCmsPermission,
} from '../utils/permissions';
import { channelsSchema, deliverySchema, postizBridge } from './bridge';
import { assertShareablePost, publicArticleUrl } from './content';

export type ShareContext = Pick<IContext, 'models' | 'user' | 'subdomain'>;
const identifier = z.string().min(1).max(128);
export const shareInput = z
  .object({
    postId: identifier,
    requestId: z.string().uuid(),
    language: z.string().min(2).max(20),
    channelIds: z.array(identifier).min(1).max(10),
    caption: z.string().trim().min(1).max(2800),
    media: z.array(z.string().url()).max(4),
  })
  .strict();

export async function requireShareAccess(
  context: ShareContext,
  clientPortalId: string,
  language?: string,
) {
  if (!context.user?._id || context.user.isActive === false)
    throw new Error('Active membership required');
  const cms = await context.models.CMS.findOne({ clientPortalId }).lean();
  if (!cms) throw new Error('CMS not found');
  await assertCmsAccessByClientPortal(context, clientPortalId);
  await requireCmsPermission(context, CMS_POST_ACTIONS.sharePostiz);
  await requireCmsPermission(context, [
    CMS_POST_ACTIONS.approve,
    CMS_POST_ACTIONS.createPublished,
  ]);
  await assertCmsLanguageAccess({ context, clientPortalId, language });
  return cms;
}

export async function requireSharePost(
  context: ShareContext,
  postId: string,
  language: string,
) {
  const post = await context.models.Posts.findById(postId).lean();
  assertShareablePost(post);
  if (!post) throw new Error('Post not found');
  const cms = await requireShareAccess(context, post.clientPortalId, language);
  await assertCmsDocumentAccess({
    context,
    actions: CMS_POST_ACTIONS.sharePostiz,
    document: post,
  });
  await assertCmsDocumentAccess({
    context,
    actions: [CMS_POST_ACTIONS.approve, CMS_POST_ACTIONS.createPublished],
    document: post,
  });
  if (
    language !== (cms.language || 'en') &&
    !(await context.models.Translations.exists({
      objectId: post._id,
      type: 'post',
      language,
    }))
  )
    throw new Error('Save this translation before sharing');
  return { post, cms };
}

export async function queueCmsShare(
  context: ShareContext,
  raw: unknown,
  validateOnly = false,
) {
  const input = shareInput.parse(raw);
  const { post, cms } = await requireSharePost(
    context,
    input.postId,
    input.language,
  );
  const allowedMedia = new Set(
    [
      post.thumbnail?.url,
      ...(post.images || []).map((image) => image.url),
    ].filter(Boolean),
  );
  if (input.media.some((url) => !allowedMedia.has(url)))
    throw new Error('Choose media attached to this CMS post');
  const caption = input.caption + '\n\n' + publicArticleUrl(cms, post);
  const options = channelsSchema.parse(
    await postizBridge(context.subdomain, context.user._id, 'channels', {}),
  );
  if (!options.enabled) throw new Error('Enable CMS sharing in Postiz first');
  const channelIds = [...new Set(input.channelIds)];
  const jobs = channelIds.map((channelId) => {
    const channel = options.channels.find(
      (item) => item.id === channelId && item.usable,
    );
    if (!channel) throw new Error('A selected channel is unavailable');
    const _id = createHash('sha256')
      .update(input.requestId + '\n' + channelId)
      .digest('hex');
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify({
          postId: post._id,
          language: input.language,
          caption,
          media: input.media,
          channelId,
        }),
      )
      .digest('hex');
    return {
      _id,
      requestId: _id,
      postId: post._id,
      clientPortalId: post.clientPortalId,
      userId: context.user._id,
      language: input.language,
      channelId,
      channelName: channel.name,
      caption,
      media: input.media,
      fingerprint,
    };
  });
  for (const job of jobs) {
    const existing = await context.models.CmsShares.findById(job._id).lean();
    if (
      existing &&
      (existing.fingerprint !== job.fingerprint ||
        existing.userId !== job.userId)
    )
      throw new Error('This share request was already used');
    if (!existing)
      await postizBridge(context.subdomain, context.user._id, 'validate', {
        source: 'cms_post',
        requestId: job.requestId,
        channelId: job.channelId,
        caption,
        media: input.media,
      });
  }
  if (validateOnly) return [];
  for (const job of jobs)
    await context.models.CmsShares.updateOne(
      { _id: job._id, fingerprint: job.fingerprint, userId: job.userId },
      {
        $setOnInsert: {
          ...job,
          state: 'PENDING',
          nextCheck: new Date(),
          leaseUntil: new Date(0),
          attempts: 0,
        },
      },
      { upsert: true },
    );
  return context.models.CmsShares.find({
    _id: { $in: jobs.map((job) => job._id) },
  }).lean();
}

export async function retryCmsShare(
  context: ShareContext,
  id: string,
  reviewed: boolean,
) {
  if (reviewed !== true)
    throw new Error('Review this delivery in Postiz before retrying');
  const previous = await context.models.CmsShares.findById(
    identifier.parse(id),
  ).lean();
  if (!previous || previous.state !== 'FAILED' || !previous.remotePostId)
    throw new Error('Only confirmed failed deliveries can be retried');
  const { post } = await requireSharePost(
    context,
    previous.postId,
    previous.language,
  );
  const result = deliverySchema.parse(
    await postizBridge(context.subdomain, context.user._id, 'status', {
      postId: previous.remotePostId,
    }),
  );
  if (result.state !== 'FAILED')
    throw new Error('Delivery status changed. Refresh before retrying.');
  const allowedMedia = new Set(
    [
      post.thumbnail?.url,
      ...(post.images || []).map((image) => image.url),
    ].filter(Boolean),
  );
  if (previous.media.some((url) => !allowedMedia.has(url)))
    throw new Error(
      'The original images changed. Create a new share after reviewing Postiz.',
    );
  const _id = createHash('sha256')
    .update('retry:' + previous._id)
    .digest('hex');
  const existing = await context.models.CmsShares.findById(_id).lean();
  if (existing) return existing;
  await postizBridge(context.subdomain, context.user._id, 'validate', {
    source: 'cms_post',
    requestId: _id,
    channelId: previous.channelId,
    caption: previous.caption,
    media: previous.media,
  });
  await context.models.CmsShares.updateOne(
    { _id },
    {
      $setOnInsert: {
        _id,
        requestId: _id,
        postId: previous.postId,
        clientPortalId: previous.clientPortalId,
        userId: context.user._id,
        language: previous.language,
        channelId: previous.channelId,
        channelName: previous.channelName,
        caption: previous.caption,
        media: previous.media,
        fingerprint: previous.fingerprint,
        state: 'PENDING',
        nextCheck: new Date(),
        leaseUntil: new Date(0),
        attempts: 0,
      },
    },
    { upsert: true },
  );
  return context.models.CmsShares.findById(_id).lean();
}
