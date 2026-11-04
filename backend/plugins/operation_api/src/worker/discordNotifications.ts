import { DelayedError, Job } from 'bullmq';
import { TDiscordMessagePayload } from '@/discordIntegration/@types/discordApi';
import { IDiscordConfigDocument } from '@/discordIntegration/@types/discordConfig';
import {
  TDiscordCleanupJob,
  TDiscordJob,
  TDiscordNotificationEvent,
  TDiscordNotificationJob,
  TDiscordPullRequestJob,
  TDiscordRemovedRecord,
} from '@/discordIntegration/@types/discordNotification';
import { IDiscordMessage } from '@/discordIntegration/@types/discordMessage';
import {
  DISCORD_ERROR_CODES,
  DISCORD_MEMBER_LINKING_ON,
} from '@/discordIntegration/constants';
import { getDiscordAccountPageUrl } from '@/discordIntegration/utils/discordAccountLink';
import { recordDiscordFailure } from '@/discordIntegration/utils/discordBot';
import {
  buildDiscordCustomerRemoval,
  buildDiscordCustomerUpdate,
} from '@/discordIntegration/utils/discordCustomerUpdate';
import {
  buildDiscordCard,
  isMovedOutJob,
  loadDiscordCardEntity,
  TDiscordCardEntity,
  TDiscordCardMention,
} from '@/discordIntegration/utils/discordCard';
import { getChannelMention } from '@/discordIntegration/utils/discordMention';
import { buildDiscordPullRequestMessage } from '@/discordIntegration/utils/discordPullRequest';
import { generateModels, IModels } from '~/connectionResolvers';
import { runSequentially } from '~/utils/runSequentially';
import {
  createDiscordMessage,
  DiscordApiError,
  deleteDiscordMessage,
  editDiscordMessage,
  getDiscordGuildMember,
  isRetryableDiscordError,
} from '~/utils/discordClient';

class DiscordCardBusyError extends Error {
  constructor() {
    super('Another worker is posting this Discord card');
    this.name = 'DiscordCardBusyError';
  }
}

type TCardDelivery = {
  models: IModels;
  token: string;
  config: Pick<IDiscordConfigDocument, '_id' | 'channelId'>;
  job: TDiscordNotificationJob;
  card: TDiscordMessagePayload;
  reply: TDiscordMessagePayload;
  replyToNewCard: boolean;
};

const sendReply = (delivery: TCardDelivery, messageId: string) =>
  createDiscordMessage(delivery.token, delivery.config.channelId, {
    ...delivery.reply,
    message_reference: { message_id: messageId, fail_if_not_exists: false },
  });

const resolveAssigneeMention = async ({
  models,
  subdomain,
  token,
  guildId,
  entity,
  job,
}: {
  models: IModels;
  subdomain: string;
  token: string;
  guildId: string;
  entity: TDiscordCardEntity;
  job: TDiscordNotificationJob;
}): Promise<TDiscordCardMention> => {
  const assigneeId =
    entity.kind === 'task' ? entity.record.assigneeId : undefined;

  if (job.event !== 'taskAssigned' || !assigneeId) {
    return {};
  }

  const link = await models.DiscordUserLink.findOne({
    userId: assigneeId,
    subdomain,
  }).lean();

  if (!link) {
    const linkingEnabled = await models.DiscordConnection.exists({
      subdomain,
      ...DISCORD_MEMBER_LINKING_ON,
    });

    return linkingEnabled
      ? { linkAccountUrl: getDiscordAccountPageUrl(subdomain) }
      : {};
  }

  const member = await getDiscordGuildMember(
    token,
    guildId,
    link.discordUserId,
  ).catch(() => null);

  return member ? { discordUserId: link.discordUserId } : {};
};

const postNewCard = async (delivery: TCardDelivery) => {
  const { models, token, config, job, card } = delivery;
  const key = {
    entityId: job.entityId,
    channelId: config.channelId,
    subdomain: job.subdomain,
  };

  const claim = await models.DiscordMessage.claimCard(key, {
    configId: String(config._id),
    lastEvent: job.event,
  });

  if (!claim) {
    throw new DiscordCardBusyError();
  }

  try {
    const message = await createDiscordMessage(token, config.channelId, card);

    await models.DiscordMessage.saveCardMessage(
      String(claim._id),
      message.id,
      job.event,
    );

    if (delivery.replyToNewCard) {
      await sendReply(delivery, message.id);
    }
  } catch (error) {
    await models.DiscordMessage.releaseCard(String(claim._id));
    throw error;
  }
};

