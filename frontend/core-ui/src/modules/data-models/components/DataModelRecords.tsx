import { useQuery } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button, RecordTable, RecordTableInlineCell, Select } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { Can, useSidePanel } from 'ui-modules';
import { useDataModelFields } from '../hooks';
import {
  createRecordDocuments,
  recordFromWire,
  type RecordWire,
} from '../recordDocuments';
import { uniqueModelFields } from '../relationGroups';
import { formatModelFieldValue, recordDisplayLabel } from '../recordUtils';
import { DataModelRelationValue } from './DataModelRelationValue';
import {
  DATA_MODEL_PAGE_SIZE,
  type DataModel,
  type DataModelRecord,
  type ModelField,
  type OffsetList,
} from '../types';
import {
  DataModelError,
  DataModelLoading,
  DataModelPagination,
} from './DataModelFeedback';
import { DataModelRecordForm } from './DataModelRecordForm';
import { DataModelRecordRemove } from './DataModelRecordRemove';

export const DataModelRecords = ({ model }: { model: DataModel }) => {
  const { fields, loading, error, refreshError, retry } = useDataModelFields(
    model._id,
  );
  if (error) return <DataModelError error={error} onRetry={retry} />;
  if (loading) return <DataModelLoading />;
  return (
    <>
      {refreshError && <DataModelError error={refreshError} onRetry={retry} />}
      <DataModelRecordList
        model={model}
        fields={fields}
        onRefreshFields={retry}
      />
    </>
  );
};

