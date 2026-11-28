import type { AppliesTo, DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { groupApplies } from '@erxes/core-contract/common';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { fieldsQuery, groupsQuery } from '../dataQueries';
import { DraftEditor } from '../form/DraftEditor';
import { useValuesDraft } from '../form/useValuesDraft';
import { formFields } from '../values';

export interface RecordFieldsProps {
  /** `core.customer`, `core.product`, or a plugin's `<plugin>.<type>`. */
  recordType: string;
  /** The record's values by field key: every field the member may see, null when empty. */
  values: DataExtensionValues;
  /** Saves the changed values by key; a failure shows on its fields. */
  save: (changes: DataExtensionValues) => Promise<unknown>;
  /** The member can't change the record: its values show, nothing saves. */
  readOnly?: boolean;
  /** What a plugin's record is in: groups limited to other records leave out their fields. */
  appliesTo?: AppliesTo;
}

const Editor = ({
  fields,
  values,
  save,
  readOnly,
}: Omit<RecordFieldsProps, 'recordType' | 'appliesTo'> & { fields: DataExtensionField[] }) => {
  const { t } = useTranslation('data', { keyPrefix: 'values' });
  const draft = useValuesDraft(values);

  const saving = useMutation({
    mutationFn: save,
    onSuccess: draft.cleared,
    onError: draft.failed,
  });

  return (
    <DraftEditor
      fields={fields}
      draft={draft}
      saving={saving.isPending}
      readOnly={readOnly}
      onSave={(changes) => saving.mutate(changes)}
      ungroupedTitle={t('section', 'Fields')}
    />
  );
};

/**
 * A record's Data Extensions fields under their field groups, where its own fields show:
 * edited together, Save sends what changed. Nothing while the record type has no fields.
 */
export const RecordFields = ({ recordType, values, appliesTo, ...props }: RecordFieldsProps) => {
  const fields = useQuery(fieldsQuery(recordType));
  const groups = useQuery(groupsQuery(recordType));

  const skipped = new Set(
    (groups.data?.data ?? [])
      .filter((group) => appliesTo && !groupApplies(group.appliesTo, appliesTo))
      .map((group) => group.id),
  );

  return (
    <QueryState query={fields} isEmpty={({ data }) => !data.length}>
      {({ data }) => (
        <Editor
          // A saved change starts the draft again from what the record now holds.
          key={JSON.stringify(values)}
          {...props}
          values={values}
          // `values` leaves out the fields the member's role can't see.
          fields={formFields(data, false).filter(
            (field) =>
              Object.hasOwn(values, field.key) && (!field.groupId || !skipped.has(field.groupId)),
          )}
        />
      )}
    </QueryState>
  );
};