const isMissingCardError = (error: unknown) =>
  error instanceof DiscordApiError &&
  (error.code === DISCORD_ERROR_CODES.UNKNOWN_MESSAGE ||
    error.code === DISCORD_ERROR_CODES.CANNOT_EDIT_OTHER_USER_MESSAGE);

const updateCard = async (
  delivery: TCardDelivery & {
    cardId: string;
    messageId: string;
  },
) => {
  const { models, token, config, job, card, cardId, messageId } = delivery;

  try {
    await editDiscordMessage(token, config.channelId, messageId, card);
  } catch (error) {
    if (isMissingCardError(error)) {
      await models.DiscordMessage.deleteOne({ _id: cardId });

      return postNewCard(delivery);
    }

    throw error;
  }

  await sendReply(delivery, messageId);

  await models.DiscordMessage.saveCardMessage(cardId, messageId, job.event);
};

const deliverDiscordCustomerUpdate = async (data: TDiscordNotificationJob) => {
  const { subdomain, entityId, event } = data;
  const models = await generateModels(subdomain);

  const thread = await models.DiscordMessage.findOne({
    entityId,
    subdomain,
    audience: 'customer',
  }).lean();

  if (!thread) {
    return 'skipped';
  }

  const customerChannel = await models.DiscordCustomerChannel.findOne({
    _id: thread.configId,
    subdomain,
  }).lean();

  if (!customerChannel) {
    return 'skipped';
  }

  const connection = await models.DiscordConnection.findWithToken({
    _id: customerChannel.connectionId,
    subdomain,
  });

  if (!connection || connection.health?.status === 'broken') {
    return 'skipped';
  }

  const entity = await loadDiscordCardEntity(models, entityId);

  if (
    !entity ||
    customerChannel.companyId !== String(entity.record.companyId ?? '')
  ) {
    return 'skipped';
  }

  const payload = await buildDiscordCustomerUpdate({
    entity,
    job: data,
    reporterId: thread.discordUserId,
  });

  try {
    await createDiscordMessage(connection.token, thread.channelId, {
      ...payload,
      ...(thread.messageId
        ? {
            message_reference: {
              message_id: thread.messageId,
              fail_if_not_exists: false,
            },
          }
        : {}),
    });
  } catch (error) {
    await recordDiscordFailure({
      models,
      error,
      connectionId: String(connection._id),
    });

    if (isRetryableDiscordError(error)) {
      throw error;
    }

    return 'failed';
  }

  await models.DiscordMessage.updateOne(
    { _id: thread._id },
    { $set: { lastEvent: event } },
  );

  return 'sent';
};

const isCleanupJob = (data: TDiscordJob): data is TDiscordCleanupJob =>
  'type' in data && data.type === 'cleanup';

const isPullRequestJob = (data: TDiscordJob): data is TDiscordPullRequestJob =>
  'type' in data && data.type === 'pullRequestMerged';

const findSubscribedConfig = (
  models: IModels,
  {
    configId,
    teamId,
    subdomain,
  }: { configId?: string; teamId: string; subdomain: string },
  event: TDiscordNotificationEvent,
) =>
  models.DiscordConfig.findOne({
    ...(configId ? { _id: configId } : {}),
    teamId,
    subdomain,
    isActive: true,
    events: event,
  }).lean();

const deliverDiscordPullRequest = async ({
  configId,
  subdomain,
  teamId,
  pullRequest,
}: TDiscordPullRequestJob) => {
  const models = await generateModels(subdomain);

  const config = await findSubscribedConfig(
    models,
    { configId, teamId, subdomain },
    'pullRequestMerged',
  );

  if (!config) {
    return 'skipped';
  }

  const connection = await models.DiscordConnection.findWithToken({
    _id: config.connectionId,
    subdomain,
  });

  if (!connection || connection.health?.status === 'broken') {
    return 'skipped';
  }

  const team = await models.Team.findOne({ _id: teamId }).select('name').lean();

  try {
    await createDiscordMessage(
      connection.token,
      config.channelId,
      buildDiscordPullRequestMessage({
        pullRequest,
        teamName: team?.name,
        mention: getChannelMention(config, 'pullRequestMerged'),
      }),
    );
  } catch (error) {
    await recordDiscordFailure({
      models,
      error,
      connectionId: String(connection._id),
      configId: String(config._id),
    });

    if (isRetryableDiscordError(error)) {
      throw error;
    }

    return 'failed';
  }

  await models.DiscordConfig.updateOne(
    { _id: config._id },
    { $set: { lastSentAt: new Date(), lastError: null } },
  );

  return 'sent';
};