const DataModelRecordList = ({
  model,
  fields,
  onRefreshFields,
}: {
  model: DataModel;
  fields: ModelField[];
  onRefreshFields: () => void;
}) => {
  const { openRecord } = useSidePanel();
  const [deleted, setDeleted] = useState(false);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState('createdAt');
  const [direction, setDirection] = useState('DESC');
  const [editor, setEditor] = useState<{ record?: DataModelRecord } | null>(
    null,
  );
  const [removing, setRemoving] = useState<DataModelRecord | null>(null);
  const documents = useMemo(
    () => createRecordDocuments(model, fields),
    [model, fields],
  );
  const { data, loading, error, refetch } = useQuery<{
    dataModelRecordList: OffsetList<RecordWire>;
  }>(documents.list, {
    variables: {
      deleted,
      offset,
      limit: DATA_MODEL_PAGE_SIZE,
      sort: { field: sort, direction },
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const result = data?.dataModelRecordList;
  const records = useMemo(
    () => result?.list.map((record) => recordFromWire(record, fields)) ?? [],
    [result, fields],
  );
  useEffect(() => {
    if (!loading && result && offset > 0 && offset >= result.totalCount)
      setOffset(
        Math.max(
          0,
          Math.ceil(result.totalCount / DATA_MODEL_PAGE_SIZE - 1) *
            DATA_MODEL_PAGE_SIZE,
        ),
      );
  }, [loading, offset, result]);
  useEffect(() => {
    if (
      !['createdAt', 'updatedAt'].includes(sort) &&
      !fields.some((field) => field.name === sort)
    ) {
      setSort('createdAt');
      setOffset(0);
    }
  }, [fields, sort]);
  const columns = useMemo<ColumnDef<DataModelRecord>[]>(
    () => [
      {
        id: 'record',
        header: () => <RecordTable.InlineHead label="Record" />,
        size: 240,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <Button
              variant="ghost"
              className="h-full w-full justify-start truncate px-2 font-medium text-primary"
              title={row.original._id}
              onClick={() =>
                openRecord({
                  contentType: model.contentType,
                  contentId: row.original._id,
                })
              }
              disabled={deleted}
            >
              {recordDisplayLabel(model, fields, row.original)}
            </Button>
          </RecordTableInlineCell>
        ),
      },
      ...uniqueModelFields(fields).map(
        (field): ColumnDef<DataModelRecord> => ({
          id: field._id,
          size: 200,
          header: () => <RecordTable.InlineHead label={field.label} />,
          cell: ({ row }) => (
            <RecordTableInlineCell>
              {field.relation ? (
                <DataModelRelationValue
                  field={field}
                  fields={fields}
                  read={(member) => row.original.values[member._id]}
                />
              ) : (
                <span
                  className="truncate"
                  title={formatModelFieldValue(
                    field,
                    fields,
                    (member) => row.original.values[member._id],
                  )}
                >
                  {formatModelFieldValue(
                    field,
                    fields,
                    (member) => row.original.values[member._id],
                  )}
                </span>
              )}
            </RecordTableInlineCell>
          ),
        }),
      ),
      {
        id: 'updatedAt',
        size: 180,
        header: () => <RecordTable.InlineHead label="Updated" />,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            {new Date(row.original.updatedAt).toLocaleString()}
          </RecordTableInlineCell>
        ),
      },
      {
        id: 'actions',
        size: 190,
        header: () => <RecordTable.InlineHead label="Actions" />,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <div className="flex gap-1">
              <Can action="dataModelRecordsUpdate">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditor({ record: row.original })}
                >
                  {deleted ? 'Restore' : 'Edit'}
                </Button>
              </Can>
              {!deleted && (
                <Can action="dataModelRecordsDelete">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setRemoving(row.original)}
                  >
                    Delete
                  </Button>
                </Can>
              )}
            </div>
          </RecordTableInlineCell>
        ),
      },
    ],
    [deleted, fields, model, openRecord],
  );
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {model.labelPlural}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a record to see its details. Select a linked name to follow its
          reference.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select
            value={deleted ? 'deleted' : 'active'}
            onValueChange={(value) => {
              setDeleted(value === 'deleted');
              setOffset(0);
            }}
          >
            <Select.Trigger className="w-44" aria-label="Record status">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="active">Active records</Select.Item>
              <Select.Item value="deleted">Deleted records</Select.Item>
            </Select.Content>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value);
              setOffset(0);
            }}
          >
            <Select.Trigger className="w-40" aria-label="Sort records by">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="createdAt">Created date</Select.Item>
              <Select.Item value="updatedAt">Updated date</Select.Item>
              {fields
                .filter(
                  (field) =>
                    !['list', 'multiSelect', 'check', 'relation'].includes(
                      field.type,
                    ),
                )
                .map((field) => (
                  <Select.Item key={field._id} value={field.name}>
                    {field.label}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select>
          <Select
            value={direction}
            onValueChange={(value) => {
              setDirection(value);
              setOffset(0);
            }}
          >
            <Select.Trigger className="w-36" aria-label="Sort direction">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="DESC">Descending</Select.Item>
              <Select.Item value="ASC">Ascending</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              onRefreshFields();
              void refetch().catch(() => undefined);
            }}
          >
            Refresh records
          </Button>
          <Can action="dataModelRecordsCreate">
            <Button onClick={() => setEditor({})}>
              <IconPlus />
              New record
            </Button>
          </Can>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        {error ? (
          <DataModelError
            error={error}
            onRetry={() => {
              void refetch().catch(() => undefined);
            }}
          />
        ) : loading && !result ? (
          <DataModelLoading />
        ) : !result?.list.length ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            {deleted
              ? 'No deleted records.'
              : 'No records yet. Create your first record to get started.'}
          </p>
        ) : (
          <RecordTable.Provider
            columns={columns}
            data={records}
            stickyColumns={['record']}
          >
            <RecordTable.Scroll
              className="h-auto"
              viewportClassName="max-h-[32rem]"
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTable.Provider>
        )}
        <DataModelPagination
          offset={offset}
          total={result?.totalCount ?? 0}
          pageSize={DATA_MODEL_PAGE_SIZE}
          onChange={setOffset}
          disabled={loading}
        />
      </div>
      {editor && (
        <DataModelRecordForm
          model={model}
          record={editor.record}
          fields={fields}
          onClose={() => setEditor(null)}
        />
      )}
      {removing && (
        <DataModelRecordRemove
          record={removing}
          model={model}
          fields={fields}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
};
