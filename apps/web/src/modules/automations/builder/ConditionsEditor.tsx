import type { ConditionGroup } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { ConditionsEditor as Conditions } from 'erxes-ui';
import { tagsQuery } from '~/modules/tags/useTags';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

/**
 * An automation's conditions: erxes-ui's editor on the automation catalog's fields for
 * `subject`, with earlier steps' outputs; tag values pick from the subject's tags.
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
  /** Outputs of earlier steps, offered next to the record's fields. */
  extraFields?: FieldInfo[];
}) => {
  const { fields } = useAutomationFields(subject);
  // Runs not about a customer or company have no record to test: no record fields, no tag lookup.
  const own = subject ? fields : fields.filter((field) => !field.path.startsWith('subject.'));

  return (
    <Conditions
      {...props}
      customPath
      fields={[...own, ...extraFields].map(({ options, ...field }) => ({
        ...field,
        options: options?.map((value) => ({ value, label: value })),
      }))}
      members={memberQueries}
      tags={subject ? tagsQuery(subject) : undefined}
    />
  );
};
