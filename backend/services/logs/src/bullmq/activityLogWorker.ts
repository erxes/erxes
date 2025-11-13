import { Job } from 'bullmq';
import { generateModels } from '~/connectionResolvers';

export const activityLogWorker = async (job: Job<any>) => {
  const { subdomain, source, status, contentType, payload } = job.data;
  const models = await generateModels(subdomain);

  //   const activityLog = await models.ActivityLogs.create({
  //     subdomain,
  //     source,
  //     status,
  //     contentType,
  //     payload,
  //   });
};
