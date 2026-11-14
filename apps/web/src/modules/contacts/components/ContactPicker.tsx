import type { Company, Customer } from '@erxes/core-contract';
import { IconArrowUpRight } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { Avatar, Combobox, EntityPicker, Popover, readImage, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useCompany } from '../companies/useCompanies';
import { customerName, useCustomer } from '../customers/useCustomers';

/*
 * Customer and company pickers and the record chip, on core's customers and
 * companies lists.
 */

export type TContactKind = 'customer' | 'company';

/** What a customer reads as: its name, else its email or phone. */
export const customerTitle = (
  customer: Pick<
    Customer,
    'firstName' | 'middleName' | 'lastName' | 'primaryEmail' | 'primaryPhone'
  >,
) => customerName(customer) || customer.primaryEmail || customer.primaryPhone || '';

export const companyTitle = (
  company: Pick<Company, 'primaryName' | 'primaryEmail' | 'primaryPhone'>,
) => company.primaryName || company.primaryEmail || company.primaryPhone || '';

interface IContactOption {
  id: string;
  name: string;
  avatarUrl: string | null;
}

// One linked record: its avatar and name; clicking opens it in the panel.
const RelationChip = ({
  name,
  avatar,
  onOpen,
}: {
  name: string;
  avatar?: string | null;
  onOpen: () => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    title={name}
    data-panel-inline=""
    className="group/chip inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Avatar size="sm" className="size-4 flex-none">
      <Avatar.Image src={readImage(avatar ?? undefined)} />
      <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
    </Avatar>
    <span className="truncate">{name}</span>
    {/* It opens the record: say so on hover. */}
    <IconArrowUpRight className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100" />
  </button>
);

/** A linked customer's or company's title and avatar. */
const useContactRecord = (kind: TContactKind, id: string) => {
  const customer = useCustomer(kind === 'customer' ? id : null);
  const company = useCompany(kind === 'company' ? id : null);

  if (kind === 'customer') {
    return {
      title: customer.data && customerTitle(customer.data),
      avatar: customer.data?.avatarUrl,
      isPending: customer.isPending,
      error: customer.error,
    };
  }

  return {
    title: company.data && companyTitle(company.data),
    avatar: company.data?.avatarUrl,
    isPending: company.isPending,
    error: company.error,
  };
};

// A linked customer or company as a chip; clicking it calls `onOpen`.
export const ContactRecordChip = ({
  kind,
  id,
  onOpen,
}: {
  kind: TContactKind;
  id: string;
  onOpen: () => void;
}) => {
  const record = useContactRecord(kind, id);

  if (record.isPending) return <Skeleton radius="sm" className="h-5 w-20" />;

  return <RelationChip name={record.title || id} avatar={record.avatar} onOpen={onOpen} />;
};

/** A customer's or company's title, or why it could not be read. */
const ContactTitle = ({ kind, id }: { kind: TContactKind; id: string }) => {
  const record = useContactRecord(kind, id);

  if (record.error) {
    return <span className="truncate text-destructive">{messageOf(record.error)}</span>;
  }

  return <Combobox.Value value={record.title || id} loading={record.isPending} />;
};

/** Up to 20 customers or companies: those matching `search`, or the ones with `ids`. */
const useContactOptions = (
  kind: TContactKind,
  { search, ids }: { search?: string; ids?: string[] },
) => {
  const input = { limit: 20, search: search || undefined, ids: ids?.join(',') };
  const enabled = !ids || ids.length > 0;

  const customers = useQuery(
    orpc.customers.list.queryOptions({
      input: enabled && kind === 'customer' ? input : skipToken,
      placeholderData: (previous) => previous,
      select: (page): IContactOption[] =>
        page.data.map((customer) => ({
          id: customer.id,
          name: customerTitle(customer),
          avatarUrl: customer.avatarUrl,
        })),
    }),
  );

  const companies = useQuery(
    orpc.companies.list.queryOptions({
      input: enabled && kind === 'company' ? input : skipToken,
      placeholderData: (previous) => previous,
      select: (page): IContactOption[] =>
        page.data.map((company) => ({
          id: company.id,
          name: companyTitle(company),
          avatarUrl: company.avatarUrl,
        })),
    }),
  );

  return kind === 'customer' ? customers : companies;
};

/**
 * The searchable customer or company list of a picker: the selected ones
 * first, then the matches, searched on the server.
 */
export const SelectContactContent = ({
  kind,
  value,
  onValueChange,
  multiple = true,
  noneLabel,
}: {
  kind: TContactKind;
  value: string[];
  onValueChange: (ids: string[]) => void;
  multiple?: boolean;
  noneLabel?: string;
}) => {
  const [search, setSearch] = useState('');
  const [debounced] = useDebounce(search.trim(), 500);
  const placeholder = kind === 'customer' ? 'Unnamed customer' : 'Unnamed company';

  const selected = useContactOptions(kind, { ids: value });
  const matches = useContactOptions(kind, { search: debounced });

  const found = matches.data ?? [];

  // The picked ones the search did not find stay listed.
  const items = [
    ...(selected.data ?? []).filter(
      (option) => value.includes(option.id) && !found.some((match) => match.id === option.id),
    ),
    ...found,
  ];

  return (
    <EntityPicker
      multiple={multiple}
      noneLabel={noneLabel}
      items={items}
      itemKey={(option) => ({ id: option.id, label: option.name })}
      renderItem={(option) => (
        <>
          <Avatar>
            <Avatar.Image src={readImage(option.avatarUrl ?? undefined)} />
            <Avatar.Fallback>{option.name.charAt(0)}</Avatar.Fallback>
          </Avatar>
          <Combobox.Value value={option.name} placeholder={placeholder} />
        </>
      )}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setSearch}
      loading={matches.isPending}
      error={matches.error ?? selected.error}
    />
  );
};

/** One customer or company on a button; `noneLabel` shows while there is none and clears it. */
export const ContactSelect = ({
  kind,
  id,
  value,
  onValueChange,
  noneLabel,
}: {
  kind: TContactKind;
  id?: string;
  value: string | undefined;
  onValueChange: (id: string | undefined) => void;
  noneLabel: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger id={id} className="w-full">
        {value ? (
          <ContactTitle kind={kind} id={value} />
        ) : (
          <Combobox.Value placeholder={noneLabel} />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectContactContent
          kind={kind}
          multiple={false}
          noneLabel={noneLabel}
          value={value ? [value] : []}
          onValueChange={([next]) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};
