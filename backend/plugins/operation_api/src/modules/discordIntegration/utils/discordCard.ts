import { ICompany, ICustomer, IUser } from 'erxes-api-shared/core-types';
import {
  getCustomerName,
  getEnv,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import {
  TDiscordActionRow,
  TDiscordEmbedField,
  TDiscordLinkButton,
  TDiscordMessagePayload,
} from '@/discordIntegration/@types/discordApi';
import {
  TDiscordCardEvent,
  TDiscordNotificationJob,
  TDiscordTaskMove,
} from '@/discordIntegration/@types/discordNotification';
import {
  DISCORD_CARD_COLORS,
  DISCORD_LIMITS,
} from '@/discordIntegration/constants';
import { TDiscordChannelMention } from '@/discordIntegration/@types/discordConfig';
import {
  buildAllowedMentions,
  disarmDiscordMentions,
} from '@/discordIntegration/utils/discordMention';
import { STATUS_TYPES } from '@/status/constants/types';
import { IModels } from '~/connectionResolvers';
import { blockNoteToPlainText } from '~/meta/import-export/blockNoteToPlainText';
import {
  PRIORITY_LABELS,
  STATUS_TYPE_LABELS,
} from '~/meta/import-export/utils';

type TDiscordCardRecord = {
  _id: unknown;
  name: string;
  number?: number;
  description?: string;
  teamId: unknown;
  priority?: number;
  createdBy?: string;
  githubIssueUrl?: string;
  githubIssueNumber?: number;
  githubRepoName?: string;
  customerId?: string | null;
  companyId?: string | null;
  discordSource?: { username?: string } | null;
};

type TDiscordCardTask = TDiscordCardRecord & {
  status?: string;
  statusType?: number;
  assigneeId?: string;
  targetDate?: Date | string | null;
};

type TDiscordCardTriage = TDiscordCardRecord & {
  status?: number;
};

export type TDiscordCardMention = {
  discordUserId?: string;
  linkAccountUrl?: string;
  channel?: TDiscordChannelMention;
};

export type TDiscordCardEntity =
  | { kind: 'task'; record: TDiscordCardTask }
  | { kind: 'triage'; record: TDiscordCardTriage };

type TDiscordCardUser = Pick<IUser, 'email' | 'username' | 'details'> & {
  _id: string;
};

type TDiscordCardState = keyof typeof DISCORD_CARD_COLORS;

type TDiscordMoveTeamNames = { from: string; to: string };

export const isMovedOutJob = (job: TDiscordNotificationJob) =>
  job.event === 'taskMoved' && job.move?.fromTeamId === job.teamId;

export const getEventAssigneeId = (
  entity: TDiscordCardEntity,
  job: TDiscordNotificationJob,
) =>
  job.assigneeId ??
  (entity.kind === 'task' ? entity.record.assigneeId : undefined);

export const truncateDiscordText = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

const isHttpUrl = (value: string) => /^https?:\/\//.test(value);

export const loadDiscordCardEntity = async (
  models: IModels,
  entityId: string,
): Promise<TDiscordCardEntity | null> => {
  const task = await models.Task.findOne({
    _id: entityId,
  }).lean<TDiscordCardTask>();

  if (task) {
    return { kind: 'task', record: task };
  }

  const triage = await models.Triage.findOne({
    _id: entityId,
  }).lean<TDiscordCardTriage>();

  return triage ? { kind: 'triage', record: triage } : null;
};

export const getUserNames = async (subdomain: string, userIds: string[]) => {
  const ids = [...new Set(userIds.filter(Boolean))];

  if (!ids.length) {
    return new Map<string, string>();
  }

  const users: TDiscordCardUser[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: { query: { _id: { $in: ids } } },
    defaultValue: [],
  });

  return new Map(
    users.map((user) => [
      String(user._id),
      user.details?.fullName || user.username || user.email || 'Unknown user',
    ]),
  );
};

const getContactNames = async (
  subdomain: string,
  record: TDiscordCardRecord,
) => {
  const [customer, company]: [ICustomer | null, ICompany | null] =
    await Promise.all([
      record.customerId
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'findOne',
            input: { _id: record.customerId },
            defaultValue: null,
          })
        : null,
      record.companyId
        ? sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'companies',
            action: 'findOne',
            input: { _id: record.companyId },
            defaultValue: null,
          })
        : null,
    ]);

  return {
    customerName: customer
      ? getCustomerName(customer)?.trim() || 'Unknown customer'
      : undefined,
    companyName: company
      ? company.primaryName || company.names?.[0] || 'Unknown company'
      : undefined,
  };
};

