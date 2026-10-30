import { Request, Response } from 'express';
import { getSubdomain, redis } from 'erxes-api-shared/utils';
import { TDiscordMessagePayload } from '@/discordIntegration/@types/discordApi';
import { IDiscordCustomerChannelDocument } from '@/discordIntegration/@types/discordCustomerChannel';
import {
  TDiscordInteraction,
  TDiscordInteractionOption,
  TDiscordInteractionResponse,
  TDiscordModalComponent,
} from '@/discordIntegration/@types/discordInteraction';
import {
  DISCORD_EPHEMERAL_FLAG,
  DISCORD_INTERACTION_EDIT_RETRY,
  DISCORD_INTERACTION_ERROR_MESSAGE,
  DISCORD_INTERACTION_TYPES,
  DISCORD_RESPONSE_TYPES,
  DISCORD_TRIAGE_INPUT_LIMITS,
  DISCORD_TRIAGE_MODAL_ID,
  DISCORD_TRIAGE_PRIORITY_OPTIONS,
  DISCORD_TRIAGE_PRIORITY_RANGE,
  DISCORD_TRIAGE_RATE_LIMIT,
} from '@/discordIntegration/constants';
import { escapeDiscordMarkdown } from '@/discordIntegration/utils/discordCard';
import { syncDiscordCommands } from '@/discordIntegration/utils/discordCommands';
import {
  buildCompanyTasksMessage,
  parseTasksButtonId,
} from '@/discordIntegration/utils/discordCompanyTasks';
import { verifyDiscordRequest } from '@/discordIntegration/utils/discordSignature';
import { isSaasVersion } from '@/discordIntegration/utils/discordAccountLink';
import { STATUS_TYPES } from '@/status/constants/types';
import { generateModels, IModels } from '~/connectionResolvers';
import { PRIORITY_LABELS } from '~/meta/import-export/utils';
import {
  DiscordApiError,
  describeDiscordError,
  editDiscordInteractionResponse,
} from '~/utils/discordClient';

type TRawBodyRequest = Request & { rawBody?: Buffer | string };

type TDeferredAnswer = {
  payload: TDiscordMessagePayload;
  onSent?: (messageId: string) => Promise<void>;
};

type TInteractionContext = {
  models: IModels;
  subdomain: string;
  interaction: TDiscordInteraction;
  customerChannel: IDiscordCustomerChannelDocument;
};

const NOT_LINKED_MESSAGE =
  'This channel is not linked to a company in erxes yet. Ask the team to link it.';

const getRawBody = (req: TRawBodyRequest) => {
  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody;
  }

  return Buffer.from(typeof req.rawBody === 'string' ? req.rawBody : '');
};

const ephemeral = (content: string): TDiscordInteractionResponse => ({
  type: DISCORD_RESPONSE_TYPES.CHANNEL_MESSAGE,
  data: {
    content,
    flags: DISCORD_EPHEMERAL_FLAG,
    allowed_mentions: { parse: [] },
  },
});

const findSigningConnection = async (
  hostSubdomain: string,
  applicationId: string,
) => {
  const models = await generateModels(hostSubdomain);
  const query = { applicationId, publicKey: { $nin: [null, ''] } };

  const hostConnection = await models.DiscordConnection.findOne({
    ...query,
    subdomain: hostSubdomain,
  }).lean();

  if (hostConnection || isSaasVersion()) {
    return { models, subdomain: hostSubdomain, connection: hostConnection };
  }

  const connection = await models.DiscordConnection.findOne(query).lean();

  return {
    models,
    subdomain: connection?.subdomain ?? hostSubdomain,
    connection,
  };
};

const getInteractionUser = (interaction: TDiscordInteraction) =>
  interaction.member?.user ?? interaction.user;

const findSubcommand = (options?: TDiscordInteractionOption[]) =>
  options?.find((option) => option.type === 1);

const getModalValue = (
  components: TDiscordModalComponent[] | undefined,
  customId: string,
): string => {
  for (const component of components ?? []) {
    if (component.custom_id === customId) {
      return component.value ?? component.values?.[0] ?? '';
    }

    const nested = getModalValue(
      [
        ...(component.component ? [component.component] : []),
        ...(component.components ?? []),
      ],
      customId,
    );

    if (nested) {
      return nested;
    }
  }

  return '';
};

const editOriginalResponse = async (
  interaction: TDiscordInteraction,
  payload: TDiscordMessagePayload,
  attempt = 1,
): Promise<{ id: string }> => {
  try {
    return await editDiscordInteractionResponse({
      applicationId: interaction.application_id,
      interactionToken: interaction.token,
      payload,
    });
  } catch (error) {
    if (
      !(error instanceof DiscordApiError) ||
      error.status !== 404 ||
      attempt >= DISCORD_INTERACTION_EDIT_RETRY.attempts
    ) {
      throw error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, DISCORD_INTERACTION_EDIT_RETRY.delayMs * attempt),
    );

    return editOriginalResponse(interaction, payload, attempt + 1);
  }
};

