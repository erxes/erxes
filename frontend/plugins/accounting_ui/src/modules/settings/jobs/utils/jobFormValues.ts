import { IJob, TJobForm } from '@/settings/jobs/types/Job';
import { normalizeJobDurationType } from '@/settings/jobs/types/jobFormSchema';

export const jobFormValues = (job: IJob): TJobForm => ({
  code: job.code || '',
  name: job.name,
  description: job.description || '',
  duration: job.durationType === 'real' ? undefined : job.duration ?? undefined,
  durationType: normalizeJobDurationType(job.durationType),
  status: job.status || 'active',
  laborCosts: job.laborCosts ?? [],
  overheadCosts: job.overheadCosts ?? [],
  inputs: job.inputs ?? [],
  outputs: job.outputs ?? [],
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
