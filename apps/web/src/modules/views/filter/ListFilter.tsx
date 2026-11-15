import type { ViewRecordType } from '@erxes/core-contract';
import type { ReactNode } from 'react';
import { type ListField, subjectOf, useFilterFields } from '../useViews';
import { ViewChanges } from '../ViewControls';
import { ListFilterFrame } from './ListFilterBar';
import type { ListFilterState } from './listFilterContext';
import type { Total } from './RecordCount';

// While the fields load; one array, so the filter state keeps its identity.
const NO_FIELDS: ListField[] = [];

/**
 * A core list's filter bar: the fields `views.fields` gives for the record type, and what the
 * open saved view changed. Conditions are the list's filter, which views save.
 */
export const ListFilter = ({
  recordType,
  ...props
}: Total & {
  recordType: ViewRecordType;
  optionLabel?: ListFilterState['optionLabel'];
  /** The list's own icon controls (Archived, Display), just before the menu. */
  children?: ReactNode;
}) => {
  const fields = useFilterFields(recordType);

  return (
    <ListFilterFrame
      {...props}
      id={recordType}
      fields={fields.data ?? NO_FIELDS}
      fieldsLoading={fields.isLoading}
      fieldsError={fields.error}
      subject={subjectOf(recordType)}
      viewChanges={<ViewChanges recordType={recordType} />}
    />
  );
};
