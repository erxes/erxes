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
    header: () => (
      <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
    ),
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
    header: () => (
      <RecordTable.InlineHead label="Status" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const { kind, isLive, runCount, isDraft, status, progress } =
        cell.row.original;

      let labelStyle: BadgeProps['variant'] = 'default';
      let labelText = 'Sending';

      if (!isLive) {
        labelStyle = 'warning';
        labelText = 'Paused';
      } else {
        labelStyle = 'info';
        labelText = 'Sending';
      }

      if (kind === BROADCAST_MESSAGE_KINDS.MANUAL) {
        if (runCount > 0) {
          labelStyle = 'success';
          labelText = 'Sent';
        } else {
          labelStyle = 'warning';
          labelText = 'Not Sent';
        }
      }

      if (isDraft === true) {
        labelStyle = 'secondary';
        labelText = 'Draft';
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
    header: () => (
      <RecordTable.InlineHead label="Total" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
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
                  {`${validCustomersCount} of ${totalCustomersCount} customers are valid`}
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
    header: () => (
      <RecordTable.InlineHead label="Type" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const { method, kind } = cell.row.original;

      let MethodIcon: Icon = IconInfoSquareRounded;
      let label: string = 'Unknown';

      switch (method) {
        case BROADCAST_METHODS.EMAIL:
          MethodIcon = IconMail;
          label = 'Email';

          break;
        case BROADCAST_METHODS.SMS:
          MethodIcon = IconMessage2;
          label = 'Sms';

          break;
        case BROADCAST_METHODS.MESSENGER:
          MethodIcon = IconBrandMessenger;
          label = 'Messenger';

          break;
        case BROADCAST_METHODS.NOTIFICATION:
          MethodIcon = IconBellRinging;
          label = 'Notification';

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
    header: () => (
      <RecordTable.InlineHead label="Brand" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <BrandsInline
            brandIds={[cell.getValue() as string]}
            placeholder="No Brand"
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'fromUserId',
    accessorKey: 'fromUserId',
    header: () => (
      <RecordTable.InlineHead label="From" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <MembersInline
            memberIds={[cell.getValue() as string]}
            placeholder="No Member"
          />
        </RecordTableInlineCell>
      );
    },
  },
];
