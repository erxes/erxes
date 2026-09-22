import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  Label,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from 'erxes-ui';
import { Control, FieldValues, Path } from 'react-hook-form';
import { ITicketPropertiesFields } from '../../types/connection';

type TicketPropertyFieldProps<T extends FieldValues> = {
  propertyField: ITicketPropertiesFields;
  control: Control<T>;
};

export const TicketPropertyField = <T extends FieldValues>({
  propertyField,
  control,
}: TicketPropertyFieldProps<T>) => {
  const { fieldId, label, placeholder, type, options = [] } = propertyField;

  return (
    <Form.Field
      name={`propertiesData.${fieldId}` as Path<T>}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label || 'Property'}</Form.Label>
          <Form.Control>
            {(() => {
              switch (type) {
                case 'textarea':
                  return (
                    <Textarea
                      name={field.name}
                      ref={field.ref}
                      value={(field.value as string) ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={placeholder || ''}
                    />
                  );
                case 'boolean':
                  return (
                    <Switch
                      id={fieldId}
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  );
                case 'date':
                  return (
                    <DatePicker
                      value={field.value as Date | undefined}
                      onChange={(date) => field.onChange(date)}
                      placeholder={placeholder || 'Pick a date'}
                      className="w-full"
                    />
                  );
                case 'select':
                  return (
                    <Select
                      value={(field.value as string) ?? ''}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger>
                        <Select.Value
                          placeholder={placeholder || 'Select an option'}
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {options.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  );
                case 'radio':
                  return (
                    <RadioGroup
                      value={(field.value as string) ?? ''}
                      onValueChange={field.onChange}
                    >
                      {options.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-2"
                        >
                          <RadioGroup.Item
                            id={`${fieldId}_${option.value}`}
                            value={option.value}
                          />
                          <Label htmlFor={`${fieldId}_${option.value}`}>
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  );
                case 'multiSelect':
                case 'check':
                  return (
                    <div className="flex flex-col gap-2">
                      {options.map((option) => {
                        const selectedValues = (field.value as string[]) ?? [];

                        return (
                          <div
                            key={option.value}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={`${fieldId}_${option.value}`}
                              checked={selectedValues.includes(option.value)}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  checked
                                    ? [...selectedValues, option.value]
                                    : selectedValues.filter(
                                        (value) => value !== option.value,
                                      ),
                                )
                              }
                            />
                            <Label htmlFor={`${fieldId}_${option.value}`}>
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  );
                default:
                  return (
                    <Input
                      name={field.name}
                      ref={field.ref}
                      type={type === 'number' ? 'number' : 'text'}
                      value={(field.value as string) ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={placeholder || ''}
                    />
                  );
              }
            })()}
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
