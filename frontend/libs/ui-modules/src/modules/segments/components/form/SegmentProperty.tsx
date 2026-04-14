import { useCallback } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

import { PropertyField } from 'ui-modules/modules/segments/components/form/PropertyField';
import { PropertyInput } from 'ui-modules/modules/segments/components/form/PropertyInput';
import { PropertyOperator } from 'ui-modules/modules/segments/components/form/PropertyOperator';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentProperty } from '../../hooks/useSegmentProperty';
import { ConditionFieldKey, IProperty } from '../../types';
import { SegmentPropertiesRails } from './SegmentPropertiesRails';

const CONDITION_FIELD_ORDER: ConditionFieldKey[] = [
  'propertyType',
  'propertyName',
  'propertyOperator',
  'propertyValue',
];

export const SegmentProperty = ({
  index,
  remove,
  total,
  parentFieldName,
}: IProperty) => {
  const { form, contentType } = useSegment();
  const {
    fields,
    propertyTypes,
    condition,
    loading,
    selectedField,
    operators,
    conditionFieldName,
  } = useSegmentProperty({ index, parentFieldName });

  const conditionsPath = parentFieldName
    ? `${parentFieldName}.conditions`
    : 'conditions';

  const resetLaterFields = useCallback(
    (triggerField: ConditionFieldKey) => {
      const triggerIndex = CONDITION_FIELD_ORDER.indexOf(triggerField);
      const fieldsToResetInCurrent = CONDITION_FIELD_ORDER.slice(triggerIndex + 1);

      fieldsToResetInCurrent.forEach((fieldKey) => {
        form.setValue(
          `${conditionFieldName}.${fieldKey}` as any,
          fieldKey === 'propertyType' ? contentType || '' : '',
          { shouldDirty: true },
        );
      });

      for (let j = index + 1; j < total; j += 1) {
        const conditionPath = `${conditionsPath}.${j}`;
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
    [form, conditionFieldName, conditionsPath, contentType, index, total],
  );

  return (
    <div className="flex items-center relative">
      <SegmentPropertiesRails
        total={total}
        index={index}
        parentFieldName={parentFieldName}
      />
      <div
        className={`flex flex-row gap-2 w-full min-w-0 py-2 group ${
          total > 1 ? 'pl-12' : ''
        }`}
      >
        <div className="min-w-0 flex-[2_0_0%]">
          <PropertyField
            defaultValue={condition?.propertyName}
            parentFieldName={conditionFieldName}
            index={index}
            fields={fields}
            currentField={selectedField}
            propertyTypes={propertyTypes}
            loading={loading}
            onBeforeFieldChange={resetLaterFields}
          />
        </div>
        <div className="min-w-0 flex-[1_0_0%]">
          <PropertyOperator
            defaultValue={condition?.propertyOperator}
            parentFieldName={conditionFieldName}
            index={index}
            currentField={selectedField}
            operators={operators || []}
            loading={loading}
            onBeforeFieldChange={resetLaterFields}
          />
        </div>
        <div className="min-w-0 flex-[2_0_0%] flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <PropertyInput
              defaultValue={condition?.propertyValue}
              parentFieldName={conditionFieldName}
              index={index}
              operators={operators || []}
              selectedField={selectedField}
              loading={loading}
              onBeforeFieldChange={resetLaterFields}
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => remove()}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
