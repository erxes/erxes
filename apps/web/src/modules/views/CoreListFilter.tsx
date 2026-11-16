import type { ViewRecordType } from '@erxes/core-contract';
import { memberQueries, productSearchQueries } from '@erxes/core-contract/client';
import { ListFilter, type TListFilterField } from 'erxes-ui';
import type { ReactNode } from 'react';
import { tagsQuery } from '~/modules/tags/useTags';
import { subjectOf, useFilterFields } from './useViews';
import { ViewChanges } from './ViewControls';

/**
 * A core list's filter bar: erxes-ui's `ListFilter` on the fields `views.fields` gives for the
 * record type, and what the open saved view changed. Conditions are the list's filter, which
 * views save.
 */
export const CoreListFilter = ({
  recordType,
  optionLabel,
  ...props
}: {
  recordType: ViewRecordType;
  totalCount: number | null | undefined;
  totalCapped?: boolean;
  /** How a choice field's value reads (a product type, a plugin's title); the value otherwise. */
  optionLabel?: (path: string, value: string) => string;
  /** The list's own icon controls (Archived, Display), just before the menu. */
  children?: ReactNode;
}) => {
  const fields = useFilterFields(recordType);
  const subject = subjectOf(recordType);

  const choices = (path: string, options: string[] | undefined) =>
    options?.map((value) => ({ value, label: optionLabel?.(path, value) ?? value }));

  const listFields = (fields.data ?? []).map(
    ({ options, relation, ...field }): TListFilterField => ({
      ...field,
      options: choices(field.path, options),
      relation: relation && {
        label: relation.label,
        fields: relation.fields.map((inner) => ({
          ...inner,
          options: choices(inner.path, inner.options),
        })),
      },
    }),
  );

  return (
    <ListFilter
      {...props}
      id={recordType}
      fields={listFields}
      loading={fields.isLoading}
      error={fields.error}
      members={memberQueries}
      products={productSearchQueries}
      tags={subject ? tagsQuery(subject) : undefined}
      status={<ViewChanges recordType={recordType} />}
    />
  );
};
