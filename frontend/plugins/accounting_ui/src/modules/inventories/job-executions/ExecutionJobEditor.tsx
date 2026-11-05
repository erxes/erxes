import { useEffect, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, RecordTable, Sheet, Table } from 'erxes-ui';
import { AccountingSheet } from '@/layout/components/Sheet';
import { JobForm } from '@/settings/jobs/components/JobForm';
import { TJobForm } from '@/settings/jobs/types/Job';
import { scaleJobFormValues } from '@/settings/jobs/utils/jobFormValues';
import { getJobFormSchema } from '@/settings/jobs/types/jobFormSchema';
import { ExecutionMetadata } from './JobExecutionEditor';
import { JobExecution } from './types';
import { jobValues } from '@/inventories/job-executions/jobValues';
import { SelectExecutionJob } from './SelectExecutionJob';

export const ExecutionJobEditor = ({
  rowId,
  index,
  metadata,
  initial,
  forms,
  readOnly,
  onRemove,
}: {
  rowId: string;
  index: number;
  metadata: UseFormReturn<ExecutionMetadata>;
  initial?: JobExecution['jobs'][number];
  forms: Map<string, UseFormReturn<TJobForm>>;
  readOnly: boolean;
  onRemove?: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const lastQuantity = useRef(initial?.quantity ?? 1);
  const form = useForm<TJobForm>({
    resolver: zodResolver(getJobFormSchema(t)),
    defaultValues: {
      name: initial?.jobName ?? '',
      description: '',
      durationType: 'real',
      inputs: (initial?.inputs ?? []).map((row) => ({
        productId: row.productId ?? '',
        uom: row.uom ?? '',
        quantity: row.quantity ?? 0,
      })),
      outputs: (initial?.outputs ?? []).map((row) => ({
        productId: row.productId ?? '',
        uom: row.uom ?? '',
        quantity: row.quantity ?? 0,
        costRatio: row.costRatio ?? 1,
      })),
      laborCosts: (initial?.laborCosts ?? []).map(
        ({ name, amount, accountId }) => ({ name, amount, accountId }),
      ),
      overheadCosts: (initial?.overheadCosts ?? []).map(
        ({ name, amount, accountId }) => ({ name, amount, accountId }),
      ),
    },
  });
  useEffect(() => {
    forms.set(rowId, form);
    return () => {
      forms.delete(rowId);
    };
  }, [form, forms, rowId]);
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  useEffect(() => {
    if (hasErrors) setOpen(true);
  }, [hasErrors]);
  return (
    <Table.Row className="h-cell hover:bg-background!">
      <Table.Cell className="w-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <Sheet.Trigger asChild>
            <RecordTable.MoreButton
              type="button"
              className="h-8 w-8"
              aria-label={`${t('production-job')} ${index + 1}`}
            />
          </Sheet.Trigger>
          <AccountingSheet
            title={form.watch('name') || t('production-job')}
            className="sm:max-w-3xl"
          >
            <Sheet.Content className="overflow-y-auto p-5">
              <JobForm
                form={form}
                onSubmit={() => undefined}
                loading={false}
                hideSettings
                embedded
                baseUnitsOnly
                readOnlyCostRatio
                readOnly={readOnly}
              />
            </Sheet.Content>
            <Sheet.Footer className="border-t bg-background shrink-0">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={async () => {
                  if (readOnly || (await form.trigger())) setOpen(false);
                }}
              >
                {t('close')}
              </Button>
            </Sheet.Footer>
          </AccountingSheet>
        </Sheet>
      </Table.Cell>
      <Table.Cell className="whitespace-normal">
        <Form {...metadata}>
          <Form.Field
            control={metadata.control}
            name={`jobs.${index}.jobId`}
            render={() => (
              <Form.Item>
                <Form.Label className="sr-only">
                  {t('production-job')}
                </Form.Label>
                <SelectExecutionJob
                  label={form.watch('name')}
                  onChange={(job) => {
                    metadata.setValue(`jobs.${index}.jobId`, job._id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    form.reset(jobValues(job, lastQuantity.current));
                  }}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </Form>
      </Table.Cell>
      <Table.Cell className="whitespace-normal">
        <Form {...metadata}>
          <Form.Field
            control={metadata.control}
            name={`jobs.${index}.quantity`}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Label className="sr-only">
                  {t('production-quantity')}
                </Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min="0"
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(event) => {
                      const quantity = event.target.valueAsNumber;
                      field.onChange(quantity);
                      if (!Number.isFinite(quantity) || quantity <= 0) return;
                      const multiplier = quantity / lastQuantity.current;
                      lastQuantity.current = quantity;
                      const scaled = scaleJobFormValues(
                        form.getValues(),
                        multiplier,
                      );
                      for (const name of [
                        'inputs',
                        'outputs',
                        'laborCosts',
                        'overheadCosts',
                      ] as const)
                        form.setValue(name, scaled[name], {
                          shouldDirty: true,
                        });
                    }}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Form>
      </Table.Cell>
      <Table.Cell className="w-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={t('production-remove-job')}
          aria-label={t('production-remove-job')}
          disabled={readOnly || !onRemove}
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </Table.Cell>
    </Table.Row>
  );
};
