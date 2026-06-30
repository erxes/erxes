import {
  Icon,
  IconBellRinging,
  IconBrandMessenger,
  IconInfoSquareRounded,
  IconLabelFilled,
  IconMail,
  IconMessage2,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  BadgeProps,
  RecordTable,
  RecordTableInlineCell,
  Tooltip,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BrandsInline, MembersInline } from 'ui-modules';
import {
  BROADCAST_KIND_FILTERS,
  BROADCAST_MESSAGE_KINDS,
  BROADCAST_MESSAGE_STATUS_MAP,
  BROADCAST_METHODS,
} from '../constants';

export const broadcastColumns: ColumnDef<any>[] = [
  RecordTable.checkboxColumn,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTable.InlineHead label={t('name', 'Name')} icon={IconLabelFilled} />
      );
    },
    cell: ({ cell }) => {
      const [_, setMessageId] = useQueryState('messageId');

      const { _id, method } = cell.row.original || {};

      const handleClick = () => {
        if (method !== 'email') {
          return;
        }

        setMessageId(_id);
      };

      return (
        <RecordTableInlineCell onClick={handleClick}>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTable.InlineHead label={t('status', 'Status')} icon={IconLabelFilled} />
      );
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('broadcasts');
      const { kind, isLive, runCount, isDraft, status, progress } =
        cell.row.original;

      let labelStyle: BadgeProps['variant'] = 'default';
      let labelText = t('sending', 'Sending');

      if (!isLive) {
        labelStyle = 'warning';
        labelText = t('paused', 'Paused');
      } else {
        labelStyle = 'info';
        labelText = t('sending', 'Sending');
      }

      if (kind === BROADCAST_MESSAGE_KINDS.MANUAL) {
        if (runCount > 0) {
          labelStyle = 'success';
          labelText = t('sent', 'Sent');
        } else {
          labelStyle = 'warning';
          labelText = t('not-sent', 'Not Sent');
        }
      }

      if (isDraft === true) {
        labelStyle = 'secondary';
        labelText = t('draft', 'Draft');
      }

      if (status) {
        labelStyle = BROADCAST_MESSAGE_STATUS_MAP[status].style;
        labelText = BROADCAST_MESSAGE_STATUS_MAP[status].text;
      }

      return (
        <RecordTableInlineCell>
          <Badge variant={labelStyle}>{labelText}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalCustomersCount',
    accessorKey: 'totalCustomersCount',
    header: () => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTable.InlineHead label={t('total', 'Total')} icon={IconLabelFilled} />
      );
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('broadcasts');
      const { validCustomersCount, totalCustomersCount } = cell.row.original;

      const percentage =
        totalCustomersCount > 0
          ? (validCustomersCount / totalCustomersCount) * 100
          : 0;

      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">
            <IconUser className="w-4 h-4" />
            {(cell.getValue() as number) || 0}
          </Badge>

          <Tooltip.Provider>
            <Tooltip delayDuration={500}>
              <Tooltip.Trigger asChild>
                <Badge variant="secondary">
                  {Number.isInteger(percentage)
                    ? percentage
                    : percentage.toFixed(2)}
                  %
                </Badge>
              </Tooltip.Trigger>
              {validCustomersCount && totalCustomersCount ? (
                <Tooltip.Content
                  className="max-w-96"
                  side="right"
                  align="start"
                >
                  {t('column.customers-valid', '{{valid}} of {{total}} customers are valid', {
                    valid: validCustomersCount,
                    total: totalCustomersCount,
                  })}
                </Tooltip.Content>
              ) : null}
            </Tooltip>
          </Tooltip.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'method',
    accessorKey: 'method',
    header: () => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTable.InlineHead label={t('type', 'Type')} icon={IconLabelFilled} />
      );
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('broadcasts');
      const { method, kind } = cell.row.original;

      let MethodIcon: Icon = IconInfoSquareRounded;
      let label: string = t('unknown', 'Unknown');

      switch (method) {
        case BROADCAST_METHODS.EMAIL:
          MethodIcon = IconMail;
          label = t('email', 'Email');

          break;
        case BROADCAST_METHODS.SMS:
          MethodIcon = IconMessage2;
          label = t('sms', 'Sms');

          break;
        case BROADCAST_METHODS.MESSENGER:
          MethodIcon = IconBrandMessenger;
          label = t('messenger', 'Messenger');

          break;
        case BROADCAST_METHODS.NOTIFICATION:
          MethodIcon = IconBellRinging;
          label = t('notification', 'Notification');

          break;
        default:
          break;
      }

      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">
            <MethodIcon className="w-4 h-4" />
            <span>{label}</span>
          </Badge>
          <Badge variant="secondary">
            <span>{BROADCAST_KIND_FILTERS[kind] || ''}</span>
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'brandId',
    accessorKey: 'brandId',
    header: () => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTable.InlineHead label={t('brand', 'Brand')} icon={IconLabelFilled} />
      );
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTableInlineCell>
          <BrandsInline
            brandIds={[cell.getValue() as string]}
            placeholder={t('no-brand', 'No Brand')}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'fromUserId',
    accessorKey: 'fromUserId',
    header: () => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTable.InlineHead label={t('from', 'From')} icon={IconLabelFilled} />
      );
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('broadcasts');
      return (
        <RecordTableInlineCell>
          <MembersInline
            memberIds={[cell.getValue() as string]}
            placeholder={t('no-member', 'No Member')}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
