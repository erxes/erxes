import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  defaultReferenceValues,
  HrmReferenceRecord,
  ReferenceConfig,
  ReferenceFormValues,
  referenceFormSchema,
} from '../types/settings';

const toFormValues = (
  record?: HrmReferenceRecord | null,
): ReferenceFormValues => ({
  ...defaultReferenceValues,
  code: record?.code ?? '',
  name: record?.name ?? '',
  description: record?.description ?? '',
  employeeRate: record?.employeeRate ?? 0,
  employerRate: record?.employerRate ?? 0,
  rank: record?.rank ?? 0,
  baseSalary: record?.baseSalary ?? 0,
  allowanceAmount: record?.allowanceAmount ?? 0,
  allowanceRate: record?.allowanceRate ?? 0,
  valueType: record?.valueType ?? 'percentOfBaseSalary',
  minMonths: record?.brackets?.[0]?.minMonths ?? 0,
  maxMonths: record?.brackets?.[0]?.maxMonths ?? undefined,
  value: record?.brackets?.[0]?.value ?? 0,
  category: record?.category ?? '',
  score: record?.score ?? 0,
});

export const ReferenceFormSheet = ({
  config,
  record,
  open,
  submitting,
  onOpenChange,
  onSubmit,
}: {
  config: ReferenceConfig;
  record?: HrmReferenceRecord | null;
  open: boolean;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ReferenceFormValues) => Promise<void>;
}) => {
  const form = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceFormSchema),
    defaultValues: toFormValues(record),
  });

  useEffect(() => {
    form.reset(toFormValues(record));
  }, [form, record, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="flex-col p-0 sm:max-w-md">
        <Sheet.Header className="px-5 shrink-0">
          <Sheet.Title>
            {record ? `${config.title} засах` : config.createLabel}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            className="flex flex-1 flex-col bg-background min-h-0"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Sheet.Content className="flex-1 min-h-0 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-5">
                {config.fields.map((field) => (
                  <Form.Field
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: formField }) => (
                      <Form.Item
                        className={
                          field.type === 'textarea' ? 'col-span-2' : undefined
                        }
                      >
                        <Form.Label>{field.label}</Form.Label>
                        <Form.Control>
                          {field.type === 'textarea' ? (
                            <Textarea {...formField} />
                          ) : field.type === 'select' ? (
                            <Select
                              value={String(formField.value || '')}
                              onValueChange={formField.onChange}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Сонгох" />
                              </Select.Trigger>
                              <Select.Content>
                                {(field.options || []).map((option) => (
                                  <Select.Item
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          ) : (
                            <Input
                              type={field.type || 'text'}
                              step={
                                field.type === 'number' ? '0.01' : undefined
                              }
                              {...formField}
                            />
                          )}
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ))}
              </div>
            </Sheet.Content>
            <Sheet.Footer className="shrink-0 border-t bg-background">
              <Sheet.Close asChild>
                <Button variant="outline" type="button" size="lg">
                  Болих
                </Button>
              </Sheet.Close>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? <Spinner /> : 'Хадгалах'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
