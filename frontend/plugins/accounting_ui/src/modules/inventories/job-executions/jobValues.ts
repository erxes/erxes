import { IJob, TJobForm } from '@/settings/jobs/types/Job';
import { scaleJobFormValues } from '@/settings/jobs/utils/jobFormValues';

export const jobValues = (card: IJob, quantity: number): TJobForm =>
  scaleJobFormValues(
    {
      name: card.name,
      description: card.description ?? '',
      durationType: 'real',
      duration: undefined,
      inputs: card.inputs.map((row) => ({
        productId: row.productId,
        uom: row.uom ?? '',
        quantity: row.quantity,
      })),
      outputs: card.outputs.map((row) => ({
        productId: row.productId,
        uom: row.uom ?? '',
        quantity: row.quantity,
        costRatio: row.costRatio ?? 1,
      })),
      laborCosts: (card.laborCosts ?? []).map((row) => ({
        name: row.name,
        amount: row.amount,
        accountId: row.accountId,
      })),
      overheadCosts: (card.overheadCosts ?? []).map((row) => ({
        name: row.name,
        amount: row.amount,
        accountId: row.accountId,
      })),
    },
    quantity,
  );
