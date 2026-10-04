import { Collection } from 'mongoose';
import {
  measurePropertyValueCounts,
  measurePropertyValueSamples,
  measurePropertyValueUsage,
  TPropertyValueUsageInput,
  UNKNOWN_VALUE_SAMPLES,
} from './valueUsage';

const timeout = () =>
  Promise.reject(new Error('operation exceeded time limit'));

// Only what the helpers call; each query can be made to give up on its own.
const fakeCollection = ({
  docs = [] as Record<string, unknown>[],
  count = 0 as number | (() => Promise<number>),
  options = [] as { _id: unknown; count: number }[] | (() => Promise<never>),
} = {}) => {
  const collection = {
    find: jest.fn(() => ({ toArray: async () => docs })),
    countDocuments: jest.fn(() =>
      typeof count === 'function' ? count() : Promise.resolve(count),
    ),
    aggregate: jest.fn(() => ({
      toArray: () =>
        typeof options === 'function' ? options() : Promise.resolve(options),
    })),
  };

  return { collection, typed: collection as unknown as Collection };
};

const input = (
  overrides: Partial<TPropertyValueUsageInput> = {},
): TPropertyValueUsageInput => ({
  contentType: 'core:customer',
  path: 'propertiesData.f1',
  part: 'samples',
  ...overrides,
});

const label = (doc: Record<string, unknown>) =>
  typeof doc.name === 'string' ? doc.name : '';

describe('measurePropertyValueSamples', () => {
  it('labels the first records holding a value', async () => {
    const { collection, typed } = fakeCollection({
      docs: [{ _id: 'a', name: 'Bold' }, { _id: 'b' }],
    });

    const result = await measurePropertyValueSamples(typed, input(), label);

    expect(result).toEqual({
      known: true,
      // a record without a name still shows, by its id
      samples: [
        { _id: 'a', label: 'Bold' },
        { _id: 'b', label: 'b' },
      ],
    });
    expect(collection.find).toHaveBeenCalledWith(
      { 'propertiesData.f1': { $exists: true } },
      expect.objectContaining({ limit: 20 }),
    );
  });

  it('narrows to one option when a value is given', async () => {
    const { collection, typed } = fakeCollection();

    await measurePropertyValueSamples(typed, input({ value: 'o1' }), label);

    expect(collection.find).toHaveBeenCalledWith(
      { 'propertiesData.f1': 'o1' },
      expect.anything(),
    );
  });

  it('reads as unknown when the scan gives up', async () => {
    const { collection, typed } = fakeCollection();
    collection.find.mockReturnValue({ toArray: timeout } as never);

    expect(await measurePropertyValueSamples(typed, input(), label)).toBe(
      UNKNOWN_VALUE_SAMPLES,
    );
  });
});

describe('measurePropertyValueCounts', () => {
  const counts = input({ part: 'counts', optionValues: ['o1', 'o2'] });

  it('counts the records and each option', async () => {
    const { typed } = fakeCollection({
      count: 3,
      options: [{ _id: 'o1', count: 2 }],
    });

    expect(await measurePropertyValueCounts(typed, counts)).toEqual({
      known: true,
      count: 3,
      capped: false,
      byOption: [{ value: 'o1', count: 2 }],
    });
  });

  it('marks a count at the cap as capped', async () => {
    const { typed } = fakeCollection({ count: 1000 });

    expect(await measurePropertyValueCounts(typed, counts)).toMatchObject({
      count: 1000,
      capped: true,
    });
  });

  it('keeps the total when the per-option tally gives up', async () => {
    const { typed } = fakeCollection({ count: 3, options: timeout });

    expect(await measurePropertyValueCounts(typed, counts)).toEqual({
      known: true,
      count: 3,
      capped: false,
      byOption: null,
    });
  });

  it('keeps the per-option tally when the total gives up', async () => {
    const { typed } = fakeCollection({
      count: timeout,
      options: [{ _id: 'o2', count: 1 }],
    });

    expect(await measurePropertyValueCounts(typed, counts)).toEqual({
      known: false,
      count: 0,
      capped: false,
      byOption: [{ value: 'o2', count: 1 }],
    });
  });

  it('skips the tally for a field without options or for one option', async () => {
    const { collection, typed } = fakeCollection({ count: 1 });

    await measurePropertyValueCounts(typed, input({ part: 'counts' }));
    await measurePropertyValueCounts(typed, { ...counts, value: 'o1' });

    expect(collection.aggregate).not.toHaveBeenCalled();
  });
});

describe('measurePropertyValueUsage', () => {
  it('answers only the part it was asked for', async () => {
    const { collection, typed } = fakeCollection({ count: 2 });

    await measurePropertyValueUsage(typed, input({ part: 'counts' }), label);

    expect(collection.find).not.toHaveBeenCalled();
    expect(collection.countDocuments).toHaveBeenCalled();
  });
});
