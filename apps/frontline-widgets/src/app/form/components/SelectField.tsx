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
      <Form.Label className="text-widget-label">
        {erxesField.text}
        {erxesField.isRequired && <span className="text-destructive"> *</span>}
      </Form.Label>
      <Select value={field.value} onValueChange={field.onChange}>
        <Form.Control>
          <Select.Trigger className="text-foreground">
            <Select.Value
              placeholder={erxesField.text}
              className="text-foreground"
            />
          </Select.Trigger>
        </Form.Control>
        <Select.Content>
          {erxesField.options.map((option) => (
            <Select.Item
              key={option}
              value={option}
              className="text-foreground"
            >
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
