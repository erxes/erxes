import { sendWorkerQueue } from 'erxes-api-shared/utils';
import {
  TDiscordCleanupJob,
  TDiscordNotificationJob,
} from '@/discordIntegration/@types/discordNotification';
import {
  DISCORD_CUSTOMER_EVENTS,
  DISCORD_NOTIFY_JOB_OPTIONS,
  DISCORD_NOTIFY_QUEUE,
} from '@/discordIntegration/constants';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

type TDiscordSourceRecord = {
  discordSource?: { userId?: string; channelId?: string } | null;
};

const findReportedSource = async (models: IModels, entityId: string) => {
  const task = await models.Task.findOne({ _id: entityId })
    .select('discordSource')
    .lean<TDiscordSourceRecord>();

  if (task) {
    return task.discordSource ?? null;
  }

  const triage = await models.Triage.findOne({ _id: entityId })
    .select('discordSource')
    .lean<TDiscordSourceRecord>();

  return triage?.discordSource ?? null;
};

const hasCustomerThread = async (
  models: IModels,
  job: TDiscordNotificationJob,
) => {
  const filter = {
    entityId: job.entityId,
    subdomain: job.subdomain,
    audience: 'customer',
  };

  if (await models.DiscordMessage.exists(filter)) {
    return true;
  }

  const source = await findReportedSource(models, job.entityId);

  if (!source?.channelId) {
    return false;
  }

  const customerChannel = await models.DiscordCustomerChannel.findForChannel(
    job.subdomain,
    [source.channelId],
  );

  if (!customerChannel) {
    return false;
  }

  try {
    await models.DiscordMessage.create({
      ...filter,
      channelId: source.channelId,
      messageId: '',
      configId: String(customerChannel._id),
      lastEvent: 'triageCreated',
      discordUserId: source.userId,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }
  }

  return true;
};

type TDiscordRemovableRecord = { _id: unknown; number?: number; name: string };

export const notifyDiscordRemoval = async (
  models: IModels,
  records: TDiscordRemovableRecord[],
  { configIds }: { configIds?: string[] } = {},
) => {
  try {
    const entityIds = records.map((record) => String(record._id));
    const thread = await models.DiscordMessage.findOne({
      entityId: { $in: entityIds },
      ...(configIds ? { configId: { $in: configIds } } : {}),
    })
      .select('subdomain')
      .lean();

    if (!thread) {
      return;
    }

    const job: TDiscordCleanupJob = {
      type: 'cleanup',
      subdomain: thread.subdomain,
      records: records.map((record) => ({
        entityId: String(record._id),
        label: `Task #${record.number ?? 0}`,
        name: record.name,
      })),
      ...(configIds ? { configIds } : {}),
    };

    await sendWorkerQueue('operations', DISCORD_NOTIFY_QUEUE).add(
      'cleanup',
      job,
      DISCORD_NOTIFY_JOB_OPTIONS,
    );
  } catch (error) {
    console.error(
      `Failed to queue the Discord cleanup: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const notifyDiscordTeamChange = async (
  models: IModels,
  record: TDiscordRemovableRecord & { teamId: unknown },
  previousTeamId: string,
) => {
  try {
    const [previousConfig, nextConfig] = await Promise.all([
      models.DiscordConfig.findOne({ teamId: previousTeamId })
        .select('_id channelId')
        .lean(),
      models.DiscordConfig.findOne({ teamId: record.teamId })
        .select('channelId')
        .lean(),
    ]);

    if (previousConfig && previousConfig.channelId !== nextConfig?.channelId) {
      await notifyDiscordRemoval(models, [record], {
        configIds: [String(previousConfig._id)],
      });
    }
  } catch (error) {
    console.error(
      `Failed to queue the Discord team change: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export const notifyDiscord = async (
  models: IModels,
  job: TDiscordNotificationJob,
) => {
  try {
    const [teamSubscribed, customerThread] = await Promise.all([
      models.DiscordConfig.exists({
        teamId: job.teamId,
        subdomain: job.subdomain,
        isActive: true,
        events: job.event,
      }),
      DISCORD_CUSTOMER_EVENTS.includes(job.event)
        ? hasCustomerThread(models, job)
        : false,
    ]);

    const queue = sendWorkerQueue('operations', DISCORD_NOTIFY_QUEUE);

    if (teamSubscribed) {
      await queue.add(
        job.event,
        { ...job, target: 'team' },
        DISCORD_NOTIFY_JOB_OPTIONS,
      );
    }

    if (customerThread) {
      await queue.add(
        job.event,
        { ...job, target: 'customer' },
        DISCORD_NOTIFY_JOB_OPTIONS,
      );
    }
  } catch (error) {
    console.error(
      `Failed to queue the Discord ${job.event} notification: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
