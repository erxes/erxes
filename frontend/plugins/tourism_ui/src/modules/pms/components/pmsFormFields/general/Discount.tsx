import { Control, useFieldArray } from 'react-hook-form';
import { Button, Form, Input } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const Discount = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'discount',
  });

  return (
    <div className="space-y-4">
      <Button onClick={() => append({})}>
        <IconPlus />
        Add discount
      </Button>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-end">
          <div className="grid grid-cols-3 gap-4 w-full">
            <Form.Field
              control={control}
              name={`discount.${index}.type`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Type</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name={`discount.${index}.title`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Title</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name={`discount.${index}.config`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Config</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <Button
            variant="destructive"
            size="icon"
            className="w-8 h-8"
            onClick={() => remove(index)}
          >
            <IconTrash />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Discount;