const getCardLink = (subdomain: string, entity: TDiscordCardEntity) => {
  const domain = getEnv({ name: 'DOMAIN', subdomain }).replace(/\/$/, '');

  if (!isHttpUrl(domain)) {
    return '';
  }

  const id = String(entity.record._id);

  return entity.kind === 'task'
    ? `${domain}/operation/tasks/${id}`
    : `${domain}/operation/team/${String(entity.record.teamId)}/triage/${id}`;
};

const EVENT_EMOJIS: Record<TDiscordCardEvent, string> = {
  triageCreated: '📥',
  triageAccepted: '✅',
  triageDeclined: '⛔',
  taskAssigned: '👤',
  taskCompleted: '🎉',
  taskMoved: '↪️',
  taskReopened: '🔄',
  taskCancelled: '🚫',
};

export const escapeDiscordMarkdown = (value: string) =>
  value.replace(/[\\*_`~|>[\]]/g, String.raw`\$&`);

export const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const getStatusType = (entity: TDiscordCardEntity) => {
  if (entity.kind === 'triage') {
    return entity.record.status === STATUS_TYPES.CANCELLED
      ? STATUS_TYPES.CANCELLED
      : STATUS_TYPES.TRIAGE;
  }

  return entity.record.statusType ?? STATUS_TYPES.BACKLOG;
};

const getCardState = (statusType: number): TDiscordCardState => {
  if (statusType === STATUS_TYPES.TRIAGE) {
    return 'triage';
  }

  if (statusType === STATUS_TYPES.COMPLETED) {
    return 'completed';
  }

  return statusType === STATUS_TYPES.CANCELLED ? 'cancelled' : 'open';
};

const getStatusName = async (
  models: IModels,
  entity: TDiscordCardEntity,
  statusType: number,
) => {
  if (entity.kind === 'triage') {
    return statusType === STATUS_TYPES.CANCELLED
      ? 'Declined'
      : STATUS_TYPE_LABELS[STATUS_TYPES.TRIAGE];
  }

  const status = entity.record.status
    ? await models.Status.findOne({ _id: entity.record.status })
        .select('name')
        .lean()
    : null;

  return capitalize(status?.name || STATUS_TYPE_LABELS[statusType] || '');
};

const formatDiscordDate = (value?: Date | string | null) => {
  const seconds = value
    ? Math.floor(new Date(value).getTime() / 1000)
    : Number.NaN;

  return Number.isFinite(seconds) ? `<t:${seconds}:D> · <t:${seconds}:R>` : '';
};

const describeActivity = ({
  job,
  kind,
  actorName,
  assigneeName,
  assigneeMention,
  teamNames,
  markdown,
}: {
  job: TDiscordNotificationJob;
  kind: TDiscordCardEntity['kind'];
  actorName: string;
  assigneeName?: string;
  assigneeMention?: string;
  teamNames?: TDiscordMoveTeamNames;
  markdown: boolean;
}) => {
  const strong = (value: string) =>
    markdown ? `**${escapeDiscordMarkdown(value)}**` : value;
  const actor = strong(actorName);

  switch (job.event) {
    case 'triageCreated':
      return `New triage from ${actor}`;
    case 'triageAccepted':
      return `${actor} accepted the triage as a task`;
    case 'triageDeclined':
      return `${actor} declined the triage`;
    case 'taskAssigned':
      return `${actor} assigned the task to ${
        markdown && assigneeMention
          ? `<@${assigneeMention}>`
          : strong(assigneeName || 'someone')
      }`;
    case 'taskCompleted':
      return `${actor} completed the task`;
    case 'taskMoved':
      return `${actor} moved the ${kind} from ${strong(
        teamNames?.from || 'another team',
      )} to ${strong(teamNames?.to || 'another team')}`;
    case 'taskReopened':
      return `${actor} reopened the ${kind}`;
    case 'taskCancelled':
      return `${actor} cancelled the task`;
  }
};

export const buildField = (
  name: string,
  value: string,
  inline = true,
): TDiscordEmbedField => ({
  name,
  value: truncateDiscordText(value, DISCORD_LIMITS.fieldValue),
  inline,
});

export const buildLinkRow = (
  links: { label: string; url?: string }[],
): TDiscordActionRow[] => {
  const buttons = links
    .filter(({ url }) => url && isHttpUrl(url))
    .map(({ label, url }): TDiscordLinkButton => ({
      type: 2,
      style: 5,
      label,
      url: url || '',
    }));

  return buttons.length ? [{ type: 1, components: buttons }] : [];
};

const getFallbackActorName = (record: TDiscordCardRecord) => {
  if (record.discordSource?.username) {
    return `@${record.discordSource.username} (Discord)`;
  }

  return record.githubIssueUrl ? 'GitHub' : 'erxes';
};

const buildCardReply = ({
  job,
  kind,
  actorName,
  assigneeName,
  teamNames,
  mention,
  reason,
}: {
  job: TDiscordNotificationJob;
  kind: TDiscordCardEntity['kind'];
  actorName: string;
  assigneeName?: string;
  teamNames?: TDiscordMoveTeamNames;
  mention: TDiscordCardMention;
  reason?: string;
}): TDiscordMessagePayload => {
  const disarm = (value: string) =>
    mention.channel ? disarmDiscordMentions(value) : value;
  const safeAssigneeName = assigneeName ? disarm(assigneeName) : undefined;
  const safeTeamNames = teamNames
    ? { from: disarm(teamNames.from), to: disarm(teamNames.to) }
    : undefined;

  return {
    content: truncateDiscordText(
      [
        `${mention.channel ? `@${mention.channel} ` : ''}${
          EVENT_EMOJIS[job.event]
        } ${describeActivity({
          job,
          kind,
          actorName: disarm(actorName),
          assigneeName: safeAssigneeName,
          assigneeMention: mention.discordUserId,
          teamNames: safeTeamNames,
          markdown: true,
        })}`,
        reason ? `> ${escapeDiscordMarkdown(disarm(reason))}` : '',
        mention.linkAccountUrl
          ? `-# ${escapeDiscordMarkdown(
              safeAssigneeName || 'The assignee',
            )} hasn't linked a Discord account yet, so they weren't mentioned.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      DISCORD_LIMITS.content,
    ),
    allowed_mentions: buildAllowedMentions({
      channel: mention.channel,
      userId: mention.discordUserId,
    }),
    ...(mention.linkAccountUrl
      ? {
          components: buildLinkRow([
            { label: 'Link Discord account', url: mention.linkAccountUrl },
          ]),
        }
      : {}),
  };
};

