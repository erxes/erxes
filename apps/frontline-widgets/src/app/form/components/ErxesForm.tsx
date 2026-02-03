import {
  cn,
  DatePicker,
  Form,
  InfoCard,
  Input,
  Select,
  Switch,
  Textarea,
} from 'erxes-ui';
import { IFormStep } from '../types/formTypes';
import { useForm } from 'react-hook-form';
import { useErxesForm } from '../ context/erxesFormContext';

export const ErxesForm = ({ step }: { step: IFormStep }) => {
  const formData = useErxesForm();
  const fields = formData.fields.filter(
    (field) => field.pageNumber === step.order,
  );
  const form = useForm();

  return (
    <Form {...form}>
      <form className="text-sm">
        <InfoCard title={step.name}>
          <InfoCard.Content>
            <div className="grid grid-cols-2 gap-4 mb-2">
              {fields.map((erxesField) => {
                return (
                  <Form.Field
                    key={erxesField._id}
                    name={erxesField._id}
                    control={form.control}
                    render={({ field }) => {
                      if (erxesField.type === 'number') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <Input.Number
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              placeholder={erxesField.text}
                            />
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'boolean') {
                        return (
                          <ErxesFormItem
                            span={erxesField.column}
                            className="flex items-end gap-2 space-y-0"
                          >
                            <div className="flex items-center gap-2 h-8">
                              <Form.Control>
                                <Switch {...field} />
                              </Form.Control>
                              <Form.Label variant="peer">
                                {erxesField.text}
                              </Form.Label>
                            </div>
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'textarea') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <Textarea
                              {...field}
                              placeholder={erxesField.text}
                            />
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'select') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
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
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'date') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <DatePicker
                              {...field}
                              placeholder={erxesField.text}
                            />
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      return (
                        <ErxesFormItem span={erxesField.column}>
                          <Form.Label>{erxesField.text}</Form.Label>
                          <Input {...field} placeholder={erxesField.text} />
                          {erxesField.description && (
                            <Form.Description>
                              {erxesField.description}
                            </Form.Description>
                          )}
                          <Form.Message />
                        </ErxesFormItem>
                      );
                    }}
                  />
                );
              })}
            </div>
          </InfoCard.Content>
        </InfoCard>
      </form>
    </Form>
  );
};

export const ErxesFormItem = ({
  span,
  ...props
}: React.ComponentProps<typeof Form.Item> & { span: number }) => (
  <Form.Item {...props} className={cn(props.className, span && `col-span-2`)} />
);
