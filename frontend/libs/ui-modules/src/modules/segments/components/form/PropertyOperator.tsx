import { Form, Select } from 'erxes-ui';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentGroupField } from '../../context/SegmentGroupField';
import { FieldWithError } from '../FieldWithError';

export const PropertyOperator = () => {
  const { form } = useSegment();
  const { control } = form;
  const {
    selectedField,
    operators = [],
    conditionFieldName,
    loading,
    onBeforeFieldChange,
  } = useSegmentGroupField();

  return (
    <Form.Field
      control={control}
      name={`${conditionFieldName}.propertyOperator`}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          <Select
            value={field.value}
            disabled={!selectedField || loading}
            onValueChange={(selectedValue) => {
              onBeforeFieldChange?.('propertyOperator');
              field.onChange(selectedValue);
            }}
          >
            <Select.Trigger className="w-full min-w-0">
              <Select.Value placeholder="Select an operator" />
            </Select.Trigger>
            <Select.Content>
              {operators.map((operator, i) => (
                <Select.Item
                  key={i}
                  value={operator.value}
                  className="[&_svg]:text-primary"
                >
                  {operator.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </FieldWithError>
      )}
    />
  );
};