const respondLater = (
  interaction: TDiscordInteraction,
  work: () => Promise<TDeferredAnswer>,
) => {
  void (async () => {
    let answer: TDeferredAnswer;

    try {
      answer = await work();
    } catch (error) {
      console.error(
        `Failed to handle the Discord interaction: ${describeDiscordError(
          error,
        )}`,
      );
      answer = { payload: { content: DISCORD_INTERACTION_ERROR_MESSAGE } };
    }

    let messageId = '';

    try {
      const message = await editOriginalResponse(interaction, answer.payload);

      messageId = message.id;
    } catch (error) {
      console.error(
        `Failed to answer the Discord interaction: ${describeDiscordError(
          error,
        )}`,
      );
    }

    try {
      await answer.onSent?.(messageId);
    } catch (error) {
      console.error(
        `Failed to remember the Discord answer: ${describeDiscordError(error)}`,
      );
    }
  })();
};

const isRateLimited = async (subdomain: string, discordUserId: string) => {
  const key = `${DISCORD_TRIAGE_RATE_LIMIT.keyPrefix}${subdomain}:${discordUserId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, DISCORD_TRIAGE_RATE_LIMIT.windowSeconds);
  }

  return count > DISCORD_TRIAGE_RATE_LIMIT.max;
};

const toTriagePriority = (value: unknown) => {
  const priority = Number(value);

  return Number.isInteger(priority) &&
    priority >= DISCORD_TRIAGE_PRIORITY_RANGE.min &&
    priority <= DISCORD_TRIAGE_PRIORITY_RANGE.max
    ? priority
    : DISCORD_TRIAGE_PRIORITY_RANGE.min;
};

const TRIAGE_MODAL: TDiscordInteractionResponse = {
  type: DISCORD_RESPONSE_TYPES.MODAL,
  data: {
    custom_id: DISCORD_TRIAGE_MODAL_ID,
    title: 'New triage',
    components: [
      {
        type: 18,
        label: 'Title',
        component: {
          type: 4,
          custom_id: 'title',
          style: 1,
          required: true,
          max_length: DISCORD_TRIAGE_INPUT_LIMITS.title,
          placeholder: 'What went wrong?',
        },
      },
      {
        type: 18,
        label: 'Details',
        component: {
          type: 4,
          custom_id: 'description',
          style: 2,
          required: false,
          max_length: DISCORD_TRIAGE_INPUT_LIMITS.description,
          placeholder: 'Steps to reproduce, what you expected, links…',
        },
      },
      {
        type: 18,
        label: 'Priority',
        description: 'How urgent is it?',
        component: {
          type: 3,
          custom_id: 'priority',
          placeholder: 'No priority',
          required: false,
          min_values: 0,
          max_values: 1,
          options: DISCORD_TRIAGE_PRIORITY_OPTIONS,
        },
      },
    ],
  },
};

const createTriageFromDiscord = async ({
  models,
  subdomain,
  interaction,
  customerChannel,
  title,
  description,
  priority,
}: TInteractionContext & {
  title: string;
  description: string;
  priority: number;
}): Promise<TDeferredAnswer> => {
  const discordUser = getInteractionUser(interaction);

  if (!discordUser) {
    throw new Error('Discord did not send the user who reported this');
  }

  const link = await models.DiscordUserLink.findOne({
    discordUserId: discordUser.id,
    subdomain,
  }).lean();

  const triage = await models.Triage.createTriage({
    triage: {
      name: title,
      description,
      teamId: String(customerChannel.teamId),
      createdBy: link?.userId ?? 'system',
      type: 'triage',
      number: 0,
      priority,
      status: STATUS_TYPES.TRIAGE,
      companyId: customerChannel.companyId,
      customerId: null,
      tagIds: [],
      discordSource: {
        userId: discordUser.id,
        username: discordUser.username,
        displayName: discordUser.global_name ?? null,
        channelId: interaction.channel_id ?? customerChannel.channelId,
        guildId: interaction.guild_id ?? customerChannel.guildId,
      },
    },
    subdomain,
  });

  const reporter = discordUser.global_name || discordUser.username;

  return {
    payload: {
      content: `📥 **${escapeDiscordMarkdown(
        reporter,
      )}** reported **${escapeDiscordMarkdown(title)}**${
        priority ? ` · ${PRIORITY_LABELS[priority]} priority` : ''
      }\n-# Updates on this report will be posted here.`,
    },
    onSent: async (messageId) => {
      await models.DiscordMessage.findOneAndUpdate(
        {
          entityId: String(triage._id),
          channelId: interaction.channel_id ?? customerChannel.channelId,
          subdomain,
        },
        {
          $set: {
            configId: String(customerChannel._id),
            audience: 'customer',
            discordUserId: discordUser.id,
            ...(messageId ? { messageId } : {}),
          },
          $setOnInsert: {
            lastEvent: 'triageCreated',
            ...(messageId ? {} : { messageId: '' }),
          },
        },
        { upsert: true },
      );
    },
  };
};

