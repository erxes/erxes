import type { Company } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { messageOf, orpc } from '~/lib/api';
import { patchCachedRecord, removeCachedRecords, useCursorList } from '~/lib/cursorList';
import { useAdvancedFilterParam } from '../views/useViews';

export const COMPANIES_SESSION_KEY = 'core_companies_cursor';

type CompanyState = 'lead' | 'customer';

/** The list filters, read from the URL; `state` splits companies that are customers from company leads. */
export const useCompaniesFilters = (state: CompanyState = 'customer') => {
  const [{ searchValue, tags, ownerId, stage }] = useMultiQueryState<{
    searchValue: string;
    tags: string[];
    ownerId: string;
    stage: string;
  }>(['searchValue', 'tags', 'ownerId', 'stage']);

  const filter = useAdvancedFilterParam();

  return {
    state,
    filter,
    search: searchValue || undefined,
    tagIds: tags?.length ? tags.join(',') : undefined,
    ownerId: ownerId || undefined,
    leadStageId: state === 'lead' ? stage || undefined : undefined,
  };
};

export const useCompanies = (state: CompanyState = 'customer') => {
  const filters = useCompaniesFilters(state);

  return useCursorList<Company>({
    sessionKey: state === 'lead' ? 'core_company_leads_cursor' : COMPANIES_SESSION_KEY,
    filters,
    options: (paging) =>
      orpc.companies.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters }),
        ...paging,
      }),
  });
};

export const useCompany = (id: string | null) =>
  useQuery(orpc.companies.get.queryOptions({ input: { id: id ?? '' }, enabled: !!id }));

export const useCompanyEdit = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.companies.update.mutationOptions({
      onSuccess: (company, input) => {
        patchCachedRecord(client, orpc.companies.list.key(), company);
        client.setQueryData(orpc.companies.get.queryKey({ input: { id: company.id } }), company);

        // Lead ↔ customer moves it to the other list.
        if (input.state) void client.invalidateQueries({ queryKey: orpc.companies.list.key() });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Could not save the company',
          description: messageOf(error),
        }),
    }),
  );
};

/** Callers show the failure next to the field it is about (`COMPANY_EXISTS`). */
export const useCompanyCreate = () => {
  const client = useQueryClient();

  return useMutation(
    orpc.companies.create.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.companies.list.key() }),
    }),
  );
};

export const useCompaniesRemove = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.companies.remove.mutationOptions({
      onSuccess: ({ removed }, { ids }) => {
        removeCachedRecords(client, orpc.companies.list.key(), ids);
        void client.invalidateQueries({ queryKey: orpc.companies.list.key() });
        toast({
          variant: 'success',
          title: removed === 1 ? 'Company deleted' : `${removed} companies deleted`,
        });
      },
      onError: (error) =>
        toast({ variant: 'destructive', title: 'Could not delete', description: messageOf(error) }),
    }),
  );
};

export const useCompaniesTag = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.companies.tag.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.companies.key() }),
      onError: (error) =>
        toast({ variant: 'destructive', title: 'Could not tag', description: messageOf(error) }),
    }),
  );
};

export const useCompaniesMerge = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.companies.merge.mutationOptions({
      onSuccess: (company, input) => {
        removeCachedRecords(
          client,
          orpc.companies.list.key(),
          input.ids.filter((id) => id !== company.id),
        );
        patchCachedRecord(client, orpc.companies.list.key(), company);
        void client.invalidateQueries({ queryKey: orpc.companies.key() });
        toast({ variant: 'success', title: 'Companies merged' });
      },
      onError: (error) =>
        toast({ variant: 'destructive', title: 'Could not merge', description: messageOf(error) }),
    }),
  );
};
