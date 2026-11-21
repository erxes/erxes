import type { ConditionGroup } from '@erxes/core-contract';
import { memberQueries, messageOf, productSearchQueries } from '@erxes/core-contract/client';
import { useQueries } from '@tanstack/react-query';
import { ConditionsEditor as Conditions, type TConditionField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { choicesKey, choicesQuery, hasChoices } from './recordChoices';
import { tagsQuery } from '~/modules/tags/useTags';
import { StartFromView } from './StartFromView';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

type Choices = NonNullable<TConditionField['options']>;

const choicesOf = (options: string[] | undefined) =>
  options?.map((value) => ({ value, label: value }));

/**
 * A field as erxes-ui's editor takes it: choices as `{ value, label }`, a relation's fields too.
 * One holding a plugin's record ids is a choice of those records (`records`), so a member picks
 * "Won" rather than typing a stage's id.
 */
const conditionField = (
  { options, relation, recordType, source, integration, accountKind, ...field }: FieldInfo,
  records?: Choices,
): TConditionField => ({
  ...field,
  ...(hasChoices({ ...field, recordType, source, integration, accountKind })
    ? { type: 'select', options: records ?? [] }
    : { options: choicesOf(options) }),
  relation: relation && {
    label: relation.label,
    fields: relation.fields.map((inner) => ({ ...inner, options: choicesOf(inner.options) })),
  },
});

/**
 * The records each plugin record field picks from: `GET <api>/automations/records/<recordType>`,
 * all of them (no `parent`), as the plugin lists them for the member. Shared with the action
 * inputs that list the same records.
 */
const useRecordChoices = (fields: FieldInfo[]) => {
  const wanted = [
    ...new Map(
      fields.flatMap((field) => (hasChoices(field) ? [[choicesKey(field), field] as const] : [])),
    ).values(),
  ];

  const results = useQueries({ queries: wanted.map(choicesQuery) });

  return {
    recordsOf: (field: FieldInfo) => {
      const at = wanted.findIndex((item) => choicesKey(item) === choicesKey(field));

      return at < 0 ? undefined : results[at]?.data;
    },
    error: results.find((result) => result.isError)?.error,
  };
};

/**
 * An automation's conditions: erxes-ui's editor on the record's fields as its lists filter them
 * (lead stage, owner, tags, products, the company, plugins' relations, each with its own picker),
 * the event's, and earlier steps' outputs. With a record, it can start from a saved view.
 */
export const ConditionsEditor = ({
  subject = null,
  extraFields = [],
  ...props
}: {
  value: ConditionGroup | undefined;
  onChange: (next: ConditionGroup | undefined) => void;
  disabled?: boolean;
  subject?: 'customer' | 'company' | null;
  /** The event's own values and earlier steps' outputs, offered next to the record's fields. */
  extraFields?: FieldInfo[];
}) => {
  const { fields } = useAutomationFields(subject);
  // A trigger with no record has no record fields to test.
  const own = subject ? fields : fields.filter((field) => !field.path.startsWith('subject.'));
  const all = [...own, ...extraFields];
  const records = useRecordChoices(all);
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-2">
      {subject && (
        <StartFromView
          subject={subject}
          value={props.value}
          disabled={props.disabled}
          onChange={props.onChange}
        />
      )}
      <Conditions
        {...props}
        customPath
        fields={all.map((field) => conditionField(field, records.recordsOf(field)))}
        members={memberQueries}
        products={productSearchQueries}
        tags={subject ? tagsQuery(subject) : undefined}
      />
      {records.error && (
        <p className="text-xs text-destructive-text">
          {t('records-failed', 'The app’s choices didn’t load: {{message}}', {
            message: messageOf(records.error),
          })}
        </p>
      )}
    </div>
  );
};