const handleCommand = (
  context: TInteractionContext,
): TDiscordInteractionResponse => {
  const { interaction } = context;
  const command = interaction.data?.name;

  const subcommand = findSubcommand(interaction.data?.options);

  if (command === 'triage' && subcommand?.name === 'new') {
    return TRIAGE_MODAL;
  }

  if (command === 'tasks') {
    respondLater(interaction, async () => ({
      payload: await buildCompanyTasksMessage({
        ...context,
        filter: 'open',
        page: 0,
      }),
    }));

    return {
      type: DISCORD_RESPONSE_TYPES.DEFERRED_CHANNEL_MESSAGE,
      data: { flags: DISCORD_EPHEMERAL_FLAG },
    };
  }

  return ephemeral('This command is not supported.');
};

const handleModalSubmit = async (
  context: TInteractionContext,
): Promise<TDiscordInteractionResponse> => {
  const { interaction, subdomain } = context;

  if (interaction.data?.custom_id !== DISCORD_TRIAGE_MODAL_ID) {
    return ephemeral('This form is not supported.');
  }

  const discordUser = getInteractionUser(interaction);
  const components = interaction.data?.components;
  const priority = toTriagePriority(getModalValue(components, 'priority'));
  const title = getModalValue(components, 'title')
    .trim()
    .slice(0, DISCORD_TRIAGE_INPUT_LIMITS.title);
  const description = getModalValue(components, 'description')
    .trim()
    .slice(0, DISCORD_TRIAGE_INPUT_LIMITS.description);

  if (!discordUser) {
    return ephemeral('Run this command from your company channel.');
  }

  if (!title) {
    return ephemeral('Give the triage a title.');
  }

  if (await isRateLimited(subdomain, discordUser.id)) {
    return ephemeral(
      'You have reported many triages in the last hour. Try again later.',
    );
  }

  respondLater(interaction, () =>
    createTriageFromDiscord({
      ...context,
      title,
      description,
      priority,
    }),
  );

  return { type: DISCORD_RESPONSE_TYPES.DEFERRED_CHANNEL_MESSAGE };
};

const handleComponent = (
  context: TInteractionContext,
): TDiscordInteractionResponse => {
  const target = parseTasksButtonId(context.interaction.data?.custom_id ?? '');

  if (!target) {
    return ephemeral('This button is not supported.');
  }

  respondLater(context.interaction, async () => ({
    payload: await buildCompanyTasksMessage({ ...context, ...target }),
  }));

  return { type: DISCORD_RESPONSE_TYPES.DEFERRED_UPDATE_MESSAGE };
};

const dispatchInteraction = async (
  context: TInteractionContext,
): Promise<TDiscordInteractionResponse> => {
  switch (context.interaction.type) {
    case DISCORD_INTERACTION_TYPES.APPLICATION_COMMAND:
      return handleCommand(context);
    case DISCORD_INTERACTION_TYPES.MODAL_SUBMIT:
      return handleModalSubmit(context);
    case DISCORD_INTERACTION_TYPES.MESSAGE_COMPONENT:
      return handleComponent(context);
    default:
      return ephemeral('This action is not supported.');
  }
};

export const handleDiscordInteraction = async (
  req: TRawBodyRequest,
  res: Response,
) => {
  const interaction: TDiscordInteraction = req.body;

  if (!interaction?.application_id) {
    res.status(400).send('Bad request');
    return;
  }

  try {
    const {
      models,
      subdomain,
      connection: signingConnection,
    } = await findSigningConnection(
      getSubdomain(req),
      interaction.application_id,
    );

    const isVerified = verifyDiscordRequest({
      publicKey: signingConnection?.publicKey,
      signature: req.headers['x-signature-ed25519'],
      timestamp: req.headers['x-signature-timestamp'],
      rawBody: getRawBody(req),
    });

    if (!isVerified) {
      res.status(401).send('Invalid request signature');
      return;
    }

    if (interaction.type === DISCORD_INTERACTION_TYPES.PING) {
      res.json({ type: DISCORD_RESPONSE_TYPES.PONG });
      return;
    }

    const connection = interaction.guild_id
      ? await models.DiscordConnection.findOne({
          subdomain,
          applicationId: interaction.application_id,
          guildId: interaction.guild_id,
        }).lean()
      : null;

    if (!connection) {
      res.json(
        ephemeral('Use this command in your company channel on Discord.'),
      );
      return;
    }

    syncDiscordCommands({ models, subdomain, connection }).catch((error) =>
      console.error(
        `Failed to update the Discord slash commands: ${describeDiscordError(
          error,
        )}`,
      ),
    );

    const customerChannel = await models.DiscordCustomerChannel.findForChannel(
      subdomain,
      [interaction.channel_id ?? '', interaction.channel?.parent_id ?? ''],
    );

    if (
      !customerChannel ||
      customerChannel.connectionId !== String(connection._id)
    ) {
      res.json(ephemeral(NOT_LINKED_MESSAGE));
      return;
    }

    res.json(
      await dispatchInteraction({
        models,
        subdomain,
        interaction,
        customerChannel,
      }),
    );
  } catch (error) {
    console.error(
      `Failed to handle the Discord interaction: ${describeDiscordError(
        error,
      )}`,
    );

    if (!res.headersSent) {
      res.json(ephemeral(DISCORD_INTERACTION_ERROR_MESSAGE));
    }
  }
};
