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
  TDiscordNotificationEvent,
  TDiscordNotificationJob,
} from '@/discordIntegration/@types/discordNotification';
import {
  DISCORD_CARD_COLORS,
  DISCORD_LIMITS,
} from '@/discordIntegration/constants';
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
};

export type TDiscordCardEntity =
  | { kind: 'task'; record: TDiscordCardTask }
  | { kind: 'triage'; record: TDiscordCardTriage };

type TDiscordCardUser = Pick<IUser, 'email' | 'username' | 'details'> & {
  _id: string;
};

type TDiscordCardState = keyof typeof DISCORD_CARD_COLORS;

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

const EVENT_EMOJIS: Record<TDiscordNotificationEvent, string> = {
  triageCreated: '📥',
  triageAccepted: '✅',
  triageDeclined: '⛔',
  taskAssigned: '👤',
  taskCompleted: '🎉',
};

export const escapeDiscordMarkdown = (value: string) =>
  value.replace(/[\\*_`~|>[\]]/g, '\\$&');

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
  const seconds = value ? Math.floor(new Date(value).getTime() / 1000) : NaN;

  return Number.isFinite(seconds) ? `<t:${seconds}:D> · <t:${seconds}:R>` : '';
};

const describeActivity = ({
  job,
  actorName,
  assigneeName,
  assigneeMention,
  markdown,
}: {
  job: TDiscordNotificationJob;
  actorName: string;
  assigneeName?: string;
  assigneeMention?: string;
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
  }
};

const buildField = (
  name: string,
  value: string,
  inline = true,
): TDiscordEmbedField => ({
  name,
  value: truncateDiscordText(value, DISCORD_LIMITS.fieldValue),
  inline,
});

const buildLinkRow = (
  links: { label: string; url?: string }[],
): TDiscordActionRow[] => {
  const buttons = links
    .filter(({ url }) => url && isHttpUrl(url))
    .map(
      ({ label, url }): TDiscordLinkButton => ({
        type: 2,
        style: 5,
        label,
        url: url || '',
      }),
    );

  return buttons.length ? [{ type: 1, components: buttons }] : [];
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
  const actorId = job.actorId || record.createdBy || '';
  const statusType = getStatusType(entity);
  const state = getCardState(statusType);

  const [team, statusName, userNames, contacts] = await Promise.all([
    models.Team.findOne({ _id: record.teamId }).select('name').lean(),
    getStatusName(models, entity, statusType),
    getUserNames(job.subdomain, [actorId, assigneeId || '']),
    getContactNames(job.subdomain, record),
  ]);

  const actorName =
    userNames.get(actorId) ||
    (record.discordSource?.username
      ? `@${record.discordSource.username} (Discord)`
      : record.githubIssueUrl
      ? 'GitHub'
      : 'erxes');
  const assigneeName = assigneeId ? userNames.get(assigneeId) : undefined;
  const reason = job.event === 'triageDeclined' ? job.reason?.trim() : '';
  const priority = record.priority ?? 0;
  const link = getCardLink(job.subdomain, entity);

  const reply: TDiscordMessagePayload = {
    content: truncateDiscordText(
      [
        `${EVENT_EMOJIS[job.event]} ${describeActivity({
          job,
          actorName,
          assigneeName,
          assigneeMention: mention.discordUserId,
          markdown: true,
        })}`,
        reason ? `> ${escapeDiscordMarkdown(reason)}` : '',
        mention.linkAccountUrl
          ? `-# ${escapeDiscordMarkdown(
              assigneeName || 'The assignee',
            )} hasn't linked a Discord account yet, so they weren't mentioned.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      DISCORD_LIMITS.content,
    ),
    allowed_mentions: mention.discordUserId
      ? { users: [mention.discordUserId] }
      : { parse: [] },
    ...(mention.linkAccountUrl
      ? {
          components: buildLinkRow([
            { label: 'Link Discord account', url: mention.linkAccountUrl },
          ]),
        }
      : {}),
  };

  const preview = truncateDiscordText(
    blockNoteToPlainText(record.description),
    DISCORD_LIMITS.descriptionPreview,
  );

  const fields: TDiscordEmbedField[] = [
    buildField('Status', statusName),
    buildField('Priority', PRIORITY_LABELS[priority] || PRIORITY_LABELS[0]),
  ];

  if (entity.kind === 'task' && (assigneeName || state === 'open')) {
    fields.push(
      buildField(
        'Assignee',
        assigneeName ? escapeDiscordMarkdown(assigneeName) : 'Unassigned',
      ),
    );
  }

  const due =
    entity.kind === 'task' && state === 'open'
      ? formatDiscordDate(entity.record.targetDate)
      : '';

  if (due) {
    fields.push(buildField('Due', due));
  }

  if (contacts.customerName) {
    fields.push(
      buildField('Customer', escapeDiscordMarkdown(contacts.customerName)),
    );
  }

  if (contacts.companyName) {
    fields.push(
      buildField('Company', escapeDiscordMarkdown(contacts.companyName)),
    );
  }

  if (reason) {
    fields.push(
      buildField('Reason', `> ${escapeDiscordMarkdown(reason)}`, false),
    );
  }

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
                actorName,
                assigneeName,
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
