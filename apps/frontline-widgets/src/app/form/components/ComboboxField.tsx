import { ControllerRenderProps } from 'react-hook-form';
import { IFormField } from '../types/formTypes';
import { useState } from 'react';
import { ErxesFormItem } from './ErxesForm';
import { Combobox, Command, Form, Popover } from 'erxes-ui';

type Props = {
  erxesField: IFormField;
  field: ControllerRenderProps<any, string>;
};

export const ComboboxField = ({ erxesField, field }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <ErxesFormItem span={erxesField.column}>
      <Form.Label>{erxesField.text}</Form.Label>
      {erxesField.description && (
        <Form.Description>{erxesField.description}</Form.Description>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger>
          <span>{field.value || erxesField.content}</span>
        </Combobox.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              <Command.Input placeholder="search..." />
              {erxesField.options.map((option) => (
                <Command.Item
                  key={option}
                  value={option}
                  onSelect={(value) => {
                    field.onChange(value);
                    setOpen(false);
                  }}
                >
                  {option}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <Form.Message />
    </ErxesFormItem>
  );
};
