import { Collection } from 'mongoose';
import { z } from 'zod';

export enum TPropertyProducers {
  VALUE_USAGE = 'valueUsage',
}

export const PropertyValueUsageInput = z.object({
  contentType: z.string(),
  // Resolved by core, e.g. propertiesData.g:<groupId>.<fieldId>.
  path: z.string(),
  // Samples stop at the first matches; counts may scan the whole collection,
  // so they are asked for apart and arrive later.
  part: z.enum(['samples', 'counts']),
  optionValues: z.array(z.string()).optional(),
  // Narrows the answer to records holding this one option.
  value: z.string().optional(),
});

export type TPropertyValueUsageInput = z.infer<typeof PropertyValueUsageInput>;

export type TPropertyProducersInput = {
  [TPropertyProducers.VALUE_USAGE]: TPropertyValueUsageInput;
};

export interface IPropertyValueSamples {
  // False when the records could not be checked; callers keep the strict rule.
  known: boolean;
  samples: { _id: string; label: string }[];
}

export interface IPropertyValueCounts {
  known: boolean;
  count: number;
  capped: boolean;
  // null when the per-option tally gave up; saved options then stay archived.
  byOption: { value: string; count: number }[] | null;
}

export type TPropertyValueUsage = IPropertyValueSamples | IPropertyValueCounts;

export type TPropertyValueUsageHandler = (args: {
  subdomain: string;
  data: TPropertyValueUsageInput;
}) => Promise<TPropertyValueUsage>;

export const UNKNOWN_VALUE_SAMPLES: IPropertyValueSamples = {
  known: false,
  samples: [],
};

export const UNKNOWN_VALUE_COUNTS: IPropertyValueCounts = {
  known: false,
  count: 0,
  capped: false,
  byOption: null,
};

export const unknownValueUsage = (
  part: TPropertyValueUsageInput['part'],
): TPropertyValueUsage =>
  part === 'samples' ? UNKNOWN_VALUE_SAMPLES : UNKNOWN_VALUE_COUNTS;

const COUNT_CAP = 1_000;
const SAMPLE_LIMIT = 20;
// No index backs custom fields, so each query gives up rather than stall.
const MAX_TIME_MS = 3_000;

const valueFilter = ({ path, value }: TPropertyValueUsageInput) => ({
  [path]: value || { $exists: true },
});

export const measurePropertyValueSamples = async (
  collection: Collection,
  input: TPropertyValueUsageInput,
  toLabel: (doc: Record<string, unknown>) => string,
): Promise<IPropertyValueSamples> => {
  try {
    const docs = await collection
      .find(valueFilter(input), { limit: SAMPLE_LIMIT, maxTimeMS: MAX_TIME_MS })
      .toArray();

    return {
      known: true,
      samples: docs.map((doc) => ({
        _id: String(doc._id),
        label: toLabel(doc) || String(doc._id),
      })),
    };
  } catch {
    return UNKNOWN_VALUE_SAMPLES;
  }
};

const countOptions = async (
  collection: Collection,
  { path, optionValues = [] }: TPropertyValueUsageInput,
) => {
  try {
    const rows = await collection
      .aggregate<{ _id: unknown; count: number }>(
        [
          { $match: { [path]: { $in: optionValues } } },
          { $project: { v: `$${path}` } },
          // Rows and multi-selects both nest arrays; a scalar unwinds as itself.
          { $unwind: '$v' },
          { $unwind: '$v' },
          { $match: { v: { $in: optionValues } } },
          { $group: { _id: '$v', count: { $sum: 1 } } },
        ],
        { maxTimeMS: MAX_TIME_MS },
      )
      .toArray();

    return rows.map(({ _id, count }) => ({ value: String(_id), count }));
  } catch {
    return null;
  }
};

// The total and the per-option tally fail apart, so one slow scan keeps the other.
export const measurePropertyValueCounts = async (
  collection: Collection,
  input: TPropertyValueUsageInput,
): Promise<IPropertyValueCounts> => {
  const [count, byOption] = await Promise.all([
    collection
      .countDocuments(valueFilter(input), {
        limit: COUNT_CAP,
        maxTimeMS: MAX_TIME_MS,
      })
      .catch(() => null),
    input.optionValues?.length && !input.value
      ? countOptions(collection, input)
      : [],
  ]);

  if (count === null) {
    return { ...UNKNOWN_VALUE_COUNTS, byOption };
  }

  return { known: true, count, capped: count >= COUNT_CAP, byOption };
};

// Runs where the records live; core and plugins share it so answers match.
export const measurePropertyValueUsage = (
  collection: Collection,
  input: TPropertyValueUsageInput,
  toLabel: (doc: Record<string, unknown>) => string,
): Promise<TPropertyValueUsage> =>
  input.part === 'samples'
    ? measurePropertyValueSamples(collection, input, toLabel)
    : measurePropertyValueCounts(collection, input);
