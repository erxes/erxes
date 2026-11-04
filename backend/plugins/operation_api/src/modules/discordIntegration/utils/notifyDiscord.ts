import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IDiscordConfig } from '@/discordIntegration/@types/discordConfig';
import {
  TDiscordCleanupJob,
  TDiscordNotificationEvent,
  TDiscordNotificationJob,
  TDiscordPullRequestJob,
} from '@/discordIntegration/@types/discordNotification';
import {
  DISCORD_CUSTOMER_EVENTS,
  DISCORD_NOTIFY_JOB_OPTIONS,
  DISCORD_NOTIFY_QUEUE,
} from '@/discordIntegration/constants';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

const findSubscribedConfigIds = async (
  models: IModels,
  { teamId, subdomain }: { teamId: string; subdomain: string },
  event: TDiscordNotificationEvent,
) => {
  const configs = await models.DiscordConfig.find({
    teamId,
    subdomain,
    isActive: true,
    events: event,
  })
    .select('_id')
    .lean();

  return configs.map((config) => String(config._id));
};

const queueTeamJobs = (configIds: string[], job: TDiscordNotificationJob) => {
  const queue = sendWorkerQueue('operations', DISCORD_NOTIFY_QUEUE);

  return Promise.all(
    configIds.map((configId) =>
      queue.add(
        job.event,
        { ...job, target: 'team', configId },
        DISCORD_NOTIFY_JOB_OPTIONS,
      ),
    ),
  );
};

type TDiscordSourceRecord = {
  companyId?: string | null;
  discordSource?: { userId?: string; channelId?: string } | null;
};

const findReportedRecord = async (models: IModels, entityId: string) => {
  const task = await models.Task.findOne({ _id: entityId })
    .select('companyId discordSource')
    .lean<TDiscordSourceRecord>();

  if (task) {
    return task;
  }

  return models.Triage.findOne({ _id: entityId })
    .select('companyId discordSource')
    .lean<TDiscordSourceRecord>();
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

  const record = await findReportedRecord(models, job.entityId);
  const source = record?.discordSource;

  if (!source?.channelId || !record?.companyId) {
    return false;
  }

  const customerChannel = await models.DiscordCustomerChannel.findForChannel(
    job.subdomain,
    [source.channelId],
  );

  if (customerChannel?.companyId !== String(record.companyId)) {
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

type TDiscordRemovableRecord = {
  _id: unknown;
  number?: number;
  name: string;
  companyId?: string | null;
};

export const notifyDiscordRemoval = async (
  models: IModels,
  subdomain: string,
  records: TDiscordRemovableRecord[],
  { configIds }: { configIds?: string[] } = {},
) => {
  try {
    const entityIds = records.map((record) => String(record._id));
    const hasThread = await models.DiscordMessage.exists({
      entityId: { $in: entityIds },
      subdomain,
      ...(configIds ? { configId: { $in: configIds } } : {}),
    });

    if (!hasThread) {
      return;
    }

    const job: TDiscordCleanupJob = {
      type: 'cleanup',
      subdomain,
      records: records.map((record) => ({
        entityId: String(record._id),
        label: `Task #${record.number ?? 0}`,
        name: record.name,
        companyId: record.companyId ?? null,
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

const keepsMovedCard = (
  config: Pick<IDiscordConfig, 'isActive' | 'events'>,
  notify: boolean,
) => notify && config.isActive && config.events.includes('taskMoved');

export const notifyDiscordTeamChange = async (
  models: IModels,
  subdomain: string,
  record: TDiscordRemovableRecord & { teamId: unknown },
  previousTeamId: string,
  { actorId, notify = true }: { actorId?: string; notify?: boolean } = {},
) => {
  try {
    const teamId = String(record.teamId);
    const entityId = String(record._id);

    const [previousConfigs, nextConfigs] = await Promise.all([
      models.DiscordConfig.find({ teamId: previousTeamId, subdomain })
        .select('_id channelId isActive events')
        .lean(),
      models.DiscordConfig.find({ teamId, subdomain })
        .select('channelId')
        .lean(),
    ]);

    const nextChannelIds = new Set(
      nextConfigs.map((config) => config.channelId),
    );

    const leftConfigs = previousConfigs.filter(
      (config) => !nextChannelIds.has(config.channelId),
    );
    const keptConfigs = leftConfigs.filter((config) =>
      keepsMovedCard(config, notify),
    );
    const removedConfigIds = leftConfigs
      .filter((config) => !keepsMovedCard(config, notify))
      .map((config) => String(config._id));

    if (removedConfigIds.length) {
      await notifyDiscordRemoval(models, subdomain, [record], {
        configIds: removedConfigIds,
      });
    }

    if (!notify) {
      return;
    }

    const postedChannelIds: string[] = keptConfigs.length
      ? await models.DiscordMessage.distinct('channelId', {
          entityId,
          subdomain,
          channelId: { $in: keptConfigs.map((config) => config.channelId) },
          messageId: { $ne: '' },
        })
      : [];

    const job: TDiscordNotificationJob = {
      subdomain,
      event: 'taskMoved',
      entityId,
      teamId,
      actorId,
      move: { fromTeamId: previousTeamId, toTeamId: teamId },
    };

    await Promise.all([
      queueTeamJobs(
        keptConfigs
          .filter((config) => postedChannelIds.includes(config.channelId))
          .map((config) => String(config._id)),
        { ...job, teamId: previousTeamId },
      ),
      notifyDiscord(models, job),
    ]);
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
    const [teamConfigIds, customerThread] = await Promise.all([
      findSubscribedConfigIds(models, job, job.event),
      DISCORD_CUSTOMER_EVENTS.includes(job.event)
        ? hasCustomerThread(models, job)
        : false,
    ]);

    await queueTeamJobs(teamConfigIds, job);

    if (customerThread) {
      await sendWorkerQueue('operations', DISCORD_NOTIFY_QUEUE).add(
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

export const notifyDiscordPullRequestMerged = async (
  models: IModels,
  job: Omit<TDiscordPullRequestJob, 'type'>,
) => {
  try {
    const configIds = await findSubscribedConfigIds(
      models,
      job,
      'pullRequestMerged',
    );

    const queue = sendWorkerQueue('operations', DISCORD_NOTIFY_QUEUE);

    await Promise.all(
      configIds.map((configId) => {
        const data: TDiscordPullRequestJob = {
          ...job,
          type: 'pullRequestMerged',
          configId,
        };

        return queue.add(data.type, data, DISCORD_NOTIFY_JOB_OPTIONS);
      }),
    );
  } catch (error) {
    console.error(
      `Failed to queue the Discord pullRequestMerged notification: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
