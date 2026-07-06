import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizations,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export const scheduledPostsDispatcher = async () => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const orgs = await getSaasOrganizations();

    for (const org of orgs) {
      sendWorkerQueue('content', 'schedule').add('schedule', {
        subdomain: org.subdomain,
      });
    }
  } else {
    sendWorkerQueue('content', 'schedule').add('schedule', {
      subdomain: 'os',
    });
  }

  return 'success';
};

export const processScheduledPosts = async (job: Job) => {
  const { subdomain } = job?.data ?? {};

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

  if (publishResult.modifiedCount || archiveResult.modifiedCount) {
    console.log(
      `[content:schedule] org: ${subdomain}, published: ${publishResult.modifiedCount}, archived: ${archiveResult.modifiedCount}`,
    );
  }
};
