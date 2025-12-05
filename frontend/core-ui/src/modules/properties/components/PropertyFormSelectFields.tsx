import { Button, Form, InfoCard, Input } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { IPropertyForm } from '../types/Properties';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export const PropertyFormSelectFields = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const type = form.watch('type');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options' as never,
  });

  if (type !== 'select') {
    return <></>;
  }

  return (
    <InfoCard title="Select options">
      <InfoCard.Content>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div className="flex gap-2" key={field.id}>
              <Form.Field
                control={form.control}
                name={`options.${index}.label`}
                render={({ field }) => (
                  <Form.Item className="flex-auto">
                    <Form.Label>Label</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Enter label" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name={`options.${index}.value`}
                render={({ field }) => (
                  <Form.Item className="flex-auto">
                    <Form.Label>Value</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Enter value" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Button
                onClick={() => remove(index)}
                variant="secondary"
                size="icon"
                className="mt-auto size-8"
              >
                <IconTrash />
              </Button>
            </div>
          ))}
          <Button
            onClick={() => append({ label: '', value: '' })}
            variant="secondary"
          >
            <IconPlus /> Add option
          </Button>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
