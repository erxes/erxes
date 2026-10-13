import { useQuery } from '@apollo/client';
import { IconRestore, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Collapsible } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import {
  ARCHIVED_FIELD_GROUPS_QUERY,
  ARCHIVED_FIELDS_QUERY,
} from '../../graphql/queries/propertiesQueries';
import { usePropertyRestore } from '../../hooks/usePropertyArchive';
import { archiveTargetState } from '../../states/archiveTargetState';

interface IArchivedItem {
  _id: string;
  name: string;
  archivedAt: string;
  groupId?: string;
}

const useArchivedProperties = (contentType: string) => {
  const variables = { contentType };
  const { data: groupsData } = useQuery<{
    fieldGroups: { list: IArchivedItem[] };
  }>(ARCHIVED_FIELD_GROUPS_QUERY, { variables });
  const { data: fieldsData } = useQuery<{
    fields: { list: IArchivedItem[] };
  }>(ARCHIVED_FIELDS_QUERY, { variables });

  const groups = groupsData?.fieldGroups?.list ?? [];
  const archivedGroupIds = new Set(groups.map((group) => group._id));
  const fields = fieldsData?.fields?.list ?? [];

  return {
    groups: groups.map((group) => ({
      ...group,
      fieldCount: fields.filter((field) => field.groupId === group._id).length,
    })),
    // Fields inside an archived group come back with it, so they list there.
    fields: fields.filter(
      (field) => !archivedGroupIds.has(field.groupId ?? ''),
    ),
  };
};

export const PropertiesArchivedSection = ({
  contentType,
}: {
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { groups, fields } = useArchivedProperties(contentType);
  const { restoreField, restoreGroup, loading } = usePropertyRestore();
  const setTarget = useSetAtom(archiveTargetState);
  const total = groups.length + fields.length;

  if (!total) {
    return null;
  }

  const date = (value: string) => new Date(value).toLocaleDateString();

  return (
    <Collapsible className="group">
      <div className="flex items-center gap-1">
        <span className="size-7 shrink-0" />
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start font-medium text-muted-foreground"
          >
            <Collapsible.TriggerIcon />
            {t('archived', 'Archived')}
            <Badge variant="secondary" className="ml-1">
              {total}
            </Badge>
          </Button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className="pt-2">
        <div className="flex flex-col divide-y rounded-md border">
          {groups.map((group) => (
            <ArchivedRow
              key={group._id}
              name={group.name}
              detail={t('archived-group-detail', 'Group · {{count}} fields', {
                count: group.fieldCount,
              })}
              archivedAt={date(group.archivedAt)}
              disabled={loading}
              onRestore={() => restoreGroup(group._id)}
              onDelete={() =>
                setTarget({
                  kind: 'group',
                  id: group._id,
                  label: `"${group.name}"`,
                  archived: true,
                })
              }
            />
          ))}
          {fields.map((field) => (
            <ArchivedRow
              key={field._id}
              name={field.name}
              archivedAt={date(field.archivedAt)}
              disabled={loading}
              onRestore={() => restoreField(field._id)}
              onDelete={() =>
                setTarget({
                  kind: 'fields',
                  ids: [field._id],
                  label: `"${field.name}"`,
                  archived: true,
                })
              }
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
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

  return (
    <div className="flex items-center gap-3 px-3 py-2 text-sm">
      <span className="font-medium">{name}</span>
      {detail && <span className="text-muted-foreground">{detail}</span>}
      <span className="ml-auto text-muted-foreground">
        {t('archived-on', 'Archived {{date}}', { date: archivedAt })}
      </span>
      <Can action="fieldsManage">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onRestore}
        >
          <IconRestore />
          {t('restore', 'Restore')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={disabled}
          onClick={onDelete}
        >
          <IconTrash />
          {t('delete', 'Delete')}
        </Button>
      </Can>
    </div>
  );
};
