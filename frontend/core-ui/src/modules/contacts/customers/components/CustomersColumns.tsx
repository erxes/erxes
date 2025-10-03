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
  SexCode,
  SexDisplay,
  SexField,
  readImage,
  useQueryState,
  PopoverScoped,
  FullNameValue,
} from 'erxes-ui';
import { useState } from 'react';
import {
  CustomerEmails,
  CustomerName,
  CustomerOwner,
  CustomerPhones,
  ICustomer,
  SelectTags,
  useCustomerEdit,
} from 'ui-modules';
import { useSetAtom } from 'jotai';
import { renderingCustomerDetailAtom } from '@/contacts/states/customerDetailStates';
import clsx from 'clsx';

const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<ICustomer>;

export const customersColumns: ColumnDef<ICustomer>[] = [
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
      <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const [, setDetailOpen] = useQueryState('contactId');
      const setRenderingCustomerDetail = useSetAtom(
        renderingCustomerDetailAtom,
      );

      const {
        firstName = '',
        lastName = '',
        _id,
        middleName = '',
      } = cell.row.original;

      return (
        <CustomerName
          _id={_id}
          firstName={firstName}
          lastName={`${middleName || ''}${middleName ? ' ' : ''}${
            lastName || ''
          }`}
          scope={clsx(ContactsHotKeyScope.CustomersPage, _id, 'Name')}
        >
          <RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Anchor
              onClick={() => {
                setDetailOpen(_id);
                setRenderingCustomerDetail(false);
              }}
            >
              <FullNameValue />
            </RecordTableInlineCell.Anchor>
          </RecordTableInlineCell.Trigger>
        </CustomerName>
      );
    },
    size: 240,
  },
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => <RecordTable.InlineHead label="Emails" icon={IconMail} />,
    cell: ({ cell }) => {
      const { primaryEmail, _id, emailValidationStatus, emails } =
        cell.row.original;
      return (
        <CustomerEmails
          primaryEmail={primaryEmail || ''}
          _id={_id}
          emailValidationStatus={emailValidationStatus}
          emails={emails || []}
          Trigger={RecordTableInlineCell.Trigger}
        />
      );
    },
    size: 250,
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => <RecordTable.InlineHead label="Phones" icon={IconPhone} />,
    cell: ({ cell }) => {
      const { _id, primaryPhone, phones, phoneValidationStatus } =
        cell.row.original;

      return (
        <CustomerPhones
          _id={_id}
          primaryPhone={primaryPhone || ''}
          phones={phones || []}
          phoneValidationStatus={phoneValidationStatus}
          scope={clsx(ContactsHotKeyScope.CustomersPage, _id, 'Phones')}
          Trigger={RecordTableInlineCell.Trigger}
        />
      );
    },
    size: 250,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead label="Tags" icon={IconTags} />,
    cell: ({ cell }) => { 
      return (
        <SelectTags.InlineCell
          tagType="core:customer"
          mode="multiple"
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
    header: () => <RecordTable.InlineHead label="Sex" icon={IconGenderMale} />,
    cell: ({ cell }) => {
      const { customerEdit } = useCustomerEdit();
      const [open, setOpen] = useState(false);
      const { _id } = cell.row.original;
      return (
        <PopoverScoped
          scope={ContactsHotKeyScope.CustomersPage + '.' + _id + '.Sex'}
          open={open}
          onOpenChange={setOpen}
        >
          <RecordTableInlineCell.Trigger>
            <SexDisplay value={cell.getValue() as SexCode} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <SexField
              value={cell.getValue() as SexCode}
              onValueChange={(value) => {
                if (value !== (cell.getValue() as SexCode)) {
                  customerEdit({
                    variables: { _id, sex: value },
                  });
                }
                setOpen(false);
              }}
            />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      );
    },
  },
  {
    id: 'owner',
    accessorKey: 'owner',
    header: () => <RecordTable.InlineHead label="Owner" icon={IconUser} />,
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
    header: () => <RecordTable.InlineHead label="Last Seen" icon={IconClock} />,
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
      <RecordTable.InlineHead label="Session Count" icon={IconChartBar} />
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
      <RecordTable.InlineHead label="Created At" icon={IconCalendarPlus} />
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
