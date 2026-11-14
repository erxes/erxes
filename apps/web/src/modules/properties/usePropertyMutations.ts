import type { FieldContentType } from '@erxes/core-contract';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { fieldGroupsQuery } from './useFields';

/** Owners and admins manage properties. */
export const useCanManageFields = () => useCan()('properties.manage');

/** Refreshes every list a property change shows in (and records whose values went away). */
const usePropertiesRefresh = () => {
  const client = useQueryClient();

  return (records = false) => {
    void client.invalidateQueries({ queryKey: orpc.fields.key() });
    void client.invalidateQueries({ queryKey: orpc.fieldGroups.key() });

    if (records) {
      void client.invalidateQueries({ queryKey: orpc.customers.key() });
      void client.invalidateQueries({ queryKey: orpc.companies.key() });
    }
  };
};

const useFeedback = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { toast } = useToast();

  return {
    t,
    success: (title: string) => toast({ title, variant: 'success' }),
    onError: (error: unknown) =>
      toast({ title: t('error', 'Error'), description: messageOf(error), variant: 'destructive' }),
  };
};

/** Refresh on success, a toast on failure: what every property save does. */
const useSaveHandlers = () => {
  const refresh = usePropertiesRefresh();
  const { onError } = useFeedback();

  return { onSuccess: () => refresh(), onError };
};

export const useAddProperty = () =>
  useMutation(orpc.fields.create.mutationOptions(useSaveHandlers()));

export const useEditProperty = () =>
  useMutation(orpc.fields.update.mutationOptions(useSaveHandlers()));

export const useAddPropertyGroup = () =>
  useMutation(orpc.fieldGroups.create.mutationOptions(useSaveHandlers()));

export const useEditPropertyGroup = () =>
  useMutation(orpc.fieldGroups.update.mutationOptions(useSaveHandlers()));

/** What the remove dialog is about; from Archived it can only be deleted. */
export type TArchiveTarget = ({ kind: 'fields'; ids: string[] } | { kind: 'group'; id: string }) & {
  label: string;
  archived?: boolean;
};

/** Whether records hold values of the target's fields (`removable` when none do). */
export const useFieldUsage = (target: TArchiveTarget | null) => {
  const { data, isFetching, error } = useQuery(
    orpc.fields.usage.queryOptions({
      input: !target
        ? skipToken
        : target.kind === 'group'
          ? { groupId: target.id }
          : { ids: target.ids.join(',') },
      staleTime: 0,
      gcTime: 0,
    }),
  );

  return { usage: error ? undefined : data, loading: isFetching, failed: !!error };
};

export const usePropertyArchive = () => {
  const refresh = usePropertiesRefresh();
  const { onError, success, t } = useFeedback();

  const done = (title: string, onDone: () => void) => () => {
    refresh(true);
    success(title);
    onDone();
  };

  const archive = useMutation({
    mutationFn: async (target: TArchiveTarget) => {
      if (target.kind === 'group') await orpc.fieldGroups.archive.call({ id: target.id });
      else await orpc.fields.archive.call({ ids: target.ids });
    },
    onError,
  });

  // The server checks again; the dialog's answer may be stale by now.
  const remove = useMutation({
    mutationFn: (target: TArchiveTarget) =>
      target.kind === 'group'
        ? orpc.fieldGroups.remove.call({ id: target.id })
        : orpc.fields.removeUnused.call({ ids: target.ids }),
    onError,
  });

  return {
    archive: (target: TArchiveTarget, onDone: () => void) =>
      archive.mutate(target, { onSuccess: done(t('archived', 'Archived'), onDone) }),
    remove: (target: TArchiveTarget, onDone: () => void) =>
      remove.mutate(target, { onSuccess: done(t('deleted', 'Deleted'), onDone) }),
    loading: archive.isPending || remove.isPending,
  };
};

export const usePropertyRestore = () => {
  const refresh = usePropertiesRefresh();
  const { onError, success, t } = useFeedback();

  const restore = useMutation({
    mutationFn: async ({ kind, id }: { kind: 'field' | 'group'; id: string }) => {
      if (kind === 'group') await orpc.fieldGroups.restore.call({ id });
      else await orpc.fields.restore.call({ id });
    },
    onSuccess: () => {
      refresh(true);
      success(t('restored', 'Restored'));
    },
    onError,
  });

  return {
    restoreField: (id: string) => restore.mutate({ kind: 'field', id }),
    restoreGroup: (id: string) => restore.mutate({ kind: 'group', id }),
    loading: restore.isPending,
  };
};

/** Saves a new order (optimistically): `orders` are the moved items' new positions. */
export const useReorder = (kind: 'fields' | 'groups', contentType: FieldContentType) => {
  const client = useQueryClient();
  const refresh = usePropertiesRefresh();
  const { onError } = useFeedback();

  return useMutation({
    mutationFn: (orders: { id: string; order: number }[]) =>
      kind === 'groups'
        ? orpc.fieldGroups.reorder.call({ orders })
        : orpc.fields.reorder.call({ orders }),
    onMutate: (orders) => {
      if (kind !== 'groups') return;

      const byId = new Map(orders.map((item) => [item.id, item.order]));

      client.setQueryData(
        fieldGroupsQuery(contentType).queryKey,
        (data) =>
          data && {
            data: data.data
              .map((group) => ({ ...group, order: byId.get(group.id) ?? group.order }))
              .toSorted((a, b) => a.order - b.order),
          },
      );
    },
    onSettled: () => refresh(),
    onError,
  });
};
