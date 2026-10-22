import { z } from 'zod';
import { TJobForm } from '@/settings/jobs/types/Job';

export const jobSubUomsSchema = z
  .array(
    z.object({
      uom: z.string().nullish(),
      ratio: z.number().nullish(),
    }),
  )
  .nullish();

export interface JobProductUnits {
  _id: string;
  uom?: string | null;
  subUoms?: z.infer<typeof jobSubUomsSchema>;
}

export interface JobUom {
  _id: string;
  code?: string | null;
  name?: string | null;
}

const findUnit = (uoms: JobUom[], value?: string | null) =>
  uoms.find(
    (unit) => value && [unit._id, unit.code, unit.name].includes(value),
  );

export const uomToCode = (uoms: JobUom[], value?: string | null): string =>
  findUnit(uoms, value)?.code || value || '';

export const uomToName = (uoms: JobUom[], value?: string | null): string =>
  findUnit(uoms, value)?.name || value || '';

export const jobItemInBaseUnits = (
  item: TJobForm['inputs'][number],
  product: JobProductUnits,
  uoms: JobUom[],
): TJobForm['inputs'][number] => {
  const uom = uomToCode(uoms, product.uom);
  const selected = uomToCode(uoms, item.uom);
  if (!selected || selected === uom) return { ...item, uom };
  const ratio = product.subUoms?.find(
    (unit) => uomToCode(uoms, unit.uom) === selected,
  )?.ratio;
  if (typeof ratio !== 'number' || !Number.isFinite(ratio) || ratio <= 0)
    throw new Error('Invalid product unit ratio');
  const quantity = item.quantity * ratio;
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error('Converted quantity must be finite and positive');
  return { ...item, uom, quantity };
};
