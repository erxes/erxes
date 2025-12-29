import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, Select } from 'erxes-ui';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

type FormValues = {
  branchId?: string;
  departmentId?: string;
};

const PerPrintConditions = ({ condition, onChange, onRemove }: Props) => {
  const form = useForm<FormValues>({
    defaultValues: {
      branchId: condition.branchId || '',
      departmentId: condition.departmentId || '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onChange(condition.id, { ...condition, ...values });
  };

  return (
    <Form {...form}>
      <form
        onBlur={form.handleSubmit(handleSubmit)}
        className="flex items-center gap-2"
      >
        <Form.Field
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Branch</Form.Label>

              <Form.Control>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
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
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(condition.id)}
        >
          ✕
        </Button>
      </form>
    </Form>
  );
};

export default PerPrintConditions;
