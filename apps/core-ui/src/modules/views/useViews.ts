import {
  ConditionGroup,
  type FilterField,
  type View,
  type ViewRecordType,
} from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '~/lib/api';
import { useCan, useSession } from '~/modules/auth/session';

/** A field a list filters by; money fields carry the currency their amounts are shown in. */
export type ListField = FilterField & { currency?: string };

/** Amounts stored in the currency's smallest unit, shown and typed in the organisation's currency. */
const MONEY_PATHS: Partial<Record<ViewRecordType, string[]>> = { product: ['subject.price'] };

/** Whose fields the advanced builder offers lookups (tags) for. */
export const subjectOf = (recordType: ViewRecordType) =>
  recordType === 'product'
    ? null
    : recordType === 'company' || recordType === 'company_lead'
      ? 'company'
      : 'customer';

/** Sharing a view with the team needs the list's edit permission. */
export const useCanShareViews = (recordType: ViewRecordType) =>
  useCan()(recordType === 'product' ? 'products.manage' : 'contacts.edit');

/** The advanced filter, the selected view and the search, all kept in the address (shareable, survive reloads). */
export const useListQuery = () => {
  const [{ advanced, view, searchValue }, setQueries] = useMultiQueryState({
    advanced: ConditionGroup,
    view: z.string(),
    searchValue: z.string(),
  });

  return {
    advanced: advanced?.rules.length ? advanced : null,
    viewId: view,
    search: searchValue,
    setAdvanced: (next: ConditionGroup | null) =>
      setQueries({ advanced: next?.rules.length ? next : null }),
    /** Opens a view: its filter and search replace the current ones. */
    openView: (target: View | null) =>
      setQueries({
        view: target?.id ?? null,
        advanced: target?.filter?.rules.length ? target.filter : null,
        searchValue: target?.search ?? null,
      }),
  };
};

/** The list's `filter` parameter: the advanced filter as JSON. */
export const useAdvancedFilterParam = () => {
  const { advanced } = useListQuery();

  return advanced ? JSON.stringify(advanced) : undefined;
};

/** Saved views of a list; one cache entry per record type. */
const viewsQuery = (recordType: ViewRecordType) =>
  orpc.views.list.queryOptions({ input: { recordType }, staleTime: 30_000 });

export const useViews = (recordType: ViewRecordType) => useQuery(viewsQuery(recordType));

export const useFilterFields = (recordType: ViewRecordType) => {
  const { currency } = useSession().organization;
  const money = MONEY_PATHS[recordType] ?? [];

  return useQuery(
    orpc.views.fields.queryOptions({
      input: { recordType },
      staleTime: 60_000,
      select: ({ data }): ListField[] =>
        data.map((field) => (money.includes(field.path) ? { ...field, currency } : field)),
    }),
  );
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Whether the list shows something other than the selected view (or anything, without one). */
export const useViewState = (recordType: ViewRecordType) => {
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

export const useViewMutations = (recordType: ViewRecordType) => {
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
