import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { TDiscordNotificationJob } from '@/discordIntegration/@types/discordNotification';
import {
  DISCORD_NOTIFY_JOB_OPTIONS,
  DISCORD_NOTIFY_QUEUE,
} from '@/discordIntegration/constants';
import { IModels } from '~/connectionResolvers';

export const notifyDiscord = async (
  models: IModels,
  job: TDiscordNotificationJob,
) => {
  try {
    const isSubscribed = await models.DiscordConfig.exists({
      teamId: job.teamId,
      subdomain: job.subdomain,
      isActive: true,
      events: job.event,
    });

    if (!isSubscribed) {
      return;
    }

    await sendWorkerQueue('operations', DISCORD_NOTIFY_QUEUE).add(
      job.event,
      job,
      DISCORD_NOTIFY_JOB_OPTIONS,
    );
  } catch (error) {
    console.error(
      `Failed to queue the Discord ${job.event} notification: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
