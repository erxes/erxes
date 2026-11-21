import type { DataExtensionFieldGroup } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconDots, IconEdit, IconFolder, IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, DropdownMenu } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { groupsQuery, useRefreshDataModel } from '../../dataQueries';
import { useDataErrorToast } from '../../useDataErrors';
import { ArchiveItem, RemoveItem } from '../menuItems';
import { SortableList, SortableRow } from '../SortableList';
import { GroupSheet } from './GroupSheet';

const GroupMenu = ({ group, onEdit }: { group: DataExtensionFieldGroup; onEdit: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'groups' });
  const refresh = useRefreshDataModel();
  const failed = useDataErrorToast();
  const handlers = { onSuccess: () => void refresh(), onError: (error: Error) => failed(error) };
  const archive = useMutation(orpc.dataFieldGroups.archive.mutationOptions(handlers));
  const restore = useMutation(orpc.dataFieldGroups.restore.mutationOptions(handlers));
  const remove = useMutation(orpc.dataFieldGroups.remove.mutationOptions(handlers));
  const archived = Boolean(group.archivedAt);
  const input = { id: group.id };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        aria-label={t('actions', 'Actions for {{label}}', { label: group.label })}
        render={<Button variant="ghost" size="icon" />}
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-52">
        {!archived && (
          <DropdownMenu.Item onClick={onEdit}>
            <IconEdit />
            {t('edit-short', 'Edit')}
          </DropdownMenu.Item>
        )}
        <ArchiveItem
          archived={archived}
          onArchive={() => archive.mutate(input)}
          onRestore={() => restore.mutate(input)}
        />
        <RemoveItem
          message={t('remove-confirm', 'Delete the group {{label}}?', { label: group.label })}
          onRemove={() => remove.mutate(input)}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const GroupRow = ({ group, sortable }: { group: DataExtensionFieldGroup; sortable: boolean }) => {
  const { t } = useTranslation('data', { keyPrefix: 'groups' });
  const [editing, setEditing] = useState(false);
  const limited = Object.values(group.appliesTo).some((ids) => ids.length);

  return (
    <SortableRow id={group.id} label={group.label} sortable={sortable}>
      <IconFolder className="size-4 shrink-0 text-muted-foreground" />
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left text-sm"
        disabled={!sortable}
        onClick={() => setEditing(true)}
      >
        {group.label} <span className="text-xs text-muted-foreground">{group.code}</span>
      </button>
      {limited && <Badge variant="info">{t('limited', 'Some records')}</Badge>}
      {group.archivedAt && <Badge variant="muted">{t('archived', 'Archived')}</Badge>}
      <GroupMenu group={group} onEdit={() => setEditing(true)} />
      <GroupSheet
        recordType={group.recordType}
        group={group}
        open={editing}
        onOpenChange={setEditing}
      />
    </SortableRow>
  );
};

/** The active groups, dragged into the order records show them in. */
const SortableGroups = ({
  recordType,
  groups,
}: {
  recordType: string;
  groups: DataExtensionFieldGroup[];
}) => {
  const client = useQueryClient();
  const failed = useDataErrorToast();
  const key = groupsQuery(recordType).queryKey;

  const reorder = useMutation(
    orpc.dataFieldGroups.reorder.mutationOptions({
      onSuccess: (data) => client.setQueryData(key, data),
      onError: (error) => {
        failed(error);
        void client.invalidateQueries({ queryKey: key });
      },
    }),
  );

  return (
    <SortableList
      items={groups}
      labelOf={(group) => group.label}
      onReorder={(next) => {
        client.setQueryData(key, { data: next });
        reorder.mutate({ recordType, ids: next.map((group) => group.id) });
      }}
    >
      {groups.map((group) => (
        <GroupRow key={group.id} group={group} sortable />
      ))}
    </SortableList>
  );
};

/**
 * A record type's field groups: the sections its fields show under on each record. Add one,
 * rename it, drag them into order, archive (its fields hide with it) or delete an empty one.
 */
export const GroupList = ({ recordType }: { recordType: string }) => {
  const { t } = useTranslation('data', { keyPrefix: 'groups' });
  const [adding, setAdding] = useState(false);
  const active = useQuery(groupsQuery(recordType));
  const archived = useQuery(groupsQuery(recordType, true));

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t('title', 'Groups')}</h2>
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <IconPlus />
          {t('add', 'Add group')}
        </Button>
      </div>
      <QueryState
        query={active}
        isEmpty={({ data }) => !data.length}
        empty={
          <p className="text-sm text-muted-foreground">
            {t('empty', 'No groups yet: fields show under one untitled section.')}
          </p>
        }
      >
        {({ data }) => <SortableGroups recordType={recordType} groups={data} />}
      </QueryState>
      <QueryState query={archived} isEmpty={({ data }) => !data.length}>
        {({ data }) => (
          <ul className="flex flex-col gap-1">
            {data.map((group) => (
              <GroupRow key={group.id} group={group} sortable={false} />
            ))}
          </ul>
        )}
      </QueryState>
      <GroupSheet recordType={recordType} open={adding} onOpenChange={setAdding} />
    </section>
  );
};
