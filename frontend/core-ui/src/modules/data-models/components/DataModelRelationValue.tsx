import { useQuery } from '@apollo/client';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Avatar, Button, readImage } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { DATA_MODEL_RELATION_REFERENCES } from '../graphql';
import { relationValueIds } from '../recordDocuments';
import { relationMembers } from '../relationGroups';
import { dataModelErrorMessage } from '../errorMessage';
import {
  DATA_MODEL_CONTENT_TYPE_PREFIX,
  type DataModelRelationOption,
  type ModelField,
  type OffsetList,
} from '../types';

export const relationContentType = (targetModelId: string): string =>
  targetModelId.startsWith('core:')
    ? targetModelId
    : `${DATA_MODEL_CONTENT_TYPE_PREFIX}${targetModelId}`;

export const DataModelRecordReference = ({
  field,
  option,
}: {
  field: ModelField;
  option: DataModelRelationOption;
}) => {
  const { openRecord } = useSidePanel();
  if (!field.relation) return null;
  const contentType = relationContentType(field.relation.targetModelId);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 max-w-full justify-start gap-1.5 rounded-sm px-1.5 font-normal text-primary"
      title={`Open ${option.label}`}
      onClick={() =>
        openRecord({ contentType, contentId: option._id }, { stack: true })
      }
    >
      {option.imageUrl && (
        <Avatar size="sm">
          <Avatar.Image src={readImage(option.imageUrl)} alt="" />
          <Avatar.Fallback>{option.label.slice(0, 1)}</Avatar.Fallback>
        </Avatar>
      )}
      <span className="truncate">{option.label}</span>
      <IconArrowUpRight className="size-3 shrink-0 opacity-60" />
    </Button>
  );
};

const RelationReferences = ({
  field,
  value,
}: {
  field: ModelField;
  value: unknown;
}) => {
  const normalized = relationValueIds(field, value);
  const ids = (
    Array.isArray(normalized) ? normalized : normalized ? [normalized] : []
  ).filter((id): id is string => typeof id === 'string');
  const { data, loading, error, refetch } = useQuery<{
    dataModelRelationOptions: OffsetList<DataModelRelationOption>;
  }>(DATA_MODEL_RELATION_REFERENCES, {
    variables: { fieldId: field._id, recordIds: ids },
    skip: !ids.length,
    fetchPolicy: 'cache-and-network',
  });
  if (!ids.length) return null;
  if (error)
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive"
        title={dataModelErrorMessage(error)}
        onClick={() => {
          void refetch().catch(() => undefined);
        }}
      >
        Unable to load links · Retry
      </Button>
    );
  if (loading && !data)
    return (
      <span className="text-xs text-muted-foreground" role="status">
        Loading links…
      </span>
    );
  const options = new Map(
    data?.dataModelRelationOptions.list.map((entry) => [entry._id, entry]),
  );
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {ids.map((id) => {
        const option = options.get(id);
        return option ? (
          <DataModelRecordReference key={id} field={field} option={option} />
        ) : (
          <span
            key={id}
            className="px-1.5 text-xs text-muted-foreground"
            title="This record was deleted or is no longer available."
          >
            Unavailable record
          </span>
        );
      })}
    </div>
  );
};

export const DataModelRelationValue = ({
  field,
  fields,
  read,
}: {
  field: ModelField;
  fields: ModelField[];
  read: (member: ModelField) => unknown;
}) =>
  relationMembers(field, fields).every((member) => {
    const value = relationValueIds(member, read(member));
    return (
      value == null || value === '' || (Array.isArray(value) && !value.length)
    );
  }) ? (
    <span className="text-sm text-muted-foreground">No linked records</span>
  ) : (
    <div className="min-w-0 space-y-1">
      {relationMembers(field, fields).map((member) => (
        <RelationReferences
          key={member._id}
          field={member}
          value={read(member)}
        />
      ))}
    </div>
  );
