import type { Company } from '@erxes/core-contract';
import {
  type Icon,
  IconBriefcase,
  IconBuilding,
  IconBuildingFactory,
  IconLabelFilled,
  IconMail,
  IconNumber,
  IconPhone,
  IconTags,
  IconUser,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import type { RecordTableColumnDef } from 'erxes-ui';
import {
  Avatar,
  companyTitle,
  Input,
  PopoverScoped,
  readImage,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withLifecycleColumns } from '~/modules/leads/leadColumns';
import { useFields } from '~/modules/dataExtensions/dataQueries';
import { dataFieldColumns } from '~/modules/dataExtensions/values/dataColumns';
import { useOpenPanelRecord } from '~/modules/side-panel/useSidePanel';
import {
  ContactEmailsCell,
  ContactMoreCell,
  ContactOwnerCell,
  ContactPhonesCell,
  ContactTagsCell,
} from '../components/contactCells';
import { useCompanyEdit } from './useCompanies';

const SCOPE = 'companies-page';

const useOpenCompany = () => {
  const openRecord = useOpenPanelRecord();

  return (id: string) => openRecord({ contentType: 'core:company', contentId: id });
};

/** The name, edited in place (Enter saves); the link opens the company. */
const CompanyNameCell = ({ company }: { company: Company }) => {
  // `mutate` keeps one identity, the mutation result does not.
  const { mutate } = useCompanyEdit();
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

    mutate({ id, primaryName: editingName.trim() }, { onError: () => setEditingName(primaryName) });
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
): RecordTableColumnDef<Company> => ({
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
const identityColumns = (t: (key: string) => string): RecordTableColumnDef<Company>[] => [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <ContactMoreCell record={row.original} />,
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
const createCompanyColumns = (t: (key: string) => string): RecordTableColumnDef<Company>[] => [
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

/** The company columns plus one per Data Extensions field. */
export const useCompaniesColumns = (state: 'lead' | 'customer' = 'customer') => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { fields } = useFields('core.company');

  return useMemo(
    () =>
      withLifecycleColumns<Company>(
        createCompanyColumns(t),
        'primaryName',
        'company',
        state === 'lead',
        dataFieldColumns<Company>(fields),
      ),
    [fields, t, state],
  );
};
