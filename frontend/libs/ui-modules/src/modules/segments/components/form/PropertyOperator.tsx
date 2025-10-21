import { Form, Select } from 'erxes-ui';

import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { IPropertyCondtion } from '../../types';
import { FieldWithError } from '../FieldWithError';

export const PropertyOperator = ({
  currentField,
  operators,
  parentFieldName,
  defaultValue,
}: IPropertyCondtion) => {
  const { form } = useSegment();
  const { control } = form;

  return (
    <Form.Field
      control={control}
      name={`${parentFieldName}.propertyOperator`}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FieldWithError error={fieldState.error}>
          <Select
            defaultValue={field?.value}
            disabled={!currentField}
            onValueChange={(selectedValue) => field.onChange(selectedValue)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select an operator" />
            </Select.Trigger>
            <Select.Content>
              {operators.map((operator, i) => (
                <Select.Item value={operator.value}>
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
