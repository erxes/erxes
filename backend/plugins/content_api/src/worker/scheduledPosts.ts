import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizationsByFilter,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { syncPostScheduleSafely } from '~/worker/postScheduling';
import { TPostScheduleJobData } from '~/worker/postSchedulingPlan';

type TReconciliationJobData = {
  subdomain: string;
};

const RECONCILIATION_JOB_OPTIONS = {
  removeOnComplete: true,
  removeOnFail: true,
};

const getSubdomainKey = (subdomain: string) =>
  Buffer.from(subdomain).toString('base64url');

/**
 * Returns the stable ID that prevents overlapping reconciliation per tenant.
 */
export const getReconciliationJobId = (subdomain: string) =>
  `content-reconcile-${getSubdomainKey(subdomain)}`;

/**
 * Scheduler tick handler: enqueues one scheduled-posts check per organization
 * (every org in saas mode, the single `os` tenant otherwise).
 */
export const scheduledPostsDispatcher = async () => {
  const VERSION = getEnv({ name: 'VERSION' });
  const scheduleQueue = sendWorkerQueue('content', 'schedule');

  if (VERSION && VERSION === 'saas') {
    const orgs: Array<{ subdomain: string }> =
      await getSaasOrganizationsByFilter({
        onboardedPlugins: 'content',
        subdomain: { $type: 'string' },
      });

    for (const org of orgs) {
      await scheduleQueue.add(
        'reconcile',
        { subdomain: org.subdomain },
        {
          ...RECONCILIATION_JOB_OPTIONS,
          jobId: getReconciliationJobId(org.subdomain),
        },
      );
    }
  } else {
    await scheduleQueue.add(
      'reconcile',
      { subdomain: 'os' },
      {
        ...RECONCILIATION_JOB_OPTIONS,
        jobId: getReconciliationJobId('os'),
      },
    );
  }

  return 'success';
};

/**
 * Publishes scheduled posts whose scheduledDate has passed (keeping an
 * existing publishedDate) and archives published posts whose autoArchiveDate
 * has passed, for the organization named in the job data.
 */
export const reconcileScheduledPosts = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const now = new Date();

  const publishResult = await models.Posts.updateMany(
    {
      status: 'scheduled',
      scheduledDate: { $lte: now },
    },
    [
      {
        $set: {
          status: 'published',
          publishedDate: { $ifNull: ['$publishedDate', '$$NOW'] },
        },
      },
    ],
  );

  const archiveResult = await models.Posts.updateMany(
    {
      status: 'published',
      autoArchiveDate: { $lte: now },
    },
    { $set: { status: 'archived' } },
  );

  return {
    publishedCount: publishResult.modifiedCount,
    archivedCount: archiveResult.modifiedCount,
  };
};

const processDelayedPost = async (
  action: 'publish' | 'archive',
  { subdomain, postId, dueAt }: TPostScheduleJobData,
) => {
  const models = await generateModels(subdomain);
  const expectedDate = new Date(dueAt);

  if (Number.isNaN(expectedDate.getTime())) {
    throw new TypeError('Scheduled post job has an invalid due date');
  }

  if (action === 'publish') {
    const publishedPost = await models.Posts.findOneAndUpdate(
      {
        _id: postId,
        status: 'scheduled',
        scheduledDate: expectedDate,
      },
      [
        {
          $set: {
            status: 'published',
            publishedDate: { $ifNull: ['$publishedDate', '$$NOW'] },
          },
        },
      ],
      { new: true },
    );

    if (publishedPost) {
      await syncPostScheduleSafely({
        subdomain,
        previousPost: {
          _id: publishedPost._id,
          status: 'scheduled',
          scheduledDate: expectedDate,
          autoArchiveDate: publishedPost.autoArchiveDate,
        },
        currentPost: publishedPost,
      });
    }

    return;
  }

  await models.Posts.updateOne(
    {
      _id: postId,
      status: 'published',
      autoArchiveDate: expectedDate,
    },
    { $set: { status: 'archived' } },
  );
};

const isPostScheduleJobData = (
  data: TReconciliationJobData | TPostScheduleJobData,
): data is TPostScheduleJobData =>
  'postId' in data && typeof data.postId === 'string' && 'dueAt' in data;

/**
 * Routes reconciliation and delayed post jobs to their specialized processors.
 */
export const processScheduledPostJob = async (
  job: Job<TReconciliationJobData | TPostScheduleJobData>,
) => {
  if (job.name === 'reconcile') {
    return reconcileScheduledPosts(job.data.subdomain);
  }

  if (job.name === 'schedule') {
    // Jobs queued by the old per-minute poll are intentionally not replayed.
    job.opts.removeOnComplete = true;
    return 'Skipped legacy per-minute reconciliation job';
  }

  if (job.name === 'publish' || job.name === 'archive') {
    if (!isPostScheduleJobData(job.data)) {
      throw new Error(`Content ${job.name} job is missing post data`);
    }

    return processDelayedPost(job.name, job.data);
  }

  throw new Error(`Unsupported content schedule job: ${job.name}`);
};
