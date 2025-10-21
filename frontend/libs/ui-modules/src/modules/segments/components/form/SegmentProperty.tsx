import { IconTrash } from '@tabler/icons-react';
import { Button, cn, Spinner } from 'erxes-ui';

import { PropertyField } from 'ui-modules/modules/segments/components/form/PropertyField';
import { PropertyInput } from 'ui-modules/modules/segments/components/form/PropertyInput';
import { PropertyOperator } from 'ui-modules/modules/segments/components/form/PropertyOperator';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { getFieldsProperties } from '../../hooks';
import { IProperty } from '../../types';
import {
  createFieldNameSafe,
  getSelectedFieldConfig,
} from '../../utils/segmentFormUtils';

export const SegmentProperty = ({
  index,
  condition,
  remove,
  isFirst,
  isLast,
  total,
  parentFieldName,
}: IProperty) => {
  const { form } = useSegment();
  const { watch, setValue } = form;

  const fieldName = createFieldNameSafe(parentFieldName, 'conditions', index);
  const propertyType = watch(`${fieldName}.propertyType` as any);
  const { fields, propertyTypes, loading } = getFieldsProperties(propertyType);

  if (loading) {
    return <Spinner />;
  }

  const { selectedField, operators } =
    getSelectedFieldConfig(watch(`${fieldName}.propertyName` as any), fields) ||
    {};

  const renderAndOrBtn = () => {
    const hasTwoElement = total === 2;
    const isOdd = Math.round(total) % 2 === 0;
    const middleIndex = Math.round(total / 2) + (isOdd ? 1 : 0);

    if (middleIndex === index + 1 || (hasTwoElement && index === 1)) {
      const field:
        | `conditionSegments.${number}.conditionsConjunction`
        | 'conditionsConjunction' = parentFieldName
        ? `${parentFieldName}.conditionsConjunction`
        : `conditionsConjunction`;
      const value = watch(field);
      const handleClick = () => {
        setValue(field, value === 'or' ? 'and' : 'or');
      };
      return (
        <div
          className={cn(
            'absolute z-10 -left-1 cursor-pointer hover:bg-amber-200 text-amber-600/50 w-12 h-6 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium transition',
            {
              '-top-3': isOdd,
              'bg-green-100 text-green-600 hover:bg-green-100 hover:text-green-600/50':
                value === 'and',
            },
          )}
          onClick={handleClick}
        >
          {(value || '')?.toUpperCase() || 'OR'}
        </div>
      );
    }
  };

  return (
    <div className="flex items-center relative" key={index}>
      {/* Tree line connector */}
      {total > 1 && (
        <div className="absolute left-0 flex items-center h-full">
          {/* Vertical line */}
          {!isFirst && (
            <div className="absolute top-0 left-[24px] w-[1px] h-1/2 bg-gray-300"></div>
          )}
          {!isLast && (
            <div className="absolute bottom-0 left-[24px] w-[1px] h-1/2 bg-gray-300"></div>
          )}

          {/* Horizontal line */}
          <div className="absolute left-[24px] w-[20px] h-[1px] bg-gray-300"></div>

          {/* OR label (only on second item) */}
          {renderAndOrBtn()}
        </div>
      )}

      <div
        className={`flex flex-row gap-4 w-full py-2 group ${
          total > 1 ? 'pl-12' : ''
        }`}
      >
        <div className="w-2/5">
          <PropertyField
            defaultValue={condition.propertyName}
            parentFieldName={fieldName}
            index={index}
            fields={fields}
            currentField={selectedField}
            propertyTypes={propertyTypes}
          />
        </div>
        <div className="w-1/5">
          <PropertyOperator
            defaultValue={condition.propertyOperator}
            parentFieldName={fieldName}
            index={index}
            currentField={selectedField}
            operators={operators || []}
          />
        </div>
        <div className="w-2/5 flex items-center gap-2">
          <PropertyInput
            defaultValue={condition.propertyValue}
            parentFieldName={fieldName}
            index={index}
            operators={operators || []}
            selectedField={selectedField}
          />
          <Button
            variant="destructive"
            size="icon"
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => remove()}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
