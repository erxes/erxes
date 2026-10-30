import { Job } from 'bullmq';
import { TDiscordMessagePayload } from '@/discordIntegration/@types/discordApi';
import { IDiscordConfigDocument } from '@/discordIntegration/@types/discordConfig';
import {
  TDiscordCleanupJob,
  TDiscordNotificationJob,
} from '@/discordIntegration/@types/discordNotification';
import { DISCORD_ERROR_CODES } from '@/discordIntegration/constants';
import { getDiscordAccountPageUrl } from '@/discordIntegration/utils/discordAccountLink';
import { recordDiscordFailure } from '@/discordIntegration/utils/discordBot';
import {
  buildDiscordCustomerRemoval,
  buildDiscordCustomerUpdate,
} from '@/discordIntegration/utils/discordCustomerUpdate';
import {
  buildDiscordCard,
  loadDiscordCardEntity,
  TDiscordCardEntity,
  TDiscordCardMention,
} from '@/discordIntegration/utils/discordCard';
import { generateModels, IModels } from '~/connectionResolvers';
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
      hasClientSecret: true,
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
    if (
      error instanceof DiscordApiError &&
      (error.code === DISCORD_ERROR_CODES.UNKNOWN_MESSAGE ||
        error.code === DISCORD_ERROR_CODES.CANNOT_EDIT_OTHER_USER_MESSAGE)
    ) {
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

  const connection = await models.DiscordConnection.findWithSecrets({
    _id: customerChannel.connectionId,
    subdomain,
  });

  if (!connection || connection.health?.status === 'broken') {
    return 'skipped';
  }

  const entity = await loadDiscordCardEntity(models, entityId);

  if (!entity) {
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

const isCleanupJob = (
  data: TDiscordNotificationJob | TDiscordCleanupJob,
): data is TDiscordCleanupJob => 'type' in data && data.type === 'cleanup';

const findThreadConnection = async (
  models: IModels,
  subdomain: string,
  thread: { configId: string; audience?: string },
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

  if (!owner) {
    return null;
  }

  const connection = await models.DiscordConnection.findWithSecrets({
    _id: owner.connectionId,
    subdomain,
  });

  return connection && connection.health?.status !== 'broken'
    ? connection
    : null;
};

const cleanupDiscordCards = async ({
  subdomain,
  records,
  configIds,
}: TDiscordCleanupJob) => {
  const models = await generateModels(subdomain);

  for (const record of records) {
    const threads = await models.DiscordMessage.find({
      entityId: record.entityId,
      subdomain,
      ...(configIds ? { configId: { $in: configIds } } : {}),
    }).lean();

    for (const thread of threads) {
      const connection = await findThreadConnection(models, subdomain, thread);

      if (connection) {
        try {
          if (thread.audience === 'customer') {
            await createDiscordMessage(connection.token, thread.channelId, {
              ...buildDiscordCustomerRemoval({
                label: record.label,
                name: record.name,
                reporterId: thread.discordUserId,
              }),
              ...(thread.messageId
                ? {
                    message_reference: {
                      message_id: thread.messageId,
                      fail_if_not_exists: false,
                    },
                  }
                : {}),
            });
          } else if (thread.messageId) {
            await deleteDiscordMessage(
              connection.token,
              thread.channelId,
              thread.messageId,
            );
          }
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
    }
  }

  return 'cleaned';
};

export const deliverDiscordNotification = async (
  job: Job<TDiscordNotificationJob | TDiscordCleanupJob>,
) => {
  const data = job.data;

  if (isCleanupJob(data)) {
    return cleanupDiscordCards(data);
  }

  if (data.target === 'customer') {
    return deliverDiscordCustomerUpdate(data);
  }

  const { subdomain, event, entityId, teamId } = data;
  const models = await generateModels(subdomain);

  const config = await models.DiscordConfig.findOne({
    teamId,
    subdomain,
    isActive: true,
    events: event,
  }).lean();

  if (!config) {
    return 'skipped';
  }

  const connection = await models.DiscordConnection.findWithSecrets({
    _id: config.connectionId,
    subdomain,
  });

  if (!connection || connection.health?.status === 'broken') {
    return 'skipped';
  }

  const entity = await loadDiscordCardEntity(models, entityId);

  if (!entity) {
    return 'skipped';
  }

  const mention = await resolveAssigneeMention({
    models,
    subdomain,
    token: connection.token,
    guildId: connection.guildId,
    entity,
    job: data,
  });

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
    replyToNewCard: Boolean(mention.discordUserId || mention.linkAccountUrl),
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
