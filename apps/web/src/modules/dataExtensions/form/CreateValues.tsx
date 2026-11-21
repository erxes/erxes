import type { DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import { useFields } from '../dataQueries';
import { fieldState, formFields } from '../values';
import { type ValuesDraft, useValuesDraft } from './useValuesDraft';
import { ValuesForm } from './ValuesForm';

/** The fields a core record's create form asks for: `showInCreate`, the plugins' left out. */
const askedOf = (fields: DataExtensionField[]) =>
  formFields(fields, true).filter((field) => !field.plugin && !field.settings.readOnly);

/**
 * What a create form sends as `values`: what the member filled in, and each required field
 * that shows, empty or not, so the API asks for it as the form does.
 */
const valuesToSend = (asked: DataExtensionField[], draft: DataExtensionValues) =>
  Object.fromEntries(
    asked.flatMap((field) => {
      const state = fieldState(field, draft);
      const value = draft[field.key] ?? null;

      return state.visible && (value !== null || state.required) ? [[field.key, value]] : [];
    }),
  );

/**
 * A new core record's Data Extensions fields (`core.customer`): the `showInCreate` ones,
 * under their groups. `values` is what the create sends; `failed` shows an INVALID_INPUT on
 * its fields.
 */
export const useCreateValues = (recordType: string) => {
  const { fields } = useFields(recordType);
  const asked = askedOf(fields);
  const draft = useValuesDraft({});

  return { asked, draft, values: valuesToSend(asked, draft.draft), failed: draft.failed };
};

/** The inputs of `useCreateValues`, under a section of their own; nothing when none is asked. */
export const CreateValues = ({
  asked,
  draft,
  disabled,
}: {
  asked: DataExtensionField[];
  draft: ValuesDraft;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'values' });

  return asked.length ? (
    <ValuesForm
      fields={asked}
      values={draft.draft}
      onChange={draft.set}
      errors={draft.errors}
      disabled={disabled}
      ungroupedTitle={t('section', 'Fields')}
    />
  ) : null;
};
