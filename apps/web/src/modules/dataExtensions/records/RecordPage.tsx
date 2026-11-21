import type {
  DataExtensionField,
  DataExtensionObject,
  DataExtensionRecord,
} from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconBox, IconHistory, IconId, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageContainer, PageHeader, ScrollArea, Tabs, useConfirm } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { useFields } from '../dataQueries';
import { DraftEditor } from '../form/DraftEditor';
import { useValuesDraft } from '../form/useValuesDraft';
import { RecordHistory } from '../history/RecordHistory';
import { useDataErrorToast } from '../useDataErrors';
import { formFields } from '../values';

const RecordDetail = ({
  object,
  record,
  fields,
}: {
  object: DataExtensionObject;
  record: DataExtensionRecord;
  fields: DataExtensionField[];
}) => {
  const client = useQueryClient();
  const draft = useValuesDraft(record.values);
  const readOnly = !useCan()('objects.edit');

  const update = useMutation(
    orpc.dataRecords.update.mutationOptions({
      onSuccess: (next) => {
        client.setQueryData(
          orpc.dataRecords.get.queryKey({ input: { objectKey: object.key, id: next.id } }),
          next,
        );
        void client.invalidateQueries({ queryKey: orpc.dataRecords.list.key() });
        void client.invalidateQueries({ queryKey: orpc.dataChanges.key() });
      },
      onError: draft.failed,
    }),
  );

  return (
    <DraftEditor
      fields={formFields(fields, false).filter((field) => Object.hasOwn(record.values, field.key))}
      draft={draft}
      saving={update.isPending}
      readOnly={readOnly}
      onSave={(values) => update.mutate({ objectKey: object.key, id: record.id, values })}
    />
  );
};

const RemoveButton = ({
  object,
  record,
}: {
  object: DataExtensionObject;
  record: DataExtensionRecord;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const client = useQueryClient();
  const failed = useDataErrorToast();

  const remove = useMutation(
    orpc.dataRecords.remove.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.dataRecords.list.key() });
        void navigate(paths.objects.list(object.key));
      },
      onError: (error) => failed(error),
    }),
  );

  return (
    <Button
      variant="outline"
      disabled={remove.isPending}
      onClick={() =>
        void confirm({
          message: t('remove-confirm', 'Move {{name}} to the recycle bin?', {
            name: record.label ?? object.singularLabel,
          }),
          options: { description: t('remove-description', 'It stays there for 30 days.') },
        }).then(() => remove.mutate({ objectKey: object.key, id: record.id }))
      }
    >
      <IconTrash />
      {t('remove', 'Delete')}
    </Button>
  );
};

const RecordView = ({
  object,
  record,
}: {
  object: DataExtensionObject;
  record: DataExtensionRecord;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });
  const [tab, setTab] = useQueryState('tab');
  const fields = useFields(object.recordType);
  const title = record.label || t('untitled', 'Untitled');
  const canDelete = useCan()('objects.delete');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start variant="flush">
          <AppBreadcrumb
            items={[
              { label: object.pluralLabel, to: paths.objects.list(object.key), icon: IconBox },
              { label: title, to: paths.objects.record(object.key, record.id) },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {canDelete && <RemoveButton object={object} record={record} />}
        </PageHeader.End>
      </PageHeader>
      <Tabs
        value={tab === 'history' ? 'history' : 'detail'}
        onValueChange={(next) => void setTab(next === 'detail' ? null : next)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-4">
          <Tabs.List>
            <Tabs.Trigger value="detail">
              <IconId />
              {t('detail', 'Detail')}
            </Tabs.Trigger>
            <Tabs.Trigger value="history">
              <IconHistory />
              {t('history', 'History')}
            </Tabs.Trigger>
          </Tabs.List>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto max-w-3xl p-6">
            <Tabs.Content value="detail">
              <QueryState query={fields}>
                {() => (
                  <RecordDetail
                    key={record.updatedAt}
                    object={object}
                    record={record}
                    fields={fields.fields}
                  />
                )}
              </QueryState>
            </Tabs.Content>
            <Tabs.Content value="history">
              <RecordHistory recordType={object.recordType} recordId={record.id} />
            </Tabs.Content>
          </div>
        </ScrollArea>
      </Tabs>
    </PageContainer>
  );
};

/** `/objects/<key>/<id>`: a record's values to edit, and their history. */
export const RecordPage = () => {
  const { objectKey = '', id = '' } = useParams<{ objectKey: string; id: string }>();
  const object = useQuery(orpc.dataObjects.get.queryOptions({ input: { key: objectKey } }));
  const record = useQuery(orpc.dataRecords.get.queryOptions({ input: { objectKey, id } }));

  return (
    <QueryState query={object} className="py-12">
      {(loaded) => (
        <QueryState query={record} className="py-12">
          {(data) => <RecordView object={loaded} record={data} />}
        </QueryState>
      )}
    </QueryState>
  );
};
