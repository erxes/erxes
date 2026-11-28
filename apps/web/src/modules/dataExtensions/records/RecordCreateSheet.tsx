import type {
  DataExtensionField,
  DataExtensionObject,
  DataExtensionValues,
} from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { FormError } from '../form/DraftEditor';
import { useValuesDraft } from '../form/useValuesDraft';
import { ValuesForm } from '../form/ValuesForm';
import { formFields } from '../values';

/** Each field's default value, as a new record starts. */
const defaultsOf = (fields: DataExtensionField[]): DataExtensionValues =>
  Object.fromEntries(
    fields.flatMap((field) =>
      field.settings.defaultValue === undefined ? [] : [[field.key, field.settings.defaultValue]],
    ),
  );

const CreateForm = ({
  object,
  fields,
  onOpenChange,
}: {
  object: DataExtensionObject;
  fields: DataExtensionField[];
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });
  const { toast } = useToast();
  const client = useQueryClient();
  const asked = formFields(fields, true);
  const draft = useValuesDraft(defaultsOf(asked));

  const create = useMutation(
    orpc.dataRecords.create.mutationOptions({
      onSuccess: (record) => {
        void client.invalidateQueries({ queryKey: orpc.dataRecords.list.key() });
        toast({
          variant: 'success',
          title: t('created', '{{name}} added', { name: record.label ?? object.singularLabel }),
        });
        onOpenChange(false);
      },
      onError: draft.failed,
    }),
  );

  // Only what was filled in: empty fields stay unset.
  const values = Object.fromEntries(
    Object.entries(draft.draft).filter(([, value]) => value !== null),
  );

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title={t('add', 'Add {{name}}', { name: object.singularLabel.toLowerCase() })}
      submitting={create.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate({ objectKey: object.key, values });
      }}
    >
      <FormError message={draft.formError} />
      <ValuesForm fields={asked} values={draft.draft} onChange={draft.set} errors={draft.errors} />
    </FormSheet>
  );
};

/** A new record of an object, in a side sheet: the fields asked on create forms. */
export const RecordCreateSheet = ({
  object,
  fields,
  open,
  onOpenChange,
}: {
  object: DataExtensionObject;
  fields: DataExtensionField[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (open ? <CreateForm object={object} fields={fields} onOpenChange={onOpenChange} /> : null);
