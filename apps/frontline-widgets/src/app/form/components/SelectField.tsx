import { ControllerRenderProps } from 'react-hook-form';
import { IFormField } from '../types/formTypes';
import { ErxesFormItem } from './ErxesForm';
import { Form, Select } from 'erxes-ui';

type Props = {
  erxesField: IFormField;
  field: ControllerRenderProps<any, string>;
};

export const SelectField = ({ erxesField, field }: Props) => {
  return (
    <ErxesFormItem span={erxesField.column}>
      <Form.Label>{erxesField.text}</Form.Label>
      <Select value={field.value} onValueChange={field.onChange}>
        <Form.Control>
          <Select.Trigger>
            <Select.Value placeholder={erxesField.text} />
          </Select.Trigger>
        </Form.Control>
        <Select.Content>
          {erxesField.options.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {erxesField.description && (
        <Form.Description>{erxesField.description}</Form.Description>
      )}
      <Form.Message />
    </ErxesFormItem>
  );
};
