import { useQueries } from '@tanstack/react-query';
import { LookupPicker } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Picks } from './pickRules';
import { choicesQuery } from './recordChoices';
import { Field } from './triggerFields';
import type { FieldInfo } from './useAutomationFields';

export const RecordPicks = ({
  fields,
  picks,
  onChange,
  disabled,
}: {
  fields: FieldInfo[];
  picks: Picks;
  onChange: (next: Picks) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  const results = useQueries({ queries: fields.map(choicesQuery) });

  return fields.map((field, at) => {
    const records = results[at];

    return (
      <Field key={field.path} label={field.label}>
        <LookupPicker
          multiple
          lookup={{
            options: records?.data ?? [],
            loading: records?.isPending ?? false,
            error: records?.error ?? null,
          }}
          value={picks[field.path] ?? []}
          onValueChange={(ids) => onChange({ ...picks, [field.path]: ids })}
          disabled={disabled}
          placeholder={t('any-record', 'Any {{label}}', { label: field.label.toLowerCase() })}
        />
      </Field>
    );
  });
};
