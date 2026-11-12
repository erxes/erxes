import type { ConditionGroup, View, ViewRecordType } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { messageOf, orpc } from '~/lib/api';

/** The advanced filter, the selected view and the search, all kept in the address (shareable, survive reloads). */
export const useListQuery = () => {
  const [{ advanced, view, searchValue }, setQueries] = useMultiQueryState<{
    advanced: ConditionGroup;
    view: string;
    searchValue: string;
  }>(['advanced', 'view', 'searchValue']);

  return {
    advanced: advanced && Array.isArray(advanced.rules) && advanced.rules.length ? advanced : null,
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

export const useFilterFields = (recordType: ViewRecordType) =>
  useQuery(orpc.views.fields.queryOptions({ input: { recordType }, staleTime: 60_000 }));

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Whether the list shows something other than the selected view (or anything, without one). */
export const useViewState = (recordType: ViewRecordType) => {
  const viewsList = useViews(recordType);
  const views = viewsList.data?.data ?? [];
  const query = useListQuery();
  const current = views.find((view) => view.id === query.viewId) ?? null;
  const filtered = Boolean(query.advanced || query.search);

  const changed = current
    ? !same(current.filter?.rules.length ? current.filter : null, query.advanced) ||
      (current.search ?? null) !== (query.search || null)
    : filtered;

  return { views, error: viewsList.error, current, changed, filtered, query };
};

export const useViewMutations = (recordType: ViewRecordType) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const { queryKey } = viewsQuery(recordType);

  // The sidebar changes at once; the refetch confirms it.
  const patch = (change: (list: View[]) => View[]) => {
    client.setQueryData(queryKey, (old) => (old ? { ...old, data: change(old.data) } : old));
    void client.invalidateQueries({ queryKey });
  };

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: 'Could not save the view',
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
