import type { FieldContentType } from '@erxes/core-contract';
import { IconRestore, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Collapsible, useFormat } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';
import { archiveTargetState } from '../states';
import { useAllFields, useFieldGroups } from '../useFields';
import { useCanManageFields, usePropertyRestore } from '../usePropertyMutations';

const useArchivedProperties = (contentType: FieldContentType) => {
  const { groups, error: groupsError } = useFieldGroups(contentType, { archived: true });
  const { fields, error: fieldsError } = useAllFields(contentType, { archived: true });
  const archivedGroupIds = new Set(groups.map((group) => group.id));

  return {
    error: groupsError ?? fieldsError,
    groups: groups.map((group) => ({
      ...group,
      fieldCount: fields.filter((field) => field.groupId === group.id).length,
    })),
    // Fields inside an archived group come back with it, so they list there.
    fields: fields.filter((field) => !archivedGroupIds.has(field.groupId ?? '')),
  };
};

const ArchivedRow = ({
  name,
  detail,
  archivedAt,
  disabled,
  onRestore,
  onDelete,
}: {
  name: string;
  detail?: string;
  archivedAt: string;
  disabled: boolean;
  onRestore: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();

  return (
    <div className="flex items-center gap-3 px-3 py-2 text-sm">
      <span className="font-medium">{name}</span>
      {detail && <span className="text-muted-foreground">{detail}</span>}
      <span className="ml-auto text-muted-foreground">
        {t('archived-on', 'Archived {{date}}', { date: archivedAt })}
      </span>
      {manager && (
        <>
          <Button variant="ghost" size="sm" disabled={disabled} onClick={onRestore}>
            <IconRestore />
            {t('restore', 'Restore')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            tone="destructive"
            disabled={disabled}
            onClick={onDelete}
          >
            <IconTrash />
            {t('delete', 'Delete')}
          </Button>
        </>
      )}
    </div>
  );
};

/** Archived groups and fields, restorable. */
export const PropertiesArchivedSection = ({ contentType }: { contentType: FieldContentType }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const fmt = useFormat();
  const date = (value: string | null) => (value ? fmt.date(value) : '');
  const { groups, fields, error } = useArchivedProperties(contentType);
  const { restoreField, restoreGroup, loading } = usePropertyRestore();
  const setTarget = useSetAtom(archiveTargetState);
  const total = groups.length + fields.length;

  if (error) {
    return <p className="px-2 text-sm text-destructive">{messageOf(error)}</p>;
  }

  if (!total) {
    return null;
  }

  return (
    <Collapsible className="group">
      <div className="flex items-center gap-1">
        <span className="size-7 shrink-0" />
        <Collapsible.Trigger
          render={<Button variant="secondary" tone="muted" className="w-full justify-start" />}
        >
          <Collapsible.TriggerIcon />
          {t('archived', 'Archived')}
          <Badge variant="secondary" className="ml-1">
            {total}
          </Badge>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Panel className="mt-2">
        <div className="flex flex-col divide-y rounded-md border">
          {groups.map((group) => (
            <ArchivedRow
              key={group.id}
              name={group.name}
              detail={t('archived-group-detail', 'Group · {{count}} fields', {
                count: group.fieldCount,
              })}
              archivedAt={date(group.archivedAt)}
              disabled={loading}
              onRestore={() => restoreGroup(group.id)}
              onDelete={() =>
                setTarget({ kind: 'group', id: group.id, label: `"${group.name}"`, archived: true })
              }
            />
          ))}
          {fields.map((field) => (
            <ArchivedRow
              key={field.id}
              name={field.label}
              archivedAt={date(field.archivedAt)}
              disabled={loading}
              onRestore={() => restoreField(field.id)}
              onDelete={() =>
                setTarget({
                  kind: 'fields',
                  ids: [field.id],
                  label: `"${field.label}"`,
                  archived: true,
                })
              }
            />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible>
  );
};
