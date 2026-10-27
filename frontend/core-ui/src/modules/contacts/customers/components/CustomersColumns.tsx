import { CustomerEmailsCell } from '@/contacts/customers/components/cells/CustomerEmailsCell';
import { CustomerNameCell } from '@/contacts/customers/components/cells/CustomerNameCell';
import { CustomerSexCell } from '@/contacts/customers/components/cells/CustomerSexCell';
import { customerMoreColumn } from '@/contacts/customers/components/CustomerMoreColumn';
import { CustomerCellContext } from '@/contacts/contexts/ContactTableCellContext';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import {
  IconCalendarPlus,
  IconChartBar,
  IconClock,
  IconGenderMale,
  IconLabelFilled,
  IconMail,
  IconPhone,
  IconTags,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Avatar,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  readImage,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  CustomerOwner,
  CustomerPhones,
  ICustomer,
  TagsSelect,
} from 'ui-modules';

const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<ICustomer>;

export const createCustomersColumns = (
  t: TFunction,
): ColumnDef<ICustomer>[] => [
  customerMoreColumn,
  checkBoxColumn,

  {
    id: 'avatar',
    accessorKey: 'avatar',
    header: () => <RecordTable.InlineHead icon={IconUser} label="" />,
    cell: ({ cell }) => {
      const { firstName, lastName } = cell.row.original;
      return (
        <div className="flex items-center justify-center h-8">
          <Avatar size="lg">
            <Avatar.Image src={readImage(cell.getValue() as string)} />
            <Avatar.Fallback>
              {firstName?.charAt(0) || lastName?.charAt(0) || '-'}
            </Avatar.Fallback>
          </Avatar>
        </div>
      );
    },
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead
        label={t('customer.name')}
        icon={IconLabelFilled}
      />
    ),
    cell: (context) => (
      <CustomerCellContext.Provider value={context}>
        <CustomerNameCell />
      </CustomerCellContext.Provider>
    ),
    size: 240,
  },
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => (
      <RecordTable.InlineHead label={t('customer.emails')} icon={IconMail} />
    ),
    cell: (context) => (
      <CustomerCellContext.Provider value={context}>
        <CustomerEmailsCell />
      </CustomerCellContext.Provider>
    ),
    size: 250,
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => (
      <RecordTable.InlineHead label={t('customer.phones')} icon={IconPhone} />
    ),
    cell: ({ cell }) => {
      const { _id, primaryPhone, phones, phoneValidationStatus } =
        cell.row.original;

      return (
        <CustomerPhones
          _id={_id}
          primaryPhone={primaryPhone || ''}
          phones={phones || []}
          phoneValidationStatus={phoneValidationStatus}
          scope={ContactsHotKeyScope.CustomersTableInlinePopover}
          Trigger={RecordTableInlineCell.Trigger}
        />
      );
    },
    size: 250,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => (
      <RecordTable.InlineHead label={t('customer.tags')} icon={IconTags} />
    ),
    cell: ({ cell }) => {
      return (
        <TagsSelect.InlineCell
          type="core:customer"
          mode="multiple"
          scope={ContactsHotKeyScope.CustomersTableInlinePopover}
          value={cell.row.original.tagIds}
          targetIds={[cell.row.original._id]}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              cache.modify({
                id: cache.identify({
                  __typename: 'Customer',
                  _id: cell.row.original._id,
                }),
                fields: {
                  tagIds: () => newSelectedTagIds,
                },
                optimistic: true,
              });
            },
          })}
        />
      );
    },
    size: 360,
  },
  {
    id: 'sex',
    accessorKey: 'sex',
    header: () => (
      <RecordTable.InlineHead label={t('customer.sex')} icon={IconGenderMale} />
    ),
    cell: (context) => (
      <CustomerCellContext.Provider value={context}>
        <CustomerSexCell />
      </CustomerCellContext.Provider>
    ),
  },
  {
    id: 'owner',
    accessorKey: 'owner',
    header: () => (
      <RecordTable.InlineHead label={t('customer.owner')} icon={IconUser} />
    ),
    cell: ({ cell }) => {
      return (
        <CustomerOwner
          _id={cell.row.original._id}
          ownerId={cell.row.original.ownerId || ''}
          inTable
        />
      );
    },
    size: 250,
  },
  {
    id: 'lastSeenAt',
    accessorKey: 'lastSeenAt',
    header: () => (
      <RecordTable.InlineHead
        label={t('customer.last-seen')}
        icon={IconClock}
      />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'sessionCount',
    accessorKey: 'sessionCount',
    header: () => (
      <RecordTable.InlineHead
        label={t('customer.session-count')}
        icon={IconChartBar}
      />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead
        label={t('customer.created-at')}
        icon={IconCalendarPlus}
      />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
