import { useWatch } from 'react-hook-form';
import { useSegment } from '../context/SegmentProvider';
import {
  createFieldNameSafe,
  getSelectedFieldConfig,
} from '../utils/segmentFormUtils';
import { useGetFieldsProperties } from './useGetFieldsProperties';
import { useSegmentGroup } from '../context/SegmentGroupProvider';
import { useCallback } from 'react';
import { ConditionFieldKey } from '../types';

type TConditionFieldName =
  | `conditionSegments.${number}.conditions.${number}`
  | `conditions.${number}`;

const CONDITION_FIELD_ORDER: ConditionFieldKey[] = [
  'propertyType',
  'propertyName',
  'propertyOperator',
  'propertyValue',
];

export const useSegmentProperty = ({ index }: { index: number }) => {
  const { form, contentType } = useSegment();
  const { fieldPath, totalFields, removeField } = useSegmentGroup();
  const conditionFieldName = createFieldNameSafe<TConditionFieldName>(
    fieldPath,
    index,
  );
  const condition = useWatch({
    control: form.control,
    name: conditionFieldName,
  });
  const { fields, propertyTypes, loading } = useGetFieldsProperties(
    condition?.propertyType,
  );
  const { selectedField, operators } =
    getSelectedFieldConfig(condition?.propertyName, fields) || {};

  const resetLaterFields = useCallback(
    (triggerField: ConditionFieldKey) => {
      const triggerIndex = CONDITION_FIELD_ORDER.indexOf(triggerField);
      const fieldsToResetInCurrent = CONDITION_FIELD_ORDER.slice(
        triggerIndex + 1,
      );

      fieldsToResetInCurrent.forEach((fieldKey) => {
        form.setValue(
          `${conditionFieldName}.${fieldKey}` as any,
          fieldKey === 'propertyType' ? contentType || '' : '',
          { shouldDirty: true },
        );
      });

      for (let j = index + 1; j < totalFields; j += 1) {
        const conditionPath = `${fieldPath}.${j}`;
        form.setValue(
          `${conditionPath}.propertyType` as any,
          contentType || '',
          { shouldDirty: true },
        );
        form.setValue(`${conditionPath}.propertyName` as any, '', {
          shouldDirty: true,
        });
        form.setValue(`${conditionPath}.propertyOperator` as any, '', {
          shouldDirty: true,
        });
        form.setValue(`${conditionPath}.propertyValue` as any, '', {
          shouldDirty: true,
        });
      }
    },
    [form, conditionFieldName, fieldPath, contentType, index, totalFields],
  );

  return {
    fieldPath,
    totalFields,
    fields,
    removeField,
    propertyTypes,
    loading,
    condition,
    selectedField,
    operators,
    conditionFieldName,
    resetLaterFields,
  };
};
