import type { DataExtensionField, DataExtensionObject } from '@erxes/core-contract';
import { memberQueries, orpc } from '@erxes/core-contract/client';
import { IconBox, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Button,
  Empty,
  Kbd,
  ListFilter,
  PageContainer,
  PageHeader,
  usePageHotkey,
  ViewBar,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CursorRecordTable } from '~/components/CursorRecordTable';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { useFields } from '../dataQueries';
import { RecordCreateSheet } from './RecordCreateSheet';
import { useRecordColumns } from './recordColumns';
import { filterFields, sortableKeys, useRecords, useRecordSort } from './useRecords';

const NoRecords = ({ object, onAdd }: { object: DataExtensionObject; onAdd?: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });

  return (
    <Empty className="absolute inset-x-0 top-1/4">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBox />
        </Empty.Media>
        <Empty.Title>
          {t('empty', 'No {{name}} yet', { name: object.pluralLabel.toLowerCase() })}
        </Empty.Title>
        <Empty.Description>
          {object.description ?? t('empty-description', 'Add the first one.')}
        </Empty.Description>
      </Empty.Header>
      {onAdd && (
        <Button onClick={onAdd}>
          <IconPlus />
          {t('add', 'Add {{name}}', { name: object.singularLabel.toLowerCase() })}
        </Button>
      )}
    </Empty>
  );
};

const RecordsTable = ({
  object,
  fields,
  onAdd,
}: {
  object: DataExtensionObject;
  fields: DataExtensionField[];
  onAdd?: () => void;
}) => {
  const cursor = useRecords(object.key);
  const { sort, setSort } = useRecordSort();
  const columns = useRecordColumns(object.key, fields, object.labelFieldId);
  const { t } = useTranslation('data', { keyPrefix: 'records' });

  return (
    <>
      <ViewBar allLabel={t('all', 'All {{name}}', { name: object.pluralLabel.toLowerCase() })}>
        <ListFilter
          id={`data-${object.key}`}
          fields={filterFields(fields)}
          members={memberQueries}
          totalCount={cursor.totalCount}
          totalCapped={cursor.totalCapped}
        />
      </ViewBar>
      <CursorRecordTable
        cursor={cursor}
        columns={columns}
        stickyColumns={columns.slice(0, 1).map((column) => column.id ?? '')}
        tableId={`data_records_${object.key}`}
        empty={<NoRecords object={object} onAdd={onAdd} />}
        sorting={{ sort, sortable: sortableKeys(fields), onSortChange: setSort }}
      />
    </>
  );
};

const ObjectRecords = ({ object }: { object: DataExtensionObject }) => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });
  const can = useCan();
  const [adding, setAdding] = useState(false);
  const fields = useFields(object.recordType);
  const add = can('objects.edit') ? () => setAdding(true) : undefined;

  usePageHotkey('c', () => add?.());

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start variant="flush">
          <AppBreadcrumb
            items={[
              { label: object.pluralLabel, to: paths.objects.list(object.key), icon: IconBox },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {add && (
            <Button onClick={add}>
              <IconPlus />
              {t('add', 'Add {{name}}', { name: object.singularLabel.toLowerCase() })}
              <Kbd>C</Kbd>
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <QueryState query={fields}>
        {() => <RecordsTable object={object} fields={fields.fields} onAdd={add} />}
      </QueryState>
      <RecordCreateSheet
        object={object}
        fields={fields.fields}
        open={adding}
        onOpenChange={setAdding}
      />
    </PageContainer>
  );
};

/** `/objects/<key>`: an object's records, searched, filtered and sorted. */
export const ObjectRecordsPage = () => {
  const { objectKey = '' } = useParams<{ objectKey: string }>();
  const object = useQuery(orpc.dataObjects.get.queryOptions({ input: { key: objectKey } }));

  return (
    <QueryState query={object} className="py-12">
      {(data) => <ObjectRecords key={data.key} object={data} />}
    </QueryState>
  );
};
