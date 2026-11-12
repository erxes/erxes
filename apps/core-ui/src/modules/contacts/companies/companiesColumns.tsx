import type { Company } from '@erxes/core-contract';
import {
  type Icon,
  IconBriefcase,
  IconBuilding,
  IconBuildingFactory,
  IconEdit,
  IconLabelFilled,
  IconMail,
  IconNumber,
  IconPhone,
  IconTags,
  IconUser,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Combobox,
  Command,
  Input,
  Popover,
  PopoverScoped,
  readImage,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withLifecycleColumns } from '~/modules/leads/leadColumns';
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
import { companyTitle } from '../components/ContactPicker';
import { useCompanyEdit } from './useCompanies';

const SCOPE = 'companies-page';

const useOpenCompany = () => {
  const { openRecord } = useSidePanel();

  return (id: string) => openRecord({ contentType: 'core:company', contentId: id });
};

const CompanyMoreColumnCell = ({ company }: { company: Company }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const openCompany = useOpenCompany();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => openCompany(company.id)}>
              <IconEdit /> {t('action-edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

/** The name, edited in place (Enter saves); the link opens the company. */
const CompanyNameCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();
  const openCompany = useOpenCompany();
  const { id, primaryName } = company;
  const [editingName, setEditingName] = useState(primaryName);
  const [savedName, setSavedName] = useState(primaryName);

  // A name saved elsewhere replaces the one being typed.
  if (savedName !== primaryName) {
    setSavedName(primaryName);
    setEditingName(primaryName);
  }

  const handleEnter = () => {
    if (!editingName.trim() || editingName.trim() === primaryName) return;

    edit.mutate(
      { id, primaryName: editingName.trim() },
      { onError: () => setEditingName(primaryName) },
    );
  };

  return (
    <PopoverScoped scope={`${SCOPE}.${id}.Name`} closeOnEnter onEnter={handleEnter}>
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor onClick={() => openCompany(id)}>
          {primaryName || companyTitle(company)}
        </RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** A read-only text column. */
const textColumn = (
  id: keyof Company,
  icon: Icon,
  label: string,
  size: number,
  valueOf: (company: Company) => string,
): ColumnDef<Company> => ({
  id,
  accessorKey: id,
  header: () => <RecordTable.InlineHead icon={icon} label={label} />,
  cell: ({ row }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={valueOf(row.original)} />
    </RecordTableInlineCell>
  ),
  size,
});

/** Selection, the picture and the name. */
const identityColumns = (t: (key: string) => string): ColumnDef<Company>[] => [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <CompanyMoreColumnCell company={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumnOf<Company>(),
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="" />,
    cell: ({ row }) => (
      <div className="flex h-8 items-center justify-center">
        <Avatar>
          <Avatar.Image src={readImage(row.original.avatarUrl ?? undefined)} />
          <Avatar.Fallback>{companyTitle(row.original).charAt(0) || '-'}</Avatar.Fallback>
        </Avatar>
      </div>
    ),
    size: 34,
  },
  {
    id: 'primaryName',
    accessorKey: 'primaryName',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label={t('name')} />,
    cell: ({ row }) => <CompanyNameCell company={row.original} />,
    size: 250,
  },
];

/** Company columns. */
const createCompanyColumns = (t: (key: string) => string): ColumnDef<Company>[] => [
  ...identityColumns(t),
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => <RecordTable.InlineHead icon={IconMail} label={t('emails')} />,
    cell: ({ row }) => (
      <ContactEmailsCell record={row.original} scope={`${SCOPE}.${row.original.id}.Emails`} />
    ),
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => <RecordTable.InlineHead icon={IconPhone} label={t('phones')} />,
    cell: ({ row }) => (
      <ContactPhonesCell record={row.original} scope={`${SCOPE}.${row.original.id}.Phones`} />
    ),
  },
  {
    id: 'owner',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('owner')} />,
    cell: ({ row }) => (
      <ContactOwnerCell record={row.original} scope={`${SCOPE}.${row.original.id}.Owner`} />
    ),
    size: 200,
  },
  textColumn('code', IconNumber, t('field.code') || 'Code', 150, (company) => company.code ?? ''),
  textColumn(
    'industry',
    IconBuildingFactory,
    t('field.industry'),
    250,
    (company) => company.industry ?? '',
  ),
  textColumn('size', IconUsers, t('field.size') || 'Size', 100, (company) =>
    company.size ? company.size.toString() : '',
  ),
  textColumn(
    'businessType',
    IconBriefcase,
    t('field.businessType') || 'Business Type',
    150,
    (company) => company.businessType ?? '',
  ),
  textColumn(
    'website',
    IconWorld,
    t('field.website') || 'Website',
    200,
    (company) => company.website ?? '',
  ),
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead icon={IconTags} label={t('tags')} />,
    cell: ({ row }) => (
      <ContactTagsCell record={row.original} scope={`${SCOPE}.${row.original.id}.Tags`} />
    ),
    size: 300,
  },
];

/** The company columns plus one per custom field. */
export const useCompaniesColumns = (state: 'lead' | 'customer' = 'customer') => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { fields } = useFields('company');

  return useMemo(
    () =>
      withLifecycleColumns<Company>(
        createCompanyColumns(t),
        'primaryName',
        'company',
        state === 'lead',
        customFieldColumns<Company>(fields, (company, field) => (
          <ContactFieldCell record={company} field={field} scope={SCOPE} />
        )),
      ),
    [fields, t, state],
  );
};