const buildCardFields = ({
  entity,
  state,
  statusName,
  assigneeName,
  contacts,
  reason,
  movedTo,
}: {
  entity: TDiscordCardEntity;
  state: TDiscordCardState;
  statusName: string;
  assigneeName?: string;
  contacts: Awaited<ReturnType<typeof getContactNames>>;
  reason?: string;
  movedTo?: string;
}) => {
  const priority = entity.record.priority ?? 0;
  const isTask = entity.kind === 'task';
  const due =
    isTask && state === 'open'
      ? formatDiscordDate(entity.record.targetDate)
      : '';

  const optional: [boolean, () => TDiscordEmbedField][] = [
    [
      Boolean(movedTo),
      () => buildField('Moved to', escapeDiscordMarkdown(movedTo ?? '')),
    ],
    [
      isTask && Boolean(assigneeName || state === 'open'),
      () =>
        buildField(
          'Assignee',
          assigneeName ? escapeDiscordMarkdown(assigneeName) : 'Unassigned',
        ),
    ],
    [Boolean(due), () => buildField('Due', due)],
    [
      Boolean(contacts.customerName),
      () =>
        buildField(
          'Customer',
          escapeDiscordMarkdown(contacts.customerName ?? ''),
        ),
    ],
    [
      Boolean(contacts.companyName),
      () =>
        buildField(
          'Company',
          escapeDiscordMarkdown(contacts.companyName ?? ''),
        ),
    ],
    [
      Boolean(reason),
      () =>
        buildField('Reason', `> ${escapeDiscordMarkdown(reason ?? '')}`, false),
    ],
  ];

  return [
    buildField('Status', statusName),
    buildField('Priority', PRIORITY_LABELS[priority] || PRIORITY_LABELS[0]),
    ...optional.filter(([include]) => include).map(([, build]) => build()),
  ];
};

