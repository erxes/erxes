import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from 'erxes-ui';
import { Form } from 'erxes-ui';
import { Select } from 'erxes-ui';


type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const PerPrintConditions = ({ condition, onChange, onRemove }: Props) => {
  const form = useForm({
    defaultValues: {
      branchId: condition.branchId,
      departmentId: condition.departmentId,
    },
  });

  const onSubmit = (values: any) => {
    onChange(condition.id, { ...condition, ...values });
  };

  return (
    <FormProvider {...form}>
      <form onBlur={form.handleSubmit(onSubmit)}>
        <Form.Field
          name="branchId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Branch</Form.Label>

              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Choose branch" />
                  </Select.Trigger>

                  <Select.Content>
                    <Select.Item value="">Clean branch</Select.Item>
                    <Select.Item value="1">Branch 1</Select.Item>
                    <Select.Item value="2">Branch 2</Select.Item>
                  </Select.Content>
                </Select>
              </Form.Control>

              <Form.Message />
            </Form.Item>
          )}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(condition.id)}
        >
          ✕
        </Button>
      </form>
    </FormProvider>
  );
};

export default PerPrintConditions;
