import { Form, Select } from 'erxes-ui';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { IPropertyCondtion } from '../../types';
import { FieldWithError } from '../FieldWithError';

export const PropertyOperator = ({
  currentField,
  operators,
  parentFieldName,
  defaultValue,
  loading,
}: IPropertyCondtion) => {
  const { form } = useSegment();
  const { control } = form;

  return (
    <Form.Field
      control={control}
      name={`${parentFieldName}.propertyOperator`}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          <Select
            value={field.value}
            disabled={!currentField || loading}
            onValueChange={(selectedValue) => field.onChange(selectedValue)}
          >
            <Select.Trigger>
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
