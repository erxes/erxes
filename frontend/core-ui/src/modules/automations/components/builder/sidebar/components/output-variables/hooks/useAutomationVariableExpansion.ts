import { AUTOMATION_REFERENCE_FIELDS } from '@/automations/graphql/automationQueries';
import { useLazyQuery } from '@apollo/client';
import type React from 'react';
import { useState } from 'react';
import {
  TAutomationOutputVariable,
  TAutomationReferenceFieldsResponse,
} from '../AutomationVariableBrowserTypes';
import { useAutomationVariableList } from '../context/AutomationVariableListContext';

/**
 * Expand/collapse state of a variable's sub-fields.
 *
 * Child fields come from three sources, in priority order:
 * 1. `variable.fields` — plain nested fields declared inline (arrays/objects)
 * 2. `variable.referenceFields` — reference fields declared inline
 * 3. lazily fetched reference fields (only for `exposure: 'reference'`
 *    variables without inline fields, on first expand)
 */
export const useAutomationVariableExpansion = (
  variable: TAutomationOutputVariable,
) => {
  const { sourceNode } = useAutomationVariableList();
  const [expanded, setExpanded] = useState(false);
  const [loadReferenceFields, { data, loading }] =
    useLazyQuery<TAutomationReferenceFieldsResponse>(
      AUTOMATION_REFERENCE_FIELDS,
      {
        fetchPolicy: 'cache-first',
      },
    );

  const nestedFields = variable.fields || [];
  const inlineFields = nestedFields.length
    ? nestedFields
    : variable.referenceFields || [];
  const childFields = inlineFields.length
    ? inlineFields
    : data?.automationReferenceFields || [];

  const isExpandable =
    variable.exposure === 'reference' || nestedFields.length > 0;
  const expandLabel = expanded
    ? 'Hide fields'
    : variable.exposure === 'reference'
    ? 'Reference'
    : 'Fields';

  const toggleExpanded = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded && !inlineFields.length && !data && !loading) {
      loadReferenceFields({
        variables: {
          type: variable.sourceType || sourceNode.type,
          field: variable.field || variable.key,
        },
      });
    }
  };

  return {
    childFields,
    expandLabel,
    expanded,
    isExpandable,
    loading,
    toggleExpanded,
  };
};
