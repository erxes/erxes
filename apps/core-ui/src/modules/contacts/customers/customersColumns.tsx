import type { Customer, CustomerState } from '@erxes/core-contract';
import {
  IconCalendarPlus,
  IconEdit,
  IconGenderMale,
  IconLabelFilled,
  IconMail,
  IconPhone,
  IconTags,
  IconUser,
} from '@tabler/icons-react';
import type { RecordTableColumnDef } from 'erxes-ui';
import {
  Avatar,
  Combobox,
  Command,
  FullNameValue,
  Popover,
  PopoverScoped,
  readImage,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  SexDisplay,
  SexField,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { customFieldColumns } from '~/modules/properties/customFieldColumns';
import { useFields } from '~/modules/properties/useFields';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import {
  ContactEmailsCell,
  ContactFieldCell,
  ContactOwnerCell,
  ContactPhonesCell,
  ContactTagsCell,
} from '../components/contactCells';
import { ContactName } from '../components/ContactFields';
import { sexCodeOf } from './sexCode';
import { useCustomerEdit } from './useCustomers';
import { withLifecycleColumns } from '~/modules/leads/leadColumns';

const SCOPE = 'customers-table-inline-popover';

const useOpenCustomer = () => {
  const { openRecord } = useSidePanel();

  return (id: string) => openRecord({ contentType: 'core:customer', contentId: id });
};

const CustomerMoreColumnCell = ({ customer }: { customer: Customer }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const openCustomer = useOpenCustomer();

  return (
    <Popover>
      <Popover.Trigger render={<RecordTable.MoreButton className="h-full w-full" />} />
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => openCustomer(customer.id)}>
              <IconEdit /> {t('action-edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const CustomerNameCell = ({ customer }: { customer: Customer }) => {
  // `mutate` keeps one identity, the mutation result does not.
  const { mutate } = useCustomerEdit();
  const openCustomer = useOpenCustomer();
  const { id, firstName, middleName, lastName } = customer;

  return (
    <ContactName
      firstName={firstName}
      lastName={`${middleName || ''}${middleName ? ' ' : ''}${lastName || ''}`}
      scope={`customers-page.${id}.Name`}
      onSave={(nextFirstName, nextLastName) =>
        mutate({
          id,
          firstName: nextFirstName || null,
          middleName: null,
          lastName: nextLastName || null,
        })
      }
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor onClick={() => openCustomer(id)}>
          <FullNameValue />
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
    </ContactName>
  );
};

const CustomerSexCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const value = sexCodeOf(customer);

  return (
    <PopoverScoped scope={SCOPE} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <SexDisplay value={value} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={value}
          onValueChange={(sex) => {
            if (sex !== value) edit.mutate({ id: customer.id, sex: sex });
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const DateCell = ({ value }: { value: string }) => (
  <RelativeDateDisplay
    value={value}
    render={<RecordTableInlineCell className="text-xs font-medium text-muted-foreground" />}
  >
    <RelativeDateDisplay.Value value={value} />
  </RelativeDateDisplay>
);

/** Selection, the picture and the name. */
const identityColumns = (t: (key: string) => string): RecordTableColumnDef<Customer>[] => [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <CustomerMoreColumnCell customer={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumnOf<Customer>(),
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: () => <RecordTable.InlineHead icon={IconUser} label="" />,
    cell: ({ row }) => {
      const { avatarUrl, firstName, lastName } = row.original;

      return (
        <div className="flex h-8 items-center justify-center">
          <Avatar size="lg">
            <Avatar.Image src={readImage(avatarUrl ?? undefined)} />
            <Avatar.Fallback>{firstName?.charAt(0) || lastName?.charAt(0) || '-'}</Avatar.Fallback>
          </Avatar>
        </div>
      );
    },
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'firstName',
    header: () => <RecordTable.InlineHead label={t('customer.name')} icon={IconLabelFilled} />,
    cell: ({ row }) => <CustomerNameCell customer={row.original} />,
    size: 240,
  },
];

/** Customer columns. */
const createCustomersColumns = (t: (key: string) => string): RecordTableColumnDef<Customer>[] => [
  ...identityColumns(t),
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => <RecordTable.InlineHead label={t('customer.emails')} icon={IconMail} />,
    cell: ({ row }) => <ContactEmailsCell record={row.original} scope={SCOPE} />,
    size: 250,
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => <RecordTable.InlineHead label={t('customer.phones')} icon={IconPhone} />,
    cell: ({ row }) => <ContactPhonesCell record={row.original} scope={SCOPE} />,
    size: 250,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead label={t('customer.tags')} icon={IconTags} />,
    cell: ({ row }) => <ContactTagsCell record={row.original} scope={SCOPE} />,
    size: 360,
  },
  {
    id: 'sex',
    accessorKey: 'sex',
    header: () => <RecordTable.InlineHead label={t('customer.sex')} icon={IconGenderMale} />,
    cell: ({ row }) => <CustomerSexCell customer={row.original} />,
  },
  {
    id: 'owner',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead label={t('customer.owner')} icon={IconUser} />,
    cell: ({ row }) => (
      <ContactOwnerCell record={row.original} scope={`${SCOPE}.${row.original.id}.owner`} />
    ),
    size: 250,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label={t('customer.created-at')} icon={IconCalendarPlus} />
    ),
    cell: ({ row }) => <DateCell value={row.original.createdAt} />,
  },
];

/** The customer columns (leads: stage and days in it after the name), source, last activity, one per custom field. */
export const useCustomersColumns = (state: CustomerState = 'customer') => {
  const { t } = useTranslation('contact');
  const { fields } = useFields('customer');

  return useMemo(
    () =>
      withLifecycleColumns<Customer>(
        createCustomersColumns(t),
        'name',
        'customer',
        state === 'lead',
        customFieldColumns<Customer>(fields, (customer, field) => (
          <ContactFieldCell record={customer} field={field} scope={SCOPE} />
        )),
      ),
    [fields, t, state],
  );
};
