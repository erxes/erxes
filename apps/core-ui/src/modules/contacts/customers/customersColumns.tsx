import type { Customer, CustomValue } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconCalendarPlus,
  IconEdit,
  IconGenderMale,
  IconLabelFilled,
  IconMail,
  IconPhone,
  IconTags,
  IconTrash,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Combobox,
  Command,
  EmailDisplay,
  EmailListField,
  FullNameField,
  FullNameValue,
  PhoneDisplay,
  PhoneField,
  Popover,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  SexCode,
  SexDisplay,
  SexField,
  TextField,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { DateInlineCell, MemberInlineCell } from '~/components/inlineCells';
import { useSession } from '~/modules/auth/session';
import { customFieldColumns } from '~/modules/properties/customFieldColumns';
import { useFields } from '~/modules/properties/useFields';
import { TagsInlineCell } from '~/modules/tags/TagsInlineCell';
import { CUSTOMER_SHEET_PARAM, customerName, useCustomerEdit, useCustomersRemove } from './useCustomers';

const SCOPE = 'core-customers-inline';

const MoreCell = ({ customer }: { customer: Customer }) => {
  const [, setOpenId] = useQueryState<string>(CUSTOMER_SHEET_PARAM);
  const { user } = useSession();
  const remove = useCustomersRemove();
  const { confirm } = useConfirm();
  const [open, setOpen] = useState(false);
  const manager = user.role !== 'member';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                setOpenId(customer.id);
              }}
            >
              <IconEdit /> Edit
            </Command.Item>
            {manager && (
              <Command.Item
                value="delete"
                className="text-destructive"
                onSelect={() => {
                  setOpen(false);
                  void confirm({
                    message: `Delete ${customerName(customer) || customer.primaryEmail || 'this customer'}?`,
                    options: { okLabel: 'Delete', variants: { ok: 'destructive' } },
                  }).then(() => remove.mutate([customer.id]));
                }}
              >
                <IconTrash /> Delete
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const NameCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [, setOpenId] = useQueryState<string>(CUSTOMER_SHEET_PARAM);

  return (
    <FullNameField
      scope={`${SCOPE}.${customer.id}.name`}
      firstName={customer.firstName ?? ''}
      lastName={customer.lastName ?? ''}
      onValueChange={(firstName, lastName) => {
        if (firstName !== (customer.firstName ?? '') || lastName !== (customer.lastName ?? '')) {
          edit.mutate({ id: customer.id, firstName: firstName || null, lastName: lastName || null });
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor onClick={() => setOpenId(customer.id)}>
          <FullNameValue />
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
    </FullNameField>
  );
};

export const EmailsCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const value = { primaryEmail: customer.primaryEmail ?? '', emails: customer.emails };

  return (
    <PopoverScoped scope={`${SCOPE}.${customer.id}.emails`}>
      <RecordTableInlineCell.Trigger>
        <EmailDisplay {...value} maxVisible={1} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <EmailListField
          recordId={customer.id}
          {...value}
          noValidation
          onValueChange={({ primaryEmail, emails }) =>
            edit.mutate({ id: customer.id, primaryEmail: primaryEmail || null, emails })
          }
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const PhonesCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const value = { primaryPhone: customer.primaryPhone ?? '', phones: customer.phones };

  return (
    <PopoverScoped scope={`${SCOPE}.${customer.id}.phones`}>
      <RecordTableInlineCell.Trigger>
        <PhoneDisplay {...value} maxVisible={1} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <PhoneField
          recordId={customer.id}
          {...value}
          onValueChange={({ primaryPhone, phones }) =>
            edit.mutate({ id: customer.id, primaryPhone: primaryPhone || null, phones })
          }
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const SexCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const value = (customer.sex ?? SexCode.NOT_KNOWN) as SexCode;

  return (
    <PopoverScoped scope={`${SCOPE}.${customer.id}.sex`} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <SexDisplay value={value} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={value}
          onValueChange={(sex) => {
            if (sex !== value) {
              edit.mutate({ id: customer.id, sex: sex as Customer['sex'] });
            }
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

type TextKey = 'position' | 'department' | 'code' | 'description' | 'middleName';

/** A plain text field of a customer, edited in place. */
export const TextCell = ({ customer, field }: { customer: Customer; field: TextKey }) => {
  const edit = useCustomerEdit();

  return (
    <TextField
      scope={`${SCOPE}.${customer.id}.${field}`}
      value={customer[field] ?? ''}
      placeholder=""
      onSave={(value) => edit.mutate({ id: customer.id, [field]: value.trim() || null })}
    />
  );
};

export const TagsCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();

  return (
    <TagsInlineCell
      type="customer"
      scope={`${SCOPE}.${customer.id}.tags`}
      value={customer.tagIds}
      onChange={(tagIds) => edit.mutate({ id: customer.id, tagIds })}
    />
  );
};

export const OwnerCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();

  return (
    <MemberInlineCell
      scope={`${SCOPE}.${customer.id}.owner`}
      value={customer.ownerId}
      onSave={(ownerId) => edit.mutate({ id: customer.id, ownerId })}
    />
  );
};

export const BirthDateCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();

  return (
    <DateInlineCell
      scope={`${SCOPE}.${customer.id}.birthDate`}
      value={customer.birthDate}
      onSave={(birthDate) => edit.mutate({ id: customer.id, birthDate })}
    />
  );
};

/** Saves custom field values of a customer (for custom field cells). */
export const useCustomerFieldsSave = () => {
  const edit = useCustomerEdit();

  return (id: string, customFields: Record<string, CustomValue | null>) => edit.mutate({ id, customFields });
};

const DateCell = ({ value }: { value: string }) => (
  <RelativeDateDisplay value={value} asChild>
    <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
      <RelativeDateDisplay.Value value={value} />
    </RecordTableInlineCell>
  </RelativeDateDisplay>
);

/** Customer columns, as in old core-ui. */
const customersColumns: ColumnDef<Customer>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <MoreCell customer={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<Customer>,
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: () => <RecordTable.InlineHead icon={IconUser} label="" />,
    cell: ({ row }) => {
      const { avatarUrl, firstName, lastName, primaryEmail } = row.original;

      return (
        <div className="flex h-8 items-center justify-center">
          <Avatar size="lg">
            {avatarUrl && <Avatar.Image src={avatarUrl} />}
            <Avatar.Fallback>
              {(firstName || lastName || primaryEmail || '-').charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
        </div>
      );
    },
    size: 34,
  },
  {
    id: 'name',
    accessorFn: (customer) => customerName(customer),
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label="Name" />,
    cell: ({ row }) => <NameCell customer={row.original} />,
    size: 240,
  },
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Emails" />,
    cell: ({ row }) => <EmailsCell customer={row.original} />,
    size: 250,
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Phones" />,
    cell: ({ row }) => <PhonesCell customer={row.original} />,
    size: 220,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead icon={IconTags} label="Tags" />,
    cell: ({ row }) => <TagsCell customer={row.original} />,
    size: 260,
  },
  {
    id: 'sex',
    accessorKey: 'sex',
    header: () => <RecordTable.InlineHead icon={IconGenderMale} label="Sex" />,
    cell: ({ row }) => <SexCell customer={row.original} />,
  },
  {
    id: 'position',
    accessorKey: 'position',
    header: () => <RecordTable.InlineHead icon={IconBriefcase} label="Position" />,
    cell: ({ row }) => <TextCell customer={row.original} field="position" />,
    size: 200,
  },
  {
    id: 'owner',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUserCircle} label="Owner" />,
    cell: ({ row }) => <OwnerCell customer={row.original} />,
    size: 200,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendarPlus} label="Created" />,
    cell: ({ row }) => <DateCell value={row.original.createdAt} />,
  },
];

/** The customer columns plus one per custom field. */
export const useCustomersColumns = () => {
  const { fields } = useFields('customer');

  return useMemo(
    () => [...customersColumns, ...customFieldColumns<Customer>(fields, useCustomerFieldsSave, SCOPE)],
    [fields],
  );
};
