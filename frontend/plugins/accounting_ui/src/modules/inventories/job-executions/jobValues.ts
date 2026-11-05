import { IJob, TJobForm } from '@/settings/jobs/types/Job';
import {
  jobFormValues,
  scaleJobFormValues,
} from '@/settings/jobs/utils/jobFormValues';

export const jobValues = (card: IJob, quantity: number): TJobForm => {
  const values = jobFormValues(card);
  return scaleJobFormValues(
    {
      name: values.name,
      description: values.description,
      durationType: 'real',
      duration: undefined,
      inputs: values.inputs.map((row) => ({
        productId: row.productId,
        uom: row.uom ?? '',
        quantity: row.quantity,
      })),
      outputs: values.outputs.map((row) => ({
        productId: row.productId,
        uom: row.uom ?? '',
        quantity: row.quantity,
        costRatio: row.costRatio ?? 1,
      })),
      laborCosts: values.laborCosts.map((row) => ({
        name: row.name,
        amount: row.amount,
        accountId: row.accountId,
      })),
      overheadCosts: values.overheadCosts.map((row) => ({
        name: row.name,
        amount: row.amount,
        accountId: row.accountId,
      })),
    },
    quantity,
  );
};
