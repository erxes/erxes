import type { Company, CustomValue } from '@erxes/core-contract';
import {
  IconBuilding,
  IconCalendarPlus,
  IconEdit,
  IconBuildingFactory2,
  IconLabelFilled,
  IconMail,
  IconPhone,
  IconTags,
  IconTrash,
  IconUserCircle,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Combobox,
  Command,
  EmailDisplay,
  EmailListField,
  Input,
  PhoneDisplay,
  PhoneField,
  Popover,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextField,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { type FormEvent, useMemo, useState } from 'react';
import { MemberInlineCell } from '~/components/inlineCells';
import { useSession } from '~/modules/auth/session';
import { customFieldColumns } from '~/modules/properties/customFieldColumns';
import { useFields } from '~/modules/properties/useFields';
import { TagsInlineCell } from '~/modules/tags/TagsInlineCell';
import { COMPANY_SHEET_PARAM, useCompaniesRemove, useCompanyEdit } from './useCompanies';

const SCOPE = 'core-companies-inline';

const MoreCell = ({ company }: { company: Company }) => {
  const [, setOpenId] = useQueryState<string>(COMPANY_SHEET_PARAM);
  const { user } = useSession();
  const remove = useCompaniesRemove();
  const { confirm } = useConfirm();
  const [open, setOpen] = useState(false);

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
                setOpenId(company.id);
              }}
            >
              <IconEdit /> Edit
            </Command.Item>
            {user.role !== 'member' && (
              <Command.Item
                value="delete"
                className="text-destructive"
                onSelect={() => {
                  setOpen(false);
                  void confirm({
                    message: `Delete ${company.primaryName}?`,
                    options: { okLabel: 'Delete', variants: { ok: 'destructive' } },
                  }).then(() => remove.mutate([company.id]));
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

/** The name: click the badge to open the company, elsewhere to rename it. */
export const CompanyNameCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();
  const [, setOpenId] = useQueryState<string>(COMPANY_SHEET_PARAM);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(company.primaryName);

  const save = (event?: FormEvent) => {
    event?.preventDefault();
    setOpen(false);

    if (name.trim() && name.trim() !== company.primaryName) {
      edit.mutate({ id: company.id, primaryName: name.trim() });
    } else {
      setName(company.primaryName);
    }
  };

  return (
    <PopoverScoped
      scope={`${SCOPE}.${company.id}.name`}
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setName(company.primaryName);
          setOpen(true);
        } else {
          save();
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Anchor onClick={() => setOpenId(company.id)}>{company.primaryName}</RecordTableInlineCell.Anchor>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content asChild>
        <form onSubmit={save}>
          <Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Company name" />
        </form>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const CompanyEmailsCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();
  const value = { primaryEmail: company.primaryEmail ?? '', emails: company.emails };

  return (
    <PopoverScoped scope={`${SCOPE}.${company.id}.emails`}>
      <RecordTableInlineCell.Trigger>
        <EmailDisplay {...value} maxVisible={1} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <EmailListField
          recordId={`company-${company.id}`}
          {...value}
          noValidation
          onValueChange={({ primaryEmail, emails }) =>
            edit.mutate({ id: company.id, primaryEmail: primaryEmail || null, emails })
          }
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const CompanyPhonesCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();
  const value = { primaryPhone: company.primaryPhone ?? '', phones: company.phones };

  return (
    <PopoverScoped scope={`${SCOPE}.${company.id}.phones`}>
      <RecordTableInlineCell.Trigger>
        <PhoneDisplay {...value} maxVisible={1} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <PhoneField
          recordId={`company-${company.id}`}
          {...value}
          onValueChange={({ primaryPhone, phones }) =>
            edit.mutate({ id: company.id, primaryPhone: primaryPhone || null, phones })
          }
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

type TextKey = 'website' | 'industry' | 'businessType' | 'code' | 'description';

export const CompanyTextCell = ({ company, field }: { company: Company; field: TextKey }) => {
  const edit = useCompanyEdit();

  return (
    <TextField
      scope={`${SCOPE}.${company.id}.${field}`}
      value={company[field] ?? ''}
      placeholder=""
      onSave={(value) => edit.mutate({ id: company.id, [field]: value.trim() || null })}
    />
  );
};

export const CompanySizeCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();

  return (
    <TextField
      scope={`${SCOPE}.${company.id}.size`}
      value={company.size === null ? '' : String(company.size)}
      placeholder=""
      onSave={(value) => {
        const size = Number.parseInt(value, 10);

        edit.mutate({ id: company.id, size: value.trim() && Number.isFinite(size) ? Math.max(0, size) : null });
      }}
    />
  );
};

export const CompanyTagsCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();

  return (
    <TagsInlineCell
      type="company"
      scope={`${SCOPE}.${company.id}.tags`}
      value={company.tagIds}
      onChange={(tagIds) => edit.mutate({ id: company.id, tagIds })}
    />
  );
};

export const CompanyOwnerCell = ({ company }: { company: Company }) => {
  const edit = useCompanyEdit();

  return (
    <MemberInlineCell
      scope={`${SCOPE}.${company.id}.owner`}
      value={company.ownerId}
      onSave={(ownerId) => edit.mutate({ id: company.id, ownerId })}
    />
  );
};

export const useCompanyFieldsSave = () => {
  const edit = useCompanyEdit();

  return (id: string, customFields: Record<string, CustomValue | null>) => edit.mutate({ id, customFields });
};

const companiesColumns: ColumnDef<Company>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <MoreCell company={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<Company>,
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="" />,
    cell: ({ row }) => (
      <div className="flex h-8 items-center justify-center">
        <Avatar size="lg" className="rounded-md">
          {row.original.avatarUrl && <Avatar.Image src={row.original.avatarUrl} />}
          <Avatar.Fallback className="rounded-md">{row.original.primaryName.charAt(0).toUpperCase()}</Avatar.Fallback>
        </Avatar>
      </div>
    ),
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'primaryName',
    header: () => <RecordTable.InlineHead icon={IconLabelFilled} label="Name" />,
    cell: ({ row }) => <CompanyNameCell company={row.original} />,
    size: 240,
  },
  {
    id: 'emails',
    accessorKey: 'primaryEmail',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Emails" />,
    cell: ({ row }) => <CompanyEmailsCell company={row.original} />,
    size: 240,
  },
  {
    id: 'phones',
    accessorKey: 'primaryPhone',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Phones" />,
    cell: ({ row }) => <CompanyPhonesCell company={row.original} />,
    size: 200,
  },
  {
    id: 'website',
    accessorKey: 'website',
    header: () => <RecordTable.InlineHead icon={IconWorld} label="Website" />,
    cell: ({ row }) => <CompanyTextCell company={row.original} field="website" />,
    size: 200,
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead icon={IconTags} label="Tags" />,
    cell: ({ row }) => <CompanyTagsCell company={row.original} />,
    size: 260,
  },
  {
    id: 'industry',
    accessorKey: 'industry',
    header: () => <RecordTable.InlineHead icon={IconBuildingFactory2} label="Industry" />,
    cell: ({ row }) => <CompanyTextCell company={row.original} field="industry" />,
    size: 180,
  },
  {
    id: 'size',
    accessorKey: 'size',
    header: () => <RecordTable.InlineHead icon={IconUsers} label="Employees" />,
    cell: ({ row }) => <CompanySizeCell company={row.original} />,
    size: 120,
  },
  {
    id: 'owner',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUserCircle} label="Owner" />,
    cell: ({ row }) => <CompanyOwnerCell company={row.original} />,
    size: 200,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendarPlus} label="Created" />,
    cell: ({ row }) => (
      <RelativeDateDisplay value={row.original.createdAt} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={row.original.createdAt} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];

export const useCompaniesColumns = () => {
  const { fields } = useFields('company');

  return useMemo(
    () => [...companiesColumns, ...customFieldColumns<Company>(fields, useCompanyFieldsSave, SCOPE)],
    [fields],
  );
};
