import type { Company, CompanyInput } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { patchCachedRecord, removeCachedRecords, useCursorList } from '~/lib/cursorList';
import { useAdvancedFilterParam } from '../views/useViews';

export const COMPANIES_KEY = ['companies'];
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
    queryKey: [...COMPANIES_KEY, 'list', filters],
    sessionKey: state === 'lead' ? 'core_company_leads_cursor' : COMPANIES_SESSION_KEY,
    fetchPage: (params) => api.companies.list({ ...params, ...filters }),
  });
};

export const useCompany = (id: string | null) =>
  useQuery({
    queryKey: [...COMPANIES_KEY, 'detail', id],
    queryFn: () => api.companies.get({ id: id! }),
    enabled: !!id,
  });

export const useCompanyEdit = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...body }: CompanyInput & { id: string }) => api.companies.update({ id, ...body }),
    onSuccess: (company, input) => {
      patchCachedRecord(client, COMPANIES_KEY, company);
      client.setQueryData([...COMPANIES_KEY, 'detail', company.id], company);

      // Lead ↔ customer moves it to the other list.
      if (input.state) void client.invalidateQueries({ queryKey: [...COMPANIES_KEY, 'list'] });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not save the company', description: messageOf(error) }),
  });
};

export const useCompanyCreate = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (body: CompanyInput & { primaryName: string }) => api.companies.create(body),
    onSuccess: () => client.invalidateQueries({ queryKey: [...COMPANIES_KEY, 'list'] }),
  });
};

export const useCompaniesRemove = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (ids: string[]) => api.companies.remove({ ids }),
    onSuccess: ({ removed }, ids) => {
      removeCachedRecords(client, COMPANIES_KEY, ids);
      void client.invalidateQueries({ queryKey: [...COMPANIES_KEY, 'list'] });
      toast({ variant: 'success', title: removed === 1 ? 'Company deleted' : `${removed} companies deleted` });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not delete', description: messageOf(error) }),
  });
};

export const useCompaniesTag = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: { ids: string[]; add: string[]; remove: string[] }) => api.companies.tag(input),
    onSuccess: () => client.invalidateQueries({ queryKey: COMPANIES_KEY }),
    onError: (error) => toast({ variant: 'destructive', title: 'Could not tag', description: messageOf(error) }),
  });
};

export const useCompaniesMerge = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: { ids: string[]; keepId: string }) => api.companies.merge(input),
    onSuccess: (company, input) => {
      removeCachedRecords(
        client,
        COMPANIES_KEY,
        input.ids.filter((id) => id !== company.id),
      );
      patchCachedRecord(client, COMPANIES_KEY, company);
      void client.invalidateQueries({ queryKey: COMPANIES_KEY });
      toast({ variant: 'success', title: 'Companies merged' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not merge', description: messageOf(error) }),
  });
};
