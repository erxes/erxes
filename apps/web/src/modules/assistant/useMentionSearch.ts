import { type AssistantMention, type AssistantRecordType, recordLabel } from '@erxes/core-contract';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { orpc } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

const PER_TYPE = 4;

const matches = (rows: { id: string }[], type: AssistantRecordType): AssistantMention[] =>
  rows.flatMap((row) => {
    const label = recordLabel(type, row);

    return label ? [{ type, id: row.id, label }] : [];
  });

export const useMentionSearch = (query: string | null) => {
  const can = useCan();
  const search = query?.trim() ?? '';
  const open = query !== null;
  const input = { search: search || undefined, limit: PER_TYPE };
  const listed = { placeholderData: keepPreviousData };
  const contacts = open && can('contacts.view');

  const customers = useQuery(
    orpc.customers.list.queryOptions({ input, enabled: contacts, ...listed }),
  );

  const companies = useQuery(
    orpc.companies.list.queryOptions({ input, enabled: contacts, ...listed }),
  );

  const members = useQuery(
    orpc.users.list.queryOptions({
      input: { ...input, isActive: true },
      enabled: open && can('team.view'),
      ...listed,
    }),
  );

  const products = useQuery(orpc.products.list.queryOptions({ input, enabled: open, ...listed }));

  const automations = useQuery(
    orpc.automations.list.queryOptions({
      input: {},
      enabled: open && can('automations.view'),
      ...listed,
    }),
  );

  const named = search.toLowerCase();

  const options = [
    ...matches(customers.data?.data ?? [], 'customer'),
    ...matches(companies.data?.data ?? [], 'company'),
    ...matches(members.data?.data ?? [], 'member'),
    ...matches(products.data?.data ?? [], 'product'),
    ...matches(automations.data?.data ?? [], 'automation')
      .filter((option) => option.label.toLowerCase().includes(named))
      .slice(0, PER_TYPE),
  ];

  const lists = [customers, companies, members, products, automations];

  return {
    options,
    loading: lists.some((list) => list.isFetching),
    failed: lists.some((list) => list.isError),
  };
};
