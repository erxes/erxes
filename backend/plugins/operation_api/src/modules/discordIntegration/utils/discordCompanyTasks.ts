import { ICompany } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  TDiscordButton,
  TDiscordMessagePayload,
} from '@/discordIntegration/@types/discordApi';
import { IDiscordCustomerChannel } from '@/discordIntegration/@types/discordCustomerChannel';
import { TDiscordTasksFilter } from '@/discordIntegration/@types/discordInteraction';
import {
  DISCORD_CARD_COLORS,
  DISCORD_LIMITS,
  DISCORD_TASKS_BUTTON_PREFIX,
  DISCORD_TASKS_FETCH_LIMIT,
  DISCORD_TASKS_PAGE_SIZE,
} from '@/discordIntegration/constants';
import {
  capitalize,
  escapeDiscordMarkdown,
  truncateDiscordText,
} from '@/discordIntegration/utils/discordCard';
import { STATUS_TYPES } from '@/status/constants/types';
import { IModels } from '~/connectionResolvers';

type TCompanyTask = {
  _id: unknown;
  number?: number;
  name: string;
  status?: string;
  statusType?: number;
  targetDate?: Date | string | null;
  updatedAt: Date;
};

type TCompanyTriage = {
  _id: unknown;
  number?: number;
  name: string;
  status?: number;
  updatedAt: Date;
};

type TWorkItem = {
  label: string;
  name: string;
  status: string;
  due: string;
  updatedAt: Date;
};

const NAME_PREVIEW_LENGTH = 80;

const CLOSED_STATUS_TYPES = [STATUS_TYPES.COMPLETED, STATUS_TYPES.CANCELLED];

const formatDue = (value?: Date | string | null) => {
  const seconds = value ? Math.floor(new Date(value).getTime() / 1000) : NaN;

  return Number.isFinite(seconds) ? ` · due <t:${seconds}:R>` : '';
};

const formatItem = (item: TWorkItem) =>
  `\`${item.label}\` ${escapeDiscordMarkdown(
    truncateDiscordText(item.name, NAME_PREVIEW_LENGTH),
  )} — ${item.status}${item.due}`;

export const buildTasksButtonId = (
  action: 'filter' | 'previous' | 'next',
  filter: TDiscordTasksFilter,
  page: number,
) => `${DISCORD_TASKS_BUTTON_PREFIX}:${action}:${filter}:${page}`;

export const parseTasksButtonId = (customId: string) => {
  const prefix = `${DISCORD_TASKS_BUTTON_PREFIX}:`;

  if (!customId.startsWith(prefix)) {
    return null;
  }

  const [, filter, page] = customId.slice(prefix.length).split(':');
  const nextFilter: TDiscordTasksFilter = filter === 'all' ? 'all' : 'open';

  return {
    filter: nextFilter,
    page: Math.max(Number(page) || 0, 0),
  };
};

const button = ({
  label,
  customId,
  active = false,
  disabled = false,
}: {
  label: string;
  customId: string;
  active?: boolean;
  disabled?: boolean;
}): TDiscordButton => ({
  type: 2,
  style: active ? 1 : 2,
  label,
  custom_id: customId,
  disabled: active || disabled,
});

export const buildCompanyTasksMessage = async ({
  models,
  subdomain,
  customerChannel,
  filter,
  page,
}: {
  models: IModels;
  subdomain: string;
  customerChannel: IDiscordCustomerChannel;
  filter: TDiscordTasksFilter;
  page: number;
}): Promise<TDiscordMessagePayload> => {
  const { companyId } = customerChannel;
  const isOpen = filter === 'open';

  const company: ICompany | null = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'companies',
    action: 'findOne',
    input: { _id: companyId },
    defaultValue: null,
  });

  const [tasks, triages] = await Promise.all([
    models.Task.find(
      isOpen
        ? { companyId, statusType: { $nin: CLOSED_STATUS_TYPES } }
        : { companyId },
    )
      .sort({ updatedAt: -1 })
      .limit(DISCORD_TASKS_FETCH_LIMIT)
      .select('number name status statusType targetDate updatedAt')
      .lean<TCompanyTask[]>(),
    models.Triage.find(
      isOpen ? { companyId, status: STATUS_TYPES.TRIAGE } : { companyId },
    )
      .sort({ updatedAt: -1 })
      .limit(DISCORD_TASKS_FETCH_LIMIT)
      .select('number name status updatedAt')
      .lean<TCompanyTriage[]>(),
  ]);

  const statusIds = [
    ...new Set(
      tasks
        .map((task) => task.status)
        .filter((status): status is string => Boolean(status)),
    ),
  ];
  const statuses = statusIds.length
    ? await models.Status.find({ _id: { $in: statusIds } })
        .select('name')
        .lean()
    : [];
  const statusNames = new Map(
    statuses.map((status) => [String(status._id), status.name]),
  );

  const items: TWorkItem[] = [
    ...triages.map((triage) => ({
      label: `Triage #${triage.number ?? 0}`,
      name: triage.name,
      status:
        triage.status === STATUS_TYPES.CANCELLED
          ? 'Declined'
          : 'Waiting for review',
      due: '',
      updatedAt: triage.updatedAt,
    })),
    ...tasks.map((task) => ({
      label: `#${task.number ?? 0}`,
      name: task.name,
      status: capitalize(statusNames.get(String(task.status)) || 'No status'),
      due:
        task.statusType !== undefined &&
        CLOSED_STATUS_TYPES.includes(task.statusType)
          ? ''
          : formatDue(task.targetDate),
      updatedAt: task.updatedAt,
    })),
  ].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const pageCount = Math.max(
    1,
    Math.ceil(items.length / DISCORD_TASKS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = items.slice(
    currentPage * DISCORD_TASKS_PAGE_SIZE,
    (currentPage + 1) * DISCORD_TASKS_PAGE_SIZE,
  );

  const companyName =
    company?.primaryName || company?.names?.[0] || 'This company';

  const emptyText = isOpen ? 'No open tasks right now.' : 'No tasks yet.';

  return {
    content: '',
    embeds: [
      {
        title: truncateDiscordText(
          `${companyName} · ${isOpen ? 'Open' : 'All'} tasks (${items.length})`,
          DISCORD_LIMITS.title,
        ),
        description: truncateDiscordText(
          pageItems.length ? pageItems.map(formatItem).join('\n') : emptyText,
          DISCORD_LIMITS.description,
        ),
        color: DISCORD_CARD_COLORS.open,
        footer: { text: `Page ${currentPage + 1} of ${pageCount}` },
      },
    ],
    components: [
      {
        type: 1,
        components: [
          button({
            label: 'Open',
            customId: buildTasksButtonId('filter', 'open', 0),
            active: isOpen,
          }),
          button({
            label: 'All',
            customId: buildTasksButtonId('filter', 'all', 0),
            active: !isOpen,
          }),
          button({
            label: 'Previous',
            customId: buildTasksButtonId('previous', filter, currentPage - 1),
            disabled: currentPage === 0,
          }),
          button({
            label: 'Next',
            customId: buildTasksButtonId('next', filter, currentPage + 1),
            disabled: currentPage >= pageCount - 1,
          }),
        ],
      },
    ],
  };
};
