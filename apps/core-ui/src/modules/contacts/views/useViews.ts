import type { ConditionGroup, View, ViewRecordType } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMultiQueryState, useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';

export const viewsKey = (recordType: ViewRecordType) => ['views', recordType];

/** The advanced filter, the selected view and the search, all kept in the address (shareable, survive reloads). */
export const useListQuery = () => {
  const [{ advanced, view, searchValue }, setQueries] = useMultiQueryState<{ advanced: ConditionGroup; view: string; searchValue: string }>([
    'advanced',
    'view',
    'searchValue',
  ]);

  return {
    advanced: advanced && Array.isArray(advanced.rules) && advanced.rules.length ? advanced : null,
    viewId: view,
    search: searchValue,
    setAdvanced: (next: ConditionGroup | null) => setQueries({ advanced: next?.rules.length ? next : null }),
    /** Opens a view: its filter and search replace the current ones. */
    openView: (target: View | null) =>
      setQueries({ view: target?.id ?? null, advanced: target?.filter?.rules.length ? target.filter : null, searchValue: target?.search ?? null }),
  };
};

/** The list's `filter` parameter: the advanced filter as JSON. */
export const useAdvancedFilterParam = () => {
  const { advanced } = useListQuery();

  return advanced ? JSON.stringify(advanced) : undefined;
};

export const useViews = (recordType: ViewRecordType) =>
  useQuery({ queryKey: viewsKey(recordType), queryFn: () => api.views.list({ recordType }), staleTime: 30_000 }).data?.data ?? [];

export const useFilterFields = (recordType: ViewRecordType) =>
  useQuery({ queryKey: ['views', 'fields', recordType], queryFn: () => api.views.fields({ recordType }), staleTime: 60_000 }).data?.data;

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Whether the list shows something other than the selected view (or anything, without one). */
export const useViewState = (recordType: ViewRecordType) => {
  const views = useViews(recordType);
  const query = useListQuery();
  const current = views.find((view) => view.id === query.viewId) ?? null;
  const filtered = Boolean(query.advanced || query.search);
  const changed = current ? !same(current.filter?.rules.length ? current.filter : null, query.advanced) || (current.search ?? null) !== (query.search || null) : filtered;

  return { views, current, changed, filtered, query };
};

export const useViewMutations = (recordType: ViewRecordType) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const refresh = () => void client.invalidateQueries({ queryKey: viewsKey(recordType) });
  // The sidebar changes at once; the refetch confirms it.
  const patch = (change: (list: View[]) => View[]) => {
    client.setQueryData<{ data: View[] }>(viewsKey(recordType), (old) => (old ? { data: change(old.data) } : old));
    refresh();
  };
  const onError = (error: unknown) => toast({ variant: 'destructive', title: 'Could not save the view', description: messageOf(error) });

  return {
    create: useMutation({
      mutationFn: (input: { name: string; filter: ConditionGroup | null; search: string | null; shared: boolean }) => api.views.create({ recordType, ...input }),
      onSuccess: (view) => patch((list) => [...list, view]),
      onError,
    }),
    update: useMutation({
      mutationFn: (input: { id: string; name?: string; filter?: ConditionGroup | null; search?: string | null; shared?: boolean }) => api.views.update(input),
      onSuccess: (view) => patch((list) => list.map((item) => (item.id === view.id ? view : item))),
      onError,
    }),
    remove: useMutation({ mutationFn: (id: string) => api.views.remove({ id }), onSuccess: (_result, id) => patch((list) => list.filter((item) => item.id !== id)), onError }),
  };
};
