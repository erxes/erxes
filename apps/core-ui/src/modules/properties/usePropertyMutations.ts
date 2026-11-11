import type { ContentType, FieldGroup } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { api, messageOf } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { FIELD_GROUPS_KEY, FIELDS_KEY } from './useFields';

type FieldCreate = Parameters<typeof api.fields.create>[0];

type FieldUpdate = Parameters<typeof api.fields.update>[0];

type GroupCreate = Parameters<typeof api.fieldGroups.create>[0];

type GroupUpdate = Parameters<typeof api.fieldGroups.update>[0];

/** Owners and admins manage properties (old `fieldsManage` / `fieldGroupsManage`). */
export const useCanManageFields = () => useSession().user.role !== 'member';

/** Refreshes every list a property change shows in (and records whose values went away). */
export const usePropertiesRefresh = () => {
  const client = useQueryClient();

  return (records = false) => {
    void client.invalidateQueries({ queryKey: FIELDS_KEY });
    void client.invalidateQueries({ queryKey: FIELD_GROUPS_KEY });

    if (records) {
      void client.invalidateQueries({ queryKey: ['customers'] });
      void client.invalidateQueries({ queryKey: ['companies'] });
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

export const useAddProperty = () => {
  const refresh = usePropertiesRefresh();
  const { onError } = useFeedback();

  return useMutation({
    mutationFn: (body: FieldCreate) => api.fields.create(body),
    onSuccess: () => refresh(),
    onError,
  });
};

export const useEditProperty = () => {
  const refresh = usePropertiesRefresh();
  const { onError } = useFeedback();

  return useMutation({
    mutationFn: (body: FieldUpdate) => api.fields.update(body),
    onSuccess: () => refresh(),
    onError,
  });
};

export const useAddPropertyGroup = () => {
  const client = useQueryClient();
  const { onError } = useFeedback();

  return useMutation({
    mutationFn: (body: GroupCreate) => api.fieldGroups.create(body),
    // Waits for the refetched list, so the caller can select the new group straight away.
    onSuccess: () => client.invalidateQueries({ queryKey: FIELD_GROUPS_KEY }),
    onError,
  });
};

export const useEditPropertyGroup = () => {
  const refresh = usePropertiesRefresh();
  const { onError } = useFeedback();

  return useMutation({
    mutationFn: (body: GroupUpdate) => api.fieldGroups.update(body),
    onSuccess: () => refresh(),
    onError,
  });
};

/** What the remove dialog is about; from Archived it can only be deleted. */
export type TArchiveTarget = ({ kind: 'fields'; ids: string[] } | { kind: 'group'; id: string }) & {
  label: string;
  archived?: boolean;
};

/** Whether records hold values of the target's fields (`removable` when none do). */
export const useFieldUsage = (target: TArchiveTarget | null) => {
  const { data, isFetching, error } = useQuery({
    queryKey: [...FIELDS_KEY, 'usage', target],
    queryFn: () =>
      target?.kind === 'group'
        ? api.fields.usage({ groupId: target.id })
        : api.fields.usage({ ids: (target?.ids ?? []).join(',') }),
    enabled: !!target,
    staleTime: 0,
    gcTime: 0,
  });

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
      if (target.kind === 'group') await api.fieldGroups.archive({ id: target.id });
      else await api.fields.archive({ ids: target.ids });
    },
    onError,
  });

  // The server checks again; the dialog's answer may be stale by now.
  const remove = useMutation({
    mutationFn: (target: TArchiveTarget) =>
      target.kind === 'group'
        ? api.fieldGroups.remove({ id: target.id })
        : api.fields.removeUnused({ ids: target.ids }),
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
      if (kind === 'group') await api.fieldGroups.restore({ id });
      else await api.fields.restore({ id });
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
export const useReorder = (kind: 'fields' | 'groups', contentType: ContentType) => {
  const client = useQueryClient();
  const refresh = usePropertiesRefresh();
  const { onError } = useFeedback();

  return useMutation({
    mutationFn: (orders: { id: string; order: number }[]) =>
      kind === 'groups' ? api.fieldGroups.reorder({ orders }) : api.fields.reorder({ orders }),
    onMutate: (orders) => {
      if (kind !== 'groups') return;

      const key = [...FIELD_GROUPS_KEY, contentType, { archived: false }];
      const byId = new Map(orders.map((item) => [item.id, item.order]));

      client.setQueryData<{ data: FieldGroup[] }>(
        key,
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