const getMoveTeamNames = async (
  models: IModels,
  move?: TDiscordTaskMove,
): Promise<TDiscordMoveTeamNames | undefined> => {
  if (!move) {
    return undefined;
  }

  const teams = await models.Team.find({
    _id: { $in: [move.fromTeamId, move.toTeamId] },
  })
    .select('name')
    .lean();

  const names = new Map(teams.map((team) => [String(team._id), team.name]));

  return {
    from: names.get(move.fromTeamId) || 'Unknown team',
    to: names.get(move.toTeamId) || 'Unknown team',
  };
};

export const buildDiscordCard = async ({
  models,
  entity,
  job,
  mention = {},
}: {
  models: IModels;
  entity: TDiscordCardEntity;
  job: TDiscordNotificationJob;
  mention?: TDiscordCardMention;
}): Promise<{
  card: TDiscordMessagePayload;
  reply: TDiscordMessagePayload;
}> => {
  const { record } = entity;
  const assigneeId =
    entity.kind === 'task' ? entity.record.assigneeId : undefined;
  const eventAssigneeId = getEventAssigneeId(entity, job);
  const actorId = job.actorId || record.createdBy || '';
  const statusType = getStatusType(entity);
  const movedOut = isMovedOutJob(job);
  const state = movedOut ? 'moved' : getCardState(statusType);

  const [team, statusName, userNames, contacts, teamNames] = await Promise.all([
    models.Team.findOne({ _id: movedOut ? job.teamId : record.teamId })
      .select('name')
      .lean(),
    getStatusName(models, entity, statusType),
    getUserNames(job.subdomain, [
      actorId,
      assigneeId || '',
      eventAssigneeId || '',
    ]),
    getContactNames(job.subdomain, record),
    job.event === 'taskMoved'
      ? getMoveTeamNames(models, job.move)
      : Promise.resolve(undefined),
  ]);

  const actorName = userNames.get(actorId) || getFallbackActorName(record);
  const assigneeName = assigneeId ? userNames.get(assigneeId) : undefined;
  const eventAssigneeName = eventAssigneeId
    ? userNames.get(eventAssigneeId)
    : undefined;
  const reason = job.event === 'triageDeclined' ? job.reason?.trim() : '';
  const link = getCardLink(job.subdomain, entity);

  const reply = buildCardReply({
    job,
    kind: entity.kind,
    actorName,
    assigneeName: eventAssigneeName,
    teamNames,
    mention,
    reason,
  });

  const preview = truncateDiscordText(
    blockNoteToPlainText(record.description),
    DISCORD_LIMITS.descriptionPreview,
  );

  const fields = buildCardFields({
    entity,
    state,
    statusName,
    assigneeName,
    contacts,
    reason,
    movedTo: movedOut ? teamNames?.to : undefined,
  });

  const kindLabel = entity.kind === 'task' ? 'Task' : 'Triage';

  return {
    reply,
    card: {
      embeds: [
        {
          author: {
            name: truncateDiscordText(
              `${team?.name || 'Unknown team'} · erxes Operation`,
              DISCORD_LIMITS.title,
            ),
          },
          title: truncateDiscordText(
            `${kindLabel} #${record.number ?? 0} · ${record.name}`,
            DISCORD_LIMITS.title,
          ),
          ...(link ? { url: link } : {}),
          ...(preview ? { description: preview } : {}),
          color: DISCORD_CARD_COLORS[state],
          fields,
          footer: {
            text: truncateDiscordText(
              describeActivity({
                job,
                kind: entity.kind,
                actorName,
                assigneeName: eventAssigneeName,
                teamNames,
                markdown: false,
              }),
              DISCORD_LIMITS.footer,
            ),
          },
          timestamp: new Date().toISOString(),
        },
      ],
      components: buildLinkRow([
        { label: 'Open in erxes', url: link },
        {
          label: `GitHub #${record.githubIssueNumber ?? ''}`.trim(),
          url: record.githubIssueUrl,
        },
      ]),
    },
  };
};

export const buildDiscordTestMessage = (
  teamName: string,
  channelName: string,
): TDiscordMessagePayload => ({
  embeds: [
    {
      title: 'erxes Operation is connected',
      description: truncateDiscordText(
        `Triage and task updates for ${teamName} will be posted in #${channelName}.`,
        DISCORD_LIMITS.description,
      ),
      color: DISCORD_CARD_COLORS.open,
      timestamp: new Date().toISOString(),
    },
  ],
});
