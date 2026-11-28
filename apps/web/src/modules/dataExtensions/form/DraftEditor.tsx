import type { DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Alert, Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { ValuesDraft } from './useValuesDraft';
import { ValuesForm } from './ValuesForm';

/** Why the last save failed, above the form. */
export const FormError = ({ message }: { message: string | null }) =>
  message ? (
    <Alert variant="destructive">
      <IconAlertTriangle />
      <Alert.Description>{message}</Alert.Description>
    </Alert>
  ) : null;

/**
 * A saved record's values as a form: Save and Discard show once something changed, and Save
 * sends only the changed values.
 */
export const DraftEditor = ({
  fields,
  draft,
  saving,
  readOnly,
  onSave,
  ungroupedTitle,
}: {
  fields: DataExtensionField[];
  draft: ValuesDraft;
  saving: boolean;
  /** The member can't change the record: values show, nothing saves. */
  readOnly?: boolean;
  onSave: (changes: DataExtensionValues) => void;
  /** The section title of the fields outside a group (`ValuesForm`). */
  ungroupedTitle?: string;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'form' });

  return (
    <div className="flex flex-col gap-4">
      <FormError message={draft.formError} />
      <ValuesForm
        fields={fields}
        values={draft.draft}
        onChange={draft.set}
        errors={draft.errors}
        disabled={Boolean(readOnly) || saving}
        ungroupedTitle={ungroupedTitle}
      />
      {draft.dirty && !readOnly && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={saving} onClick={draft.reset}>
            {t('discard', 'Discard')}
          </Button>
          <Button type="button" disabled={saving} onClick={() => onSave(draft.changes)}>
            {saving && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
};
