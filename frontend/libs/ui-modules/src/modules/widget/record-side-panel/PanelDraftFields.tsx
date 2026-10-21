import { Spinner, TextField } from 'erxes-ui';
import { useState } from 'react';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField } from './PanelField';

export interface IPanelDraftField {
  name: string;
  label: string;
  placeholder?: string;
}

/**
 * A record not created yet, as the side panel shows it: its first fields,
 * the first one ready to type. Nothing is saved until one of them is; then
 * `onCreate` creates the record with that value (one mutation, with the
 * draft's defaults) and replaces the draft with it. Closing the panel
 * before that leaves nothing behind. `children`: what the record will start
 * with (its team, the customer it is for, ...), shown below.
 */
export const PanelDraftFields = ({
  fields,
  scope,
  onCreate,
  creating,
  children,
}: {
  fields: IPanelDraftField[];
  scope: string;
  onCreate: (values: Record<string, string>) => void;
  creating?: boolean;
  children?: React.ReactNode;
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const save = (name: string, value: string) => {
    const trimmed = value.trim();

    if (!trimmed || creating) {
      return;
    }

    const next = { ...values, [name]: trimmed };
    setValues(next);
    onCreate(next);
  };

  return (
    <div className="flex flex-col gap-0.5 p-3">
      {fields.map((field, index) => (
        <PanelField key={field.name} label={field.label}>
          <TextField
            scope={`${scope}.${field.name}`}
            value={values[field.name] || ''}
            placeholder={field.placeholder || field.label}
            defaultOpen={index === 0}
            disabled={creating}
            className={PANEL_TEXT_FIELD_CLASS_NAME}
            onSave={(value) => save(field.name, value)}
          />
        </PanelField>
      ))}
      {children}
      {creating && <Spinner size="sm" containerClassName="py-3" />}
    </div>
  );
};
