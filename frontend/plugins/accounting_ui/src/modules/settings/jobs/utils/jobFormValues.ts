import { IJob, IJobItem, TJobForm } from '@/settings/jobs/types/Job';
import { normalizeJobDurationType } from '@/settings/jobs/types/jobFormSchema';

const formItems = (rows: IJob['inputs']): TJobForm['inputs'] =>
  (rows ?? [])
    .filter((row): row is IJobItem => row !== null)
    .map((row) => ({
      productId: row.productId ?? '',
      uom: row.uom ?? undefined,
      quantity: row.quantity ?? 0,
      costRatio: row.costRatio ?? undefined,
    }));

export const jobFormValues = (job: IJob): TJobForm => ({
  code: job.code || '',
  name: job.name ?? '',
  description: job.description || '',
  duration: job.durationType === 'real' ? undefined : job.duration ?? undefined,
  durationType: normalizeJobDurationType(job.durationType),
  status: job.status || 'active',
  laborCosts: job.laborCosts ?? [],
  overheadCosts: job.overheadCosts ?? [],
  inputs: formItems(job.inputs),
  outputs: formItems(job.outputs),
});

export const scaleJobFormValues = (
  values: TJobForm,
  multiplier: number,
): TJobForm => ({
  ...values,
  inputs: values.inputs.map((row) => ({
    ...row,
    quantity: row.quantity * multiplier,
  })),
  outputs: values.outputs.map((row) => ({
    ...row,
    quantity: row.quantity * multiplier,
  })),
  laborCosts: values.laborCosts.map((row) => ({
    ...row,
    amount: row.amount * multiplier,
  })),
  overheadCosts: values.overheadCosts.map((row) => ({
    ...row,
    amount: row.amount * multiplier,
  })),
});
