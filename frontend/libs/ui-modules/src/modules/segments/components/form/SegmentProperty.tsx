import { IconTrash } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';

import { PropertyField } from 'ui-modules/modules/segments/components/form/PropertyField';
import { PropertyInput } from 'ui-modules/modules/segments/components/form/PropertyInput';
import { PropertyOperator } from 'ui-modules/modules/segments/components/form/PropertyOperator';
import { useSegmentProperty } from '../../hooks/useSegmentProperty';
import { IProperty } from '../../types';
import { SegmentPropertiesRails } from './SegmentPropertiesRails';

export const SegmentProperty = ({
  index,
  remove,
  total,
  parentFieldName,
}: IProperty) => {
  const {
    fields,
    propertyTypes,
    loading,
    condition,
    selectedField,
    operators,
    conditionFieldName,
  } = useSegmentProperty({ index, parentFieldName });
  const { propertyName, propertyOperator, propertyValue } = condition || {};
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex items-center relative">
      {/* Tree line connector */}
      <SegmentPropertiesRails
        total={total}
        index={index}
        parentFieldName={parentFieldName}
      />
      <div
        className={`flex flex-row gap-4 w-full py-2 group ${
          total > 1 ? 'pl-12' : ''
        }`}
      >
        <div className="w-2/5">
          <PropertyField
            defaultValue={propertyName}
            parentFieldName={conditionFieldName}
            index={index}
            fields={fields}
            currentField={selectedField}
            propertyTypes={propertyTypes}
          />
        </div>
        <div className="w-1/5">
          <PropertyOperator
            defaultValue={propertyOperator}
            parentFieldName={conditionFieldName}
            index={index}
            currentField={selectedField}
            operators={operators || []}
          />
        </div>
        <div className="w-2/5 flex items-center gap-2">
          <PropertyInput
            defaultValue={propertyValue}
            parentFieldName={conditionFieldName}
            index={index}
            operators={operators || []}
            selectedField={selectedField}
          />
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
