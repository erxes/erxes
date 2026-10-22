import { useQuery } from '@apollo/client';
import { IconPencil } from '@tabler/icons-react';
import { Button, ScrollArea } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { Can, RecordSidePanel, type IRecordViewProps } from 'ui-modules';
import { DATA_MODEL_DETAIL } from '../graphql';
import { useDataModelFields } from '../hooks';
import {
  createRecordDocuments,
  recordFromWire,
  type RecordWire,
} from '../recordDocuments';
import { uniqueModelFields } from '../relationGroups';
import { formatModelFieldValue, recordDisplayLabel } from '../recordUtils';
import {
  DATA_MODEL_CONTENT_TYPE_PREFIX,
  type DataModel,
  type DataModelRecord,
  type ModelField,
} from '../types';
import { DataModelError, DataModelLoading } from './DataModelFeedback';
import { DataModelRecordForm } from './DataModelRecordForm';
import { DataModelRelationValue } from './DataModelRelationValue';
import { DataModelReverseRelationValue } from './DataModelReverseRelationValue';

export const DataModelRecordPanel = (props: IRecordViewProps) => (
  <Can action="dataModelsRead" fallback={<RecordAccessDenied {...props} />}>
    <Can
      action="dataModelRecordsRead"
      fallback={<RecordAccessDenied {...props} />}
    >
      <RecordModel {...props} />
    </Can>
  </Can>
);

const RecordAccessDenied = ({ onClose, onBack }: IRecordViewProps) => (
  <>
    <RecordSidePanel.Header
      title="Record unavailable"
      onClose={onClose}
      onBack={onBack}
    />
    <p role="alert" className="p-5 text-sm text-muted-foreground">
      You do not have permission to view this record.
    </p>
  </>
);

const RecordModel = (props: IRecordViewProps) => {
  const modelId = props.record.contentType.slice(
    DATA_MODEL_CONTENT_TYPE_PREFIX.length,
  );
  const { data, previousData, loading, error, refetch } = useQuery<{
    dataModelDetail: DataModel;
  }>(DATA_MODEL_DETAIL, {
    variables: { _id: modelId },
    fetchPolicy: 'cache-and-network',
  });
  const model = data?.dataModelDetail ?? previousData?.dataModelDetail;
  return (
    <>
      <RecordSidePanel.Header
        title={model?.labelSingular ?? 'Record'}
        onClose={props.onClose}
        onBack={props.onBack}
      />
      {error && model && (
        <DataModelError
          error={error}
          onRetry={() => {
            void refetch().catch(() => undefined);
          }}
        />
      )}
      {error && !model ? (
        <DataModelError
          error={error}
          onRetry={() => {
            void refetch().catch(() => undefined);
          }}
        />
      ) : loading && !model ? (
        <DataModelLoading />
      ) : model?.archivedAt ? (
        <p className="p-5 text-sm text-muted-foreground">
          This object is archived. Restore it in Data Models to access its
          records.
        </p>
      ) : model ? (
        <RecordFields
          key={model._id}
          model={model}
          recordId={props.record.contentId}
        />
      ) : null}
    </>
  );
};

const RecordFields = ({
  model,
  recordId,
}: {
  model: DataModel;
  recordId: string;
}) => {
  const result = useDataModelFields(model._id);
  if (result.error)
    return <DataModelError error={result.error} onRetry={result.retry} />;
  if (result.loading) return <DataModelLoading />;
  return (
    <>
      {result.refreshError && (
        <DataModelError error={result.refreshError} onRetry={result.retry} />
      )}
      <RecordDetail
        key={recordId}
        model={model}
        recordId={recordId}
        fields={result.fields}
      />
    </>
  );
};

const RecordDetail = ({
  model,
  recordId,
  fields,
}: {
  model: DataModel;
  recordId: string;
  fields: ModelField[];
}) => {
  const documents = useMemo(
    () => createRecordDocuments(model, fields),
    [model, fields],
  );
  const { data, loading, error, refetch } = useQuery<{
    dataModelRecordDetail: RecordWire;
  }>(documents.detail, {
    variables: { _id: recordId },
    fetchPolicy: 'cache-and-network',
  });
  const [editing, setEditing] = useState<DataModelRecord | null>(null);
  const record = data?.dataModelRecordDetail
    ? recordFromWire(data.dataModelRecordDetail, fields)
    : editing;
  if (error && !editing)
    return (
      <DataModelError
        error={error}
        onRetry={() => {
          void refetch().catch(() => undefined);
        }}
      />
    );
  if (!record)
    return loading ? (
      <DataModelLoading />
    ) : (
      <p className="p-5 text-sm text-muted-foreground">
        This record is no longer available.
      </p>
    );
  return (
    <>
      {error && (
        <DataModelError
          error={error}
          onRetry={() => {
            void refetch().catch(() => undefined);
          }}
        />
      )}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-6 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold tracking-tight">
                {recordDisplayLabel(model, fields, record)}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Updated {new Date(record.updatedAt).toLocaleString()}
              </p>
            </div>
            <Can action="dataModelRecordsUpdate">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(record)}
              >
                <IconPencil className="size-3.5" />
                Edit
              </Button>
            </Can>
          </div>
          <dl className="divide-y">
            {uniqueModelFields(fields).map((field) => (
              <div key={field._id} className="space-y-2 py-4">
                <dt className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="break-words text-sm">
                  {field.relation?.isInverse ? (
                    <DataModelReverseRelationValue
                      model={model}
                      field={field}
                      recordId={recordId}
                    />
                  ) : field.relation ? (
                    <DataModelRelationValue
                      field={field}
                      fields={fields}
                      read={(member) => record.values[member._id]}
                    />
                  ) : (
                    formatModelFieldValue(
                      field,
                      fields,
                      (member) => record.values[member._id],
                    )
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {!fields.length && (
            <p className="text-sm text-muted-foreground">
              No fields have been added to this object yet.
            </p>
          )}
        </div>
      </ScrollArea>
      {editing && (
        <DataModelRecordForm
          model={model}
          fields={fields}
          record={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
};
