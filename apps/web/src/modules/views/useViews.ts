import type { FilterField, View, ViewListType, ViewRecordType } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan, useSession } from '~/modules/auth/session';
import { isPluginList, listQuery } from './viewLinks';

/** Amounts stored in the currency's smallest unit, shown and typed in the organisation's currency. */
const MONEY_PATHS: Partial<Record<ViewRecordType, string[]>> = { product: ['subject.price'] };

/** Whose tags a list's filter picks from. */
export const subjectOf = (recordType: ViewRecordType) =>
  recordType === 'product'
    ? null
    : recordType === 'company' || recordType === 'company_lead'
      ? 'company'
      : 'customer';

/** Sharing a view with the team needs the list's edit permission. */
export const useCanShareViews = (recordType: ViewListType) => {
  const can = useCan();

  // Any member may share a plugin's list: its API decides what the list shows.
  if (isPluginList(recordType)) return true;

  return can(recordType === 'product' ? 'products.manage' : 'contacts.edit');
};

/** The advanced filter, the selected view and the search, all kept in the address (shareable, survive reloads). */
export const useListQuery = () => {
  const [{ advanced, view, searchValue }, setQueries] = useQueryStates(listQuery, {
    history: 'replace',
  });

  return {
    advanced: advanced?.rules.length ? advanced : null,
    viewId: view,
    search: searchValue,
    /** Opens a view: its filter and search replace the current ones. */
    openView: (target: View | null) =>
      void setQueries({
        view: target?.id ?? null,
        advanced: target?.filter?.rules.length ? target.filter : null,
        searchValue: target?.search ?? null,
      }),
  };
};

/** Saved views of a list; one cache entry per record type. */
const viewsQuery = (recordType: ViewListType) =>
  orpc.views.list.queryOptions({ input: { recordType }, staleTime: 30_000 });

export const useViews = (recordType: ViewListType) => useQuery(viewsQuery(recordType));

export const useFilterFields = (recordType: ViewRecordType) => {
  const { currency } = useSession().organization;
  const money = MONEY_PATHS[recordType] ?? [];

  return useQuery(
    orpc.views.fields.queryOptions({
      input: { recordType },
      staleTime: 60_000,
      select: ({ data }): (FilterField & { currency?: string })[] =>
        data.map((field) => (money.includes(field.path) ? { ...field, currency } : field)),
    }),
  );
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Whether the list shows something other than the selected view (or anything, without one). */
export const useViewState = (recordType: ViewListType) => {
  const viewsList = useViews(recordType);
  const views = viewsList.data?.data ?? [];
  const query = useListQuery();
  const current = views.find((view) => view.id === query.viewId) ?? null;
  const filtered = query.advanced !== null || Boolean(query.search);

  const changed = current
    ? !same(current.filter?.rules.length ? current.filter : null, query.advanced) ||
      (current.search ?? null) !== (query.search || null)
    : filtered;

  return { views, error: viewsList.error, current, changed, filtered, query };
};

export const useViewMutations = (recordType: ViewListType) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('views');
  const { queryKey } = viewsQuery(recordType);

  // The sidebar changes at once; the refetch confirms it.
  const patch = (change: (list: View[]) => View[]) => {
    client.setQueryData(queryKey, (old) => (old ? { ...old, data: change(old.data) } : old));
    void client.invalidateQueries({ queryKey });
  };

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('save-failed'),
      description: messageOf(error),
    });

  return {
    create: useMutation(
      orpc.views.create.mutationOptions({
        onSuccess: (view) => patch((list) => [...list, view]),
        onError,
      }),
    ),
    update: useMutation(
      orpc.views.update.mutationOptions({
        onSuccess: (view) =>
          patch((list) => list.map((item) => (item.id === view.id ? view : item))),
        onError,
      }),
    ),
    remove: useMutation(
      orpc.views.remove.mutationOptions({
        onSuccess: (_result, { id }) => patch((list) => list.filter((item) => item.id !== id)),
        onError,
      }),
    ),
  };
};
