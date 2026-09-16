import { getSaasOrganizations, sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels, type IContext } from '~/connectionResolvers';
import { deliverySchema, postizBridge } from './bridge';
import { requireSharePost } from './service';
import { requireDeliveryTenant, resolveDeliveryTenant } from './tenant';

export async function runCmsDeliveries(subdomain?: string) {
  const databaseTenant =
    process.env.VERSION === 'saas'
      ? requireDeliveryTenant(subdomain)
      : undefined;
  // Enterprise has one database. Its routing identity comes from each job, not VERSION.
  const models = await generateModels(databaseTenant ?? '');
  for (let index = 0; index < 20; index++) {
    const now = new Date();
    const job = await models.CmsShares.findOneAndUpdate(
      {
        state: { $in: ['PENDING', 'QUEUED'] },
        nextCheck: { $lte: now },
        leaseUntil: { $lte: now },
      },
      {
        $set: { leaseUntil: new Date(Date.now() + 120000) },
        $inc: { attempts: 1 },
      },
      { new: true, sort: { nextCheck: 1 } },
    ).lean();
    if (!job) return;
    let deliveryTenant: string;
    try {
      deliveryTenant = resolveDeliveryTenant(job.subdomain, databaseTenant);
    } catch {
      await models.CmsShares.updateOne(
        { _id: job._id, leaseUntil: job.leaseUntil },
        {
          $set: {
            state: 'UNKNOWN',
            message:
              'Delivery tenant needs recovery. An administrator must verify the originating tenant and check Postiz before retrying.',
            leaseUntil: new Date(0),
          },
        },
      );
      continue;
    }
    try {
      if (job.subdomain === undefined) {
        const bound = await models.CmsShares.updateOne(
          { _id: job._id, leaseUntil: job.leaseUntil },
          { $set: { subdomain: deliveryTenant } },
        );
        if (bound.matchedCount !== 1) continue;
      }
      if (!job.remotePostId) {
        const users: unknown = await sendTRPCMessage({
          subdomain: deliveryTenant,
          pluginName: 'core',
          module: 'users',
          action: 'find',
          input: {
            query: { _id: job.userId, isActive: true },
            fields: {
              _id: 1,
              isActive: 1,
              isOwner: 1,
              permissionGroupIds: 1,
              customPermissions: 1,
            },
          },
          defaultValue: [],
          options: { signal: AbortSignal.timeout(10000) },
        });
        if (
          !Array.isArray(users) ||
          users.length !== 1 ||
          users[0]?._id !== job.userId ||
          users[0]?.isActive !== true
        )
          throw new Error('The publishing user is no longer active');
        // The public core response is the authority for permission fields, never the saved job.
        const user = users[0] as IContext['user'];
        try {
          await requireSharePost(
            {
              models:
                databaseTenant === undefined
                  ? await generateModels(deliveryTenant)
                  : models,
              subdomain: deliveryTenant,
              user,
            },
            job.postId,
            job.language,
          );
        } catch {
          await models.CmsShares.updateOne(
            { _id: job._id, leaseUntil: job.leaseUntil },
            {
              $set: {
                state: job.attempts === 1 ? 'CANCELLED' : 'UNKNOWN',
                message:
                  job.attempts === 1
                    ? 'CMS publication or sharing permission changed before dispatch.'
                    : 'Permissions changed after a delivery attempt. Check Postiz before sharing again.',
                leaseUntil: new Date(0),
              },
            },
          );
          continue;
        }
      }
      const result = deliverySchema.parse(
        await postizBridge(
          deliveryTenant,
          job.userId,
          job.remotePostId ? 'status' : 'publish',
          job.remotePostId
            ? { postId: job.remotePostId }
            : {
                source: 'cms_post',
                requestId: job.requestId,
                channelId: job.channelId,
                caption: job.caption,
                media: job.media,
              },
        ),
      );
      await models.CmsShares.updateOne(
        { _id: job._id, leaseUntil: job.leaseUntil },
        {
          $set: {
            state: result.state,
            ...(result.postId ? { remotePostId: result.postId } : {}),
            url: result.url || '',
            message: result.message || '',
            leaseUntil: new Date(0),
            nextCheck: new Date(Date.now() + 60000),
          },
        },
      );
    } catch {
      await models.CmsShares.updateOne(
        { _id: job._id, leaseUntil: job.leaseUntil },
        {
          $set: {
            ...(job.attempts >= 20 ? { state: 'UNKNOWN' } : {}),
            message:
              job.attempts >= 20
                ? 'Delivery cannot be confirmed. Review this workspace in Postiz before sharing again.'
                : 'Waiting for Postiz. Your CMS article remains published.',
            leaseUntil: new Date(0),
            nextCheck: new Date(
              Date.now() + Math.min(job.attempts * 30000, 300000),
            ),
          },
        },
      );
    }
  }
}

export function startCmsDeliveryWorker() {
  if (!process.env.JWT_TOKEN_SECRET?.trim()) return;
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      if (process.env.VERSION !== 'saas') {
        await runCmsDeliveries();
        return;
      }
      const tenants: { subdomain: string }[] = await getSaasOrganizations();
      for (const tenant of tenants) {
        if (!tenant.subdomain) continue;
        try {
          await runCmsDeliveries(tenant.subdomain);
        } catch {
          console.error(
            '[content:postiz] Delivery sweep failed; it will retry.',
          );
        }
      }
    } catch {
      console.error('[content:postiz] Tenant discovery failed; it will retry.');
    } finally {
      running = false;
    }
  };
  setTimeout(() => void tick(), 1000).unref();
  setInterval(() => void tick(), 15000).unref();
}
