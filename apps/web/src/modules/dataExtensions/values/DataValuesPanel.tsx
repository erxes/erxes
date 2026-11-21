import type { DataExtensionField, DataExtensionHostValues } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import { useFields, useRecordType } from '../dataQueries';
import { DraftEditor } from '../form/DraftEditor';
import { useValuesDraft } from '../form/useValuesDraft';
import { ValuesForm } from '../form/ValuesForm';
import { formFields } from '../values';

/** The fields the API sent values of: it leaves out the ones the member's role can't see. */
const readableFields = (fields: DataExtensionField[], saved: DataExtensionHostValues) =>
  formFields(fields, false).filter((field) => Object.hasOwn(saved.values, field.key));

const HostValuesEditor = ({
  fields,
  saved,
}: {
  fields: DataExtensionField[];
  saved: DataExtensionHostValues;
}) => {
  const client = useQueryClient();
  const can = useCan();
  const type = useRecordType(saved.recordType);
  const draft = useValuesDraft(saved.values);
  const readOnly = Boolean(type?.updatePermission && !can(type.updatePermission));

  const update = useMutation(
    orpc.dataValues.update.mutationOptions({
      onSuccess: (next) => {
        draft.cleared();
        client.setQueryData(
          orpc.dataValues.get.queryKey({
            input: { recordType: next.recordType, recordId: next.recordId },
          }),
          next,
        );
        void client.invalidateQueries({ queryKey: orpc.activities.key() });
        void client.invalidateQueries({ queryKey: orpc.dataChanges.key() });
      },
      onError: draft.failed,
    }),
  );

  return (
    <DraftEditor
      fields={readableFields(fields, saved)}
      draft={draft}
      saving={update.isPending}
      readOnly={readOnly}
      onSave={(values) =>
        update.mutate({ recordType: saved.recordType, recordId: saved.recordId, values })
      }
    />
  );
};

/** A record's values: a plugin's to read (it keeps and edits them), core's to edit here. */
const HostValues = ({
  fields,
  saved,
}: {
  fields: DataExtensionField[];
  saved: DataExtensionHostValues;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'values' });
  const type = useRecordType(saved.recordType);

  return type?.plugin ? (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        {t('keptByPlugin', 'The plugin keeps these values. Change them where you edit the record.')}
      </p>
      <ValuesForm fields={readableFields(fields, saved)} values={saved.values} />
    </div>
  ) : (
    <HostValuesEditor key={saved.updatedAt ?? 'new'} fields={fields} saved={saved} />
  );
};

/**
 * A core or plugin record's Data Extensions values, as their own panel tab. A core record's
 * are edited in place and saved together, computed ones read only; a plugin's are all read
 * only.
 */
export const DataValuesPanel = ({
  recordType,
  recordId,
}: {
  recordType: string;
  recordId: string;
}) => {
  const fields = useFields(recordType);
  const values = useQuery(orpc.dataValues.get.queryOptions({ input: { recordType, recordId } }));

  return (
    <ScrollArea className="flex-1 min-h-0" fitWidth>
      <div className="p-3">
        <QueryState query={fields}>
          {() => (
            <QueryState query={values}>
              {(saved) => <HostValues fields={fields.fields} saved={saved} />}
            </QueryState>
          )}
        </QueryState>
      </div>
    </ScrollArea>
  );
};
