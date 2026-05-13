import { IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

import { PropertyField } from 'ui-modules/modules/segments/components/form/PropertyField';
import { PropertyInput } from 'ui-modules/modules/segments/components/form/PropertyInput';
import { PropertyOperator } from 'ui-modules/modules/segments/components/form/PropertyOperator';
import { useSegmentProperty } from '../../hooks/useSegmentProperty';
import { SegmentPropertiesRails } from './SegmentPropertiesRails';
import { SegmentGroupFieldProvider } from '../../context/SegmentGroupField';

export const SegmentProperty = ({ index }: { index: number }) => {
  const {
    totalFields,
    removeField,
    fields,
    propertyTypes,
    condition,
    loading,
    selectedField,
    operators,
    conditionFieldName,
    resetLaterFields,
  } = useSegmentProperty({ index });

  return (
    <div className="flex items-center relative">
      <SegmentPropertiesRails index={index} />
      <div
        className={`flex flex-row gap-2 w-full min-w-0 py-2 group ${
          totalFields > 1 ? 'pl-12' : ''
        }`}
      >
        <SegmentGroupFieldProvider
          index={index}
          condition={condition}
          conditionFieldName={conditionFieldName}
          fields={fields}
          selectedField={selectedField}
          operators={operators}
          loading={loading}
          onBeforeFieldChange={resetLaterFields}
          propertyTypes={propertyTypes}
        >
          <div className="min-w-0 flex-[2_0_0%]">
            <PropertyField />
          </div>
          <div className="min-w-0 flex-[1_0_0%]">
            <PropertyOperator />
          </div>
          <div className="min-w-0 flex-[2_0_0%] flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <PropertyInput />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeField(index)}
            >
              <IconTrash size={16} />
            </Button>
          </div>
        </SegmentGroupFieldProvider>
      </div>
    </div>
  );
};
