import { useEffect, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import { Button, Collapsible, Form, Input, Tooltip } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME } from 'ui-modules';
import { JobForm } from '@/settings/jobs/components/JobForm';
import { TJobForm } from '@/settings/jobs/types/Job';
import { scaleJobFormValues } from '@/settings/jobs/utils/jobFormValues';
import { getJobFormSchema } from '@/settings/jobs/types/jobFormSchema';
import { ExecutionMetadata } from '@/inventories/job-executions/JobExecutionEditor';
import { JobExecution } from '@/inventories/job-executions/types';
import { jobValues } from '@/inventories/job-executions/jobValues';
import { SelectExecutionJob } from '@/inventories/job-executions/SelectExecutionJob';

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
  const handleOpenChange = async (next: boolean) => {
    if (next || readOnly || (await form.trigger())) setOpen(next);
  };
  const removeDisabled = readOnly || !onRemove;
  const removeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0"
      aria-label={t('production-remove-job')}
      disabled={removeDisabled}
      onClick={onRemove}
    >
      <IconTrash />
    </Button>
  );
  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => void handleOpenChange(next)}
      className="rounded-md border"
    >
      <div className="flex items-start gap-1 p-1">
        <Collapsible.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="group size-7 shrink-0"
            aria-label={`${t('production-job')} ${index + 1}`}
            aria-expanded={open}
          >
            <Collapsible.TriggerIcon />
          </Button>
        </Collapsible.Trigger>
        <fieldset
          disabled={readOnly}
          className="flex min-w-0 flex-1 items-start gap-1"
        >
          <Form {...metadata}>
            <Form.Field
              control={metadata.control}
              name={`jobs.${index}.jobId`}
              render={() => (
                <Form.Item className="flex-1 min-w-0 space-y-0.5">
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
            <Form.Field
              control={metadata.control}
              name={`jobs.${index}.quantity`}
              render={({ field }) => (
                <Form.Item className="w-28 shrink-0 space-y-0.5">
                  <Form.Label className="sr-only">
                    {t('production-quantity')}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min="0"
                      className={PANEL_INPUT_CLASS_NAME}
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
        </fieldset>
        {removeDisabled ? (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span>{removeButton}</span>
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom">
              {t('production-remove-job')}
            </Tooltip.Content>
          </Tooltip>
        ) : (
          removeButton
        )}
      </div>
      <Collapsible.Content className="border-t p-3">
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
      </Collapsible.Content>
    </Collapsible>
  );
};
