import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IJobExecutionItem } from '../@types/jobExecutions';

export interface IExecutionProduct {
  _id: string;
  uom?: string;
  subUoms?: { uom: string; ratio: number }[];
}

export interface IExecutionUnit {
  _id: string;
  code?: string;
  name?: string;
}

export const executionBaseQuantity = (
  item: IJobExecutionItem['inputs'][number],
  product: IExecutionProduct | undefined,
  units: IExecutionUnit[] = [],
) => {
  if (!product) throw new Error(`Product not found: ${item.productId}`);
  if (!Number.isFinite(item.quantity) || item.quantity <= 0)
    throw new Error('Product quantity must be finite and positive');
  const canonicalUnit = (value?: string) => {
    if (!value) return value;
    return (
      units.find((unit) => [unit._id, unit.code, unit.name].includes(value))
        ?.code || value
    );
  };
  if (!item.uom || canonicalUnit(item.uom) === canonicalUnit(product.uom))
    return item.quantity;
  const subUom = product.subUoms?.find(
    (unit) => canonicalUnit(unit.uom) === canonicalUnit(item.uom),
  );
  if (!subUom || !Number.isFinite(subUom.ratio) || subUom.ratio <= 0)
    throw new Error(`Invalid product unit: ${item.productId} / ${item.uom}`);
  const quantity = item.quantity * subUom.ratio;
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error('Converted quantity must be finite and positive');
  return quantity;
};

export const getExecutionProductUnits = async (
  subdomain: string,
  jobs: IJobExecutionItem[],
) => {
  const items = jobs.flatMap((job) => [...job.inputs, ...job.outputs]);
  const productIds = [...new Set(items.map((row) => row.productId))];
  const products: IExecutionProduct[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: {
        _id: { $in: productIds },
        status: { $nin: ['deleted', 'archived'] },
      },
      fields: { _id: 1, uom: 1, subUoms: 1 },
    },
    defaultValue: [],
  });
  const unitValues = [
    ...new Set(
      [
        ...items.map((row) => row.uom),
        ...products.flatMap((product) => [
          product.uom,
          ...(product.subUoms ?? []).map((unit) => unit.uom),
        ]),
      ].filter((unit): unit is string => Boolean(unit)),
    ),
  ];
  const units: IExecutionUnit[] = unitValues.length
    ? await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'productUoms',
        action: 'find',
        input: {
          query: {
            $or: [
              { _id: { $in: unitValues } },
              { code: { $in: unitValues } },
              { name: { $in: unitValues } },
            ],
          },
        },
        defaultValue: [],
      })
    : [];
  return { products, units };
};

export const executionJobsInBaseUnits = <T extends IJobExecutionItem>(
  jobs: T[],
  products: IExecutionProduct[],
  units: IExecutionUnit[],
): T[] => {
  const productMap = new Map(products.map((product) => [product._id, product]));
  const convert = (rows: IJobExecutionItem['inputs']) =>
    rows.map((row) => {
      const product = productMap.get(row.productId);
      const quantity = executionBaseQuantity(row, product, units);
      const mainUnit = product?.uom;
      const uom =
        units.find(
          (unit) =>
            mainUnit && [unit._id, unit.code, unit.name].includes(mainUnit),
        )?.code ||
        mainUnit ||
        '';
      return { ...row, quantity, uom };
    });
  return jobs.map((job) => ({
    ...job,
    inputs: convert(job.inputs),
    outputs: convert(job.outputs),
  }));
};