const deliverDiscordMovedOut = async (data: TDiscordNotificationJob) => {
  const { configId, subdomain, entityId, teamId } = data;
  const models = await generateModels(subdomain);

  const config = await findSubscribedConfig(
    models,
    { configId, teamId, subdomain },
    'taskMoved',
  );

  if (!config) {
    return 'skipped';
  }

  const thread = await models.DiscordMessage.findCard({
    entityId,
    channelId: config.channelId,
    subdomain,
  });

  if (!thread?.messageId) {
    return 'skipped';
  }

  const connection = await models.DiscordConnection.findWithToken({
    _id: config.connectionId,
    subdomain,
  });

  if (!connection || connection.health?.status === 'broken') {
    return 'skipped';
  }

  const entity = await loadDiscordCardEntity(models, entityId);

  if (!entity || String(entity.record.teamId) === teamId) {
    return 'skipped';
  }

  const { card, reply } = await buildDiscordCard({
    models,
    entity,
    job: data,
    mention: { channel: getChannelMention(config, 'taskMoved') },
  });

  try {
    await editDiscordMessage(
      connection.token,
      config.channelId,
      thread.messageId,
      card,
    );
    await sendReply(
      {
        models,
        token: connection.token,
        config,
        job: data,
        card,
        reply,
        replyToNewCard: false,
      },
      thread.messageId,
    );
  } catch (error) {
    if (isMissingCardError(error)) {
      await models.DiscordMessage.deleteOne({ _id: thread._id });

      return 'skipped';
    }

    await recordDiscordFailure({
      models,
      error,
      connectionId: String(connection._id),
      configId: String(config._id),
    });

    if (isRetryableDiscordError(error)) {
      throw error;
    }

    return 'failed';
  }

  await models.DiscordMessage.deleteOne({ _id: thread._id });

  await models.DiscordConfig.updateOne(
    { _id: config._id },
    { $set: { lastSentAt: new Date(), lastError: null } },
  );

  return 'sent';
};

const findThreadConnection = async (
  models: IModels,
  subdomain: string,
  thread: { configId: string; audience?: string },
  companyId?: string | null,
) => {
  const owner =
    thread.audience === 'customer'
      ? await models.DiscordCustomerChannel.findOne({
          _id: thread.configId,
          subdomain,
        }).lean()
      : await models.DiscordConfig.findOne({
          _id: thread.configId,
          subdomain,
        }).lean();

  if (
    !owner ||
    ('companyId' in owner &&
      companyId !== undefined &&
      owner.companyId !== companyId)
  ) {
    return null;
  }

  const connection = await models.DiscordConnection.findWithToken({
    _id: owner.connectionId,
    subdomain,
  });

  return connection && connection.health?.status !== 'broken'
    ? connection
    : null;
};

type TCleanupThread = Pick<
  IDiscordMessage,
  | 'entityId'
  | 'configId'
  | 'channelId'
  | 'messageId'
  | 'audience'
  | 'discordUserId'
> & { _id: unknown };

const replyTo = (messageId?: string) =>
  messageId
    ? {
        message_reference: { message_id: messageId, fail_if_not_exists: false },
      }
    : {};

const removeThreadMessage = (
  token: string,
  thread: TCleanupThread,
  record: TDiscordRemovedRecord,
) => {
  if (thread.audience === 'customer') {
    return createDiscordMessage(token, thread.channelId, {
      ...buildDiscordCustomerRemoval({
        label: record.label,
        name: record.name,
        reporterId: thread.discordUserId,
      }),
      ...replyTo(thread.messageId),
    });
  }

  return thread.messageId
    ? deleteDiscordMessage(token, thread.channelId, thread.messageId)
    : Promise.resolve();
};

