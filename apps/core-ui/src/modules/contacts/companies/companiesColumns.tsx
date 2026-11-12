import type { Company, CustomValue } from '@erxes/core-contract';
import {
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
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withLifecycleColumns } from '~/modules/leads/leadColumns';
import { customFieldColumns } from '~/modules/properties/customFieldColumns';
import { useFields } from '~/modules/properties/useFields';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { TagsSelect } from '~/modules/tags/TagsSelect';
import { ContactEmails, ContactPhones } from '../components/ContactFields';
import { companyTitle } from '../components/ContactPicker';
import { SelectMember } from '../components/SelectMember';
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

  useEffect(() => setEditingName(primaryName), [primaryName]);

  const handleEnter = () => {
    if (!editingName.trim() || editingName.trim() === primaryName) return;

    edit.mutate({ id, primaryName: editingName.trim() }, { onError: () => setEditingName(primaryName) });
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

const TextCell = ({ value }: { value: string }) => (
  <RecordTableInlineCell>
    <TextOverflowTooltip value={value} />
  </RecordTableInlineCell>
);

/** Saves custom field values of a company (for custom field cells). */
const useCompanyFieldsSave = () => {
  const edit = useCompanyEdit();

  return (id: string, customFields: Record<string, CustomValue | null>) => edit.mutate({ id, customFields });
};

/** Company columns, as in old core-ui. */
const createCompanyColumns = (t: (key: string) => string): ColumnDef<Company>[] => [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <CompanyMoreColumnCell company={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<Company>,
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
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => <RecordTable.InlineHead icon={IconMail} label={t('emails')} />,
    cell: function EmailsCell({ row }) {
      const edit = useCompanyEdit();
      const company = row.original;

      return (
        <ContactEmails
          id={company.id}
          primaryEmail={company.primaryEmail}
          emails={company.emails}
          scope={`${SCOPE}.${company.id}.Emails`}
          Trigger={RecordTableInlineCell.Trigger}
          onSave={(value) => edit.mutate({ id: company.id, ...value })}
        />
      );
    },
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => <RecordTable.InlineHead icon={IconPhone} label={t('phones')} />,
    cell: function PhonesCell({ row }) {
      const edit = useCompanyEdit();
      const company = row.original;

      return (
        <ContactPhones
          id={company.id}
          primaryPhone={company.primaryPhone}
          phones={company.phones}
          scope={`${SCOPE}.${company.id}.Phones`}
          Trigger={RecordTableInlineCell.Trigger}
          onSave={(value) => edit.mutate({ id: company.id, ...value })}
        />
      );
    },
  },
  {
    id: 'owner',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('owner')} />,
    cell: function OwnerCell({ row }) {
      const edit = useCompanyEdit();

      return (
        <SelectMember.InlineCell
          scope={`${SCOPE}.${row.original.id}.Owner`}
          value={row.original.ownerId}
          onValueChange={(ownerId) =>
            edit.mutate({ id: row.original.id, ownerId: typeof ownerId === 'string' ? ownerId : null })
          }
        />
      );
    },
    size: 200,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconNumber} label={t('field.code') || 'Code'} />,
    cell: ({ row }) => <TextCell value={row.original.code ?? ''} />,
    size: 150,
  },
  {
    id: 'industry',
    accessorKey: 'industry',
    header: () => <RecordTable.InlineHead icon={IconBuildingFactory} label={t('field.industry')} />,
    cell: ({ row }) => <TextCell value={row.original.industry ?? ''} />,
    size: 250,
  },
  {
    id: 'size',
    accessorKey: 'size',
    header: () => <RecordTable.InlineHead icon={IconUsers} label={t('field.size') || 'Size'} />,
    cell: ({ row }) => <TextCell value={String(row.original.size || '')} />,
    size: 100,
  },
  {
    id: 'businessType',
    accessorKey: 'businessType',
    header: () => <RecordTable.InlineHead icon={IconBriefcase} label={t('field.businessType') || 'Business Type'} />,
    cell: ({ row }) => <TextCell value={row.original.businessType ?? ''} />,
    size: 150,
  },
  {
    id: 'website',
    accessorKey: 'website',
    header: () => <RecordTable.InlineHead icon={IconWorld} label={t('field.website') || 'Website'} />,
    cell: ({ row }) => <TextCell value={row.original.website ?? ''} />,
    size: 200,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead icon={IconTags} label={t('tags')} />,
    cell: function TagsCell({ row }) {
      const edit = useCompanyEdit();

      return (
        <TagsSelect.InlineCell
          type="company"
          mode="multiple"
          scope={`${SCOPE}.${row.original.id}.Tags`}
          value={row.original.tagIds}
          onValueChange={(tagIds) => edit.mutate({ id: row.original.id, tagIds })}
        />
      );
    },
    size: 300,
  },
];

/** The company columns plus one per custom field. */
export const useCompaniesColumns = (state: 'lead' | 'customer' = 'customer') => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { fields } = useFields('company');

  return useMemo(
    () => withLifecycleColumns<Company>(createCompanyColumns(t), 'primaryName', 'company', state === 'lead', customFieldColumns<Company>(fields, useCompanyFieldsSave, SCOPE)),
    [fields, t, state],
  );
};
