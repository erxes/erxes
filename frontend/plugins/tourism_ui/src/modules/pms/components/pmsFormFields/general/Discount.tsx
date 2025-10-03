import { Control, useFieldArray } from 'react-hook-form';
import { Button, Form, Input } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const Discount = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'discounts',
  });

  return (
    <div className="space-y-4">
      <Button onClick={() => append({})}>
        <IconPlus />
        Add discount
      </Button>

      {fields.map((field, index) => (
        <div className="flex gap-6 items-end">
          <div className="w-full grid grid-cols-3 gap-6">
            <Form.Field
              control={control}
              name={`discounts.${index}.type`}
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
              name={`discounts.${index}.title`}
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
              name={`discounts.${index}.config`}
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
            variant={'destructive'}
            size={'icon'}
            className="h-8 w-8"
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
