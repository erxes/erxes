import { skipToken, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Combobox } from '../../components/combobox';
import { Popover } from '../../components/popover';
import { EntityPicker } from './EntityPicker';
import {
  type CompanyContact,
  companyTitle,
  type ContactSearchQueries,
  type CustomerContact,
  customerTitle,
} from '../records/contacts';
import { type ProductChoice, type ProductSearchQueries, productTitle } from '../records/products';
import { type Member, type MemberQueries, memberName } from './members';

/** A tag as the pickers show one: core's `Tag` has these fields and more. */
export interface Tag {
  id: string;
  name: string;
}

/**
 * TanStack query options for the tags of one record type.
 * In erxes, web's query for `orpc.tags.list` with the type (`{ type: 'customer' }`).
 */
export type TagsQuery = RowsQuery<Tag>;

type LookupOptions = {
  options: { value: string; label: string }[];
  loading: boolean;
  error: Error | null;
};

type RowsQuery<T> = UseQueryOptions<{ data: T[] }, Error, { data: T[] }>;

const useLookup = <T,>(
  query: RowsQuery<T> | undefined,
  enabled: boolean,
  option: (row: T) => { value: string; label: string },
): LookupOptions => {
  // A lookup the screen didn't give: no options, no request.
  const options: RowsQuery<T> = query
    ? { ...query, enabled }
    : { queryKey: ['erxes-ui', 'no-lookup'], queryFn: skipToken };

  const result = useQuery(options);
  const rows = useMemo(() => (result.data?.data ?? []).map(option), [result.data, option]);

  return { options: rows, loading: enabled && !!query && result.isPending, error: result.error };
};

const memberOption = (member: Member) => ({
  value: member.id,
  label: memberName(member),
});

const tagOption = (tag: Tag) => ({ value: tag.id, label: tag.name });

/**
 * The active team members as picker options.
 * It adds the `picked` members outside it (a disabled member a filter still names), so their
 * names show; none without `members`.
 */
export const useMemberOptions = (
  members: MemberQueries | undefined,
  enabled = true,
  picked: readonly string[] = [],
) => {
  const team = useLookup(members?.team, enabled, memberOption);
  const known = new Set(team.options.map((option) => option.value));

  const missing = [...new Set(picked)]
    .filter((id) => id !== 'me' && !known.has(id))
    .toSorted((a, b) => a.localeCompare(b));

  const others = useLookup(
    members && missing.length ? members.byIds(missing) : undefined,
    enabled && !team.loading && missing.length > 0,
    memberOption,
  );

  return { ...team, options: [...team.options, ...others.options] };
};

const customerOption = (customer: CustomerContact) => ({
  value: customer.id,
  label: customerTitle(customer) || customer.id,
});

const companyOption = (company: CompanyContact) => ({
  value: company.id,
  label: companyTitle(company) || company.id,
});

/** Several lookups' options as one list, each id once (the first lookup's label wins). */
const mergedLookups = (lookups: LookupOptions[]): LookupOptions => {
  const options = new Map(
    lookups.flatMap((lookup) => lookup.options).map((row) => [row.value, row] as const),
  );

  return {
    options: [...options.values()],
    loading: lookups.some((lookup) => lookup.loading),
    error: lookups.find((lookup) => lookup.error)?.error ?? null,
  };
};

/**
 * Customers or companies matching `search` as picker options.
 * The `picked` ones come first so their names show whatever is searched; none without
 * `contacts` or a `type`.
 */
export const useContactOptions = (
  contacts: ContactSearchQueries | undefined,
  type: 'customer' | 'company' | null,
  picked: readonly string[] = [],
  search = '',
): LookupOptions => {
  const ids = [...new Set(picked)].toSorted((a, b) => a.localeCompare(b));
  const input = { search: search.trim() || undefined };
  const customers = type === 'customer' ? contacts?.customers : undefined;
  const companies = type === 'company' ? contacts?.companies : undefined;
  const byIds = ids.length > 0;

  const lookups = [
    useLookup(customers && byIds ? customers({ ids }) : undefined, byIds, customerOption),
    useLookup(companies && byIds ? companies({ ids }) : undefined, byIds, companyOption),
    useLookup(customers?.(input), true, customerOption),
    useLookup(companies?.(input), true, companyOption),
  ];

  return mergedLookups(lookups);
};

const productOption = (product: ProductChoice) => ({
  value: product.id,
  label: productTitle(product),
});

/**
 * Products matching `search` as picker options, the `picked` ones first.
 * Picked ones come first so their names show whatever is searched; none without `products`.
 */
export const useProductOptions = (
  products: ProductSearchQueries | undefined,
  enabled: boolean,
  picked: readonly string[] = [],
  search = '',
): LookupOptions => {
  const ids = [...new Set(picked)].toSorted((a, b) => a.localeCompare(b));
  const on = enabled ? products : undefined;

  const lookups = [
    useLookup(on && ids.length ? on.byIds(ids) : undefined, ids.length > 0, productOption),
    useLookup(on?.search(search.trim() || undefined), true, productOption),
  ];

  return mergedLookups(lookups);
};

/** A record type's tags as picker options; none without `tags`. */
export const useTagOptions = (tags: TagsQuery | undefined, enabled = true) =>
  useLookup(tags, enabled, tagOption);

/** A button that picks members or tags, one or several with `multiple`. */
export const LookupPicker = ({
  lookup: { options, loading, error },
  value,
  onValueChange,
  multiple,
  placeholder,
  disabled,
  className,
  onSearchChange,
}: {
  lookup: LookupOptions;
  value: string[];
  onValueChange: (values: string[]) => void;
  multiple?: boolean;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  onSearchChange?: (search: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  // A picked id that no longer loads (a deleted tag, a member past the first page) stays as a
  // row under its id, so it can still be unpicked.
  const missing = value
    .filter((id) => !options.some((option) => option.value === id))
    .map((id) => ({ value: id, label: id }));

  const items = [...missing, ...options];
  const labels = value.map((id) => items.find((option) => option.value === id)?.label ?? id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger disabled={disabled} className={className}>
        <Combobox.Value value={labels.join(', ')} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <EntityPicker
          multiple={multiple}
          items={items}
          itemKey={(option) => ({ id: option.value, label: option.label })}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);

            if (!multiple) setOpen(false);
          }}
          loading={loading}
          error={error}
          onSearchChange={onSearchChange}
        />
      </Combobox.Content>
    </Popover>
  );
};
