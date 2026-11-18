import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSegmentFields } from 'ui-modules';
import {
  ReEnrollmentOption,
  ReEnrollmentRelation,
  useReEnrollmentRules,
} from './useReEnrollmentRules';
import { useTriggerReEnrollment } from './useTriggerReEnrollment';

const MEASURE_PREFIX: Record<string, string> = {
  sum: 'Sum of',
  avg: 'Average of',
  min: 'Lowest',
  max: 'Highest',
};

/** Which records start the trigger: every, only new, or only existing ones. */
export const useAutomationDefaultTriggerHeader = (activeNode: NodeData) => {
  const { control, setValue } = useFormContext<TAutomationBuilderForm>();
  const configFieldNamePrefix: `triggers.${number}.config` = `triggers.${activeNode.nodeIndex}.config`;
  const config = useWatch<TAutomationBuilderForm>({
    control,
    name: configFieldNamePrefix,
  });
  const { recordType = 'every', contentId } = config || {};

  const onRecordTypeChange = useCallback(
    (value: string) => setValue(`${configFieldNamePrefix}.recordType`, value),
    [setValue, configFieldNamePrefix],
  );

  return {
    recordType,
    contentId,
    // New records enter once, so there is nothing to re-enroll
    showReEnrollment: recordType !== 'new',
    onRecordTypeChange,
  };
};

/** The fields whose change lets a record start the trigger again. */
export const useAutomationTriggerReEnrollment = (
  activeNode: NodeData,
  contentId: string,
) => {
  const { reEnrollmentOptions, loading, hasSubSegmentConditions } =
    useReEnrollmentRules({ contentId });
  const { fieldRules, toggleField } = useTriggerReEnrollment(activeNode);

  const options = reEnrollmentOptions.map((option: ReEnrollmentOption) => ({
    option,
    id: `reEnroll-${option.propertyName}`,
    checked: fieldRules.includes(option.propertyName),
    toggle: (value: boolean | 'indeterminate') =>
      toggleField(option.propertyName, value === true),
  }));

  return {
    loading,
    hintKey: hasSubSegmentConditions
      ? 're-enrollment-fields-hint'
      : 're-enrollment-no-fields',
    options,
  };
};

/** A relation option named by what it measures: "Deals · Sum of amount". */
export const useReEnrollmentRelationLabel = (
  relation: ReEnrollmentRelation,
) => {
  const { fieldByKey } = useSegmentFields(relation.relatedType || undefined);
  const { measure } = relation;
  const measured =
    'fieldKey' in measure
      ? `${MEASURE_PREFIX[measure.op]} ${(
          fieldByKey(measure.fieldKey)?.label || measure.fieldKey
        ).toLowerCase()}`
      : 'Count';

  return `${relation.label} · ${measured}`;
};