const cleanupThread = async (
  models: IModels,
  subdomain: string,
  thread: TCleanupThread,
  record: TDiscordRemovedRecord,
) => {
  const connection = await findThreadConnection(
    models,
    subdomain,
    thread,
    record.companyId,
  );

  if (connection) {
    try {
      await removeThreadMessage(connection.token, thread, record);
    } catch (error) {
      await recordDiscordFailure({
        models,
        error,
        connectionId: String(connection._id),
      });

      if (isRetryableDiscordError(error)) {
        throw error;
      }
    }
  }

  await models.DiscordMessage.deleteOne({ _id: thread._id });
};

const cleanupDiscordCards = async ({
  subdomain,
  records,
  configIds,
}: TDiscordCleanupJob) => {
  const models = await generateModels(subdomain);
  const recordsById = new Map(
    records.map((record) => [record.entityId, record]),
  );

  const threads = await models.DiscordMessage.find({
    entityId: { $in: [...recordsById.keys()] },
    subdomain,
    ...(configIds ? { configId: { $in: configIds } } : {}),
  }).lean();

  await runSequentially(threads, (thread) => {
    const record = recordsById.get(thread.entityId);

    return record
      ? cleanupThread(models, subdomain, thread, record)
      : Promise.resolve();
  });

  return 'cleaned';
};

const getRateLimitDelayMs = (error: unknown) =>
  error instanceof DiscordApiError && error.status === 429
    ? error.retryAfterMs
    : undefined;

const processDiscordJob = async (data: TDiscordJob) => {
  if (isCleanupJob(data)) {
    return cleanupDiscordCards(data);
  }

  if (isPullRequestJob(data)) {
    return deliverDiscordPullRequest(data);
  }

  if (data.target === 'customer') {
    return deliverDiscordCustomerUpdate(data);
  }

  if (isMovedOutJob(data)) {
    return deliverDiscordMovedOut(data);
  }

  const { configId, subdomain, event, entityId, teamId } = data;
  const models = await generateModels(subdomain);

  const config = await findSubscribedConfig(
    models,
    { configId, teamId, subdomain },
    event,
  );

  if (!config) {
    return 'skipped';
  }

  const connection = await models.DiscordConnection.findWithToken({
    _id: config.connectionId,
    subdomain,
  });

  if (!connection || connection.health?.status === 'broken') {
    return 'skipped';
  }

  const entity = await loadDiscordCardEntity(models, entityId);

  if (
    !entity ||
    (event === 'taskMoved' && String(entity.record.teamId) !== teamId)
  ) {
    return 'skipped';
  }

  const assigneeMention = await resolveAssigneeMention({
    models,
    subdomain,
    token: connection.token,
    guildId: connection.guildId,
    entity,
    job: data,
  });

  const mention: TDiscordCardMention = {
    ...assigneeMention,
    channel: getChannelMention(config, event),
  };

  const { card, reply } = await buildDiscordCard({
    models,
    entity,
    job: data,
    mention,
  });

  const delivery: TCardDelivery = {
    models,
    token: connection.token,
    config,
    job: data,
    card,
    reply,
    replyToNewCard: Boolean(
      mention.discordUserId || mention.linkAccountUrl || mention.channel,
    ),
  };

  try {
    const existing = await models.DiscordMessage.findCard({
      entityId,
      channelId: config.channelId,
      subdomain,
    });

    if (existing?.messageId) {
      await updateCard({
        ...delivery,
        cardId: String(existing._id),
        messageId: existing.messageId,
      });
    } else {
      await postNewCard(delivery);
    }
  } catch (error) {
    if (!(error instanceof DiscordCardBusyError)) {
      await recordDiscordFailure({
        models,
        error,
        connectionId: String(connection._id),
        configId: String(config._id),
      });
    }

    if (isRetryableDiscordError(error)) {
      throw error;
    }

    return 'failed';
  }

  await models.DiscordConfig.updateOne(
    { _id: config._id },
    { $set: { lastSentAt: new Date(), lastError: null } },
  );

  return 'sent';
};

export const deliverDiscordNotification = async (
  job: Job<TDiscordJob>,
  token?: string,
) => {
  try {
    return await processDiscordJob(job.data);
  } catch (error) {
    const delayMs = getRateLimitDelayMs(error);

    if (delayMs === undefined || !token) {
      throw error;
    }

    await job.moveToDelayed(Date.now() + delayMs, token);

    throw new DelayedError();
  }
};
