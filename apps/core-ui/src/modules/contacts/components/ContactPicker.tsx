import type { Company, Customer } from '@erxes/core-contract';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Combobox, Command, readImage, Skeleton } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { orpc } from '~/lib/api';
import { useCompany } from '../companies/useCompanies';
import { customerName, useCustomer } from '../customers/useCustomers';

/*
 * Old ui-modules SelectCustomer / SelectCompany content and ContactRecordChip,
 * on core's customers and companies lists.
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
    <Avatar className="size-4 flex-none">
      <Avatar.Image src={readImage(avatar ?? undefined)} />
      <Avatar.Fallback className="text-[10px]">{name.charAt(0)}</Avatar.Fallback>
    </Avatar>
    <span className="truncate">{name}</span>
    {/* It opens the record: say so on hover. */}
    <IconArrowUpRight className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100" />
  </button>
);

const ChipSkeleton = () => <Skeleton className="h-5 w-20 rounded-sm" />;

const CustomerChip = ({ id, onOpen }: { id: string; onOpen: () => void }) => {
  const { data: customer, isPending } = useCustomer(id);

  if (isPending) return <ChipSkeleton />;

  return (
    <RelationChip
      name={(customer && customerTitle(customer)) || id}
      avatar={customer?.avatarUrl}
      onOpen={onOpen}
    />
  );
};

const CompanyChip = ({ id, onOpen }: { id: string; onOpen: () => void }) => {
  const { data: company, isPending } = useCompany(id);

  if (isPending) return <ChipSkeleton />;

  return (
    <RelationChip
      name={(company && companyTitle(company)) || id}
      avatar={company?.avatarUrl}
      onOpen={onOpen}
    />
  );
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
}) =>
  kind === 'customer' ? (
    <CustomerChip id={id} onOpen={onOpen} />
  ) : (
    <CompanyChip id={id} onOpen={onOpen} />
  );

const useDebounced = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
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
      input,
      enabled: enabled && kind === 'customer',
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
      input,
      enabled: enabled && kind === 'company',
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

const ContactOptionItem = ({
  option,
  checked,
  placeholder,
  onSelect,
}: {
  option: IContactOption;
  checked: boolean;
  placeholder: string;
  onSelect: () => void;
}) => (
  <Command.Item value={option.id} onSelect={onSelect}>
    <Avatar className="bg-background">
      <Avatar.Image src={readImage(option.avatarUrl ?? undefined)} />
      <Avatar.Fallback>{option.name.charAt(0)}</Avatar.Fallback>
    </Avatar>
    <Combobox.Value value={option.name} placeholder={placeholder} />
    <Combobox.Check checked={checked} />
  </Command.Item>
);

/**
 * The searchable customer or company list of a picker: the selected ones
 * first, then the matches (old SelectCustomer.Content / SelectCompany.Content).
 */
export const SelectContactContent = ({
  kind,
  value,
  onValueChange,
}: {
  kind: TContactKind;
  value: string[];
  onValueChange: (ids: string[]) => void;
}) => {
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search.trim(), 500);
  const placeholder = kind === 'customer' ? 'Unnamed customer' : 'Unnamed company';

  const selected = useContactOptions(kind, { ids: value });
  const matches = useContactOptions(kind, { search: debounced });

  const toggle = (id: string) =>
    onValueChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  const selectedOptions = value.length
    ? (selected.data ?? []).filter((option) => value.includes(option.id))
    : [];

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {selectedOptions.length > 0 && (
          <>
            {selectedOptions.map((option) => (
              <ContactOptionItem
                key={option.id}
                option={option}
                checked
                placeholder={placeholder}
                onSelect={() => toggle(option.id)}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={matches.isPending} />
        {(matches.error ?? selected.error) && (
          <div role="alert" className="p-2 text-xs text-destructive">
            {(matches.error ?? selected.error)?.message}
          </div>
        )}
        {!matches.isPending &&
          (matches.data ?? [])
            .filter((option) => !value.includes(option.id))
            .map((option) => (
              <ContactOptionItem
                key={option.id}
                option={option}
                checked={false}
                placeholder={placeholder}
                onSelect={() => toggle(option.id)}
              />
            ))}
      </Command.List>
    </Command>
  );
};
