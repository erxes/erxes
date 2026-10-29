import { IDataExtensionField, IDataExtensionFieldSettings } from './types';
import {
  buildDataExtensionPatch,
  normalizeDataExtensionValue,
  validateDataExtensionFieldCreate,
  validateDataExtensionFieldEdit,
  validateDataExtensionFieldSettings,
} from './validation';

const field = (
  key: string,
  type: IDataExtensionField['type'],
  settings?: IDataExtensionFieldSettings,
  options?: IDataExtensionField['options'],
): IDataExtensionField => ({
  recordType: 'core:company',
  key,
  label: key,
  type,
  options,
  settings,
  order: 0,
  status: 'active',
});

describe('new field types', () => {
  it('normalises currency, defaulting the code from settings', () => {
    expect(
      normalizeDataExtensionValue(field('price', 'currency'), {
        amount: 1200.5,
        currency: 'usd',
      }),
    ).toEqual({ amount: 1200.5, currency: 'USD' });

    expect(
      normalizeDataExtensionValue(
        field('price', 'currency', { currency: 'MNT' }),
        { amount: 5 },
      ),
    ).toEqual({ amount: 5, currency: 'MNT' });

    expect(() =>
      normalizeDataExtensionValue(field('price', 'currency'), { amount: 5 }),
    ).toThrow('3-letter currency code');
    expect(() =>
      normalizeDataExtensionValue(
        field('price', 'currency', { currency: 'MNT', min: 0 }),
        { amount: -1 },
      ),
    ).toThrow('at least 0');
  });

  it('keeps ratings within the scale', () => {
    const stars = field('stars', 'rating', { scale: 3 });

    expect(normalizeDataExtensionValue(stars, 3)).toBe(3);
    expect(() => normalizeDataExtensionValue(stars, 4)).toThrow('1 to 3');
    expect(() => normalizeDataExtensionValue(stars, 2.5)).toThrow('1 to 3');
    expect(() =>
      normalizeDataExtensionValue(field('stars', 'rating'), 6),
    ).toThrow('1 to 5');
  });

  it('trims address and name parts and refuses unknown or empty ones', () => {
    expect(
      normalizeDataExtensionValue(field('office', 'address'), {
        city: ' Ulaanbaatar ',
        street: '',
        country: 'MN',
      }),
    ).toEqual({ city: 'Ulaanbaatar', country: 'MN' });

    expect(() =>
      normalizeDataExtensionValue(field('office', 'address'), { planet: 'x' }),
    ).toThrow('no part "planet"');
    expect(() =>
      normalizeDataExtensionValue(field('office', 'address'), { city: ' ' }),
    ).toThrow('at least one part');
    expect(
      normalizeDataExtensionValue(field('contact', 'fullName'), {
        firstName: 'Bat',
      }),
    ).toEqual({ firstName: 'Bat' });
  });

  it('de-duplicates links, emails and phones and caps their length', () => {
    expect(
      normalizeDataExtensionValue(field('sites', 'links'), [
        { url: 'https://erxes.io', label: 'Site' },
        { url: 'https://erxes.io' },
      ]),
    ).toEqual([{ url: 'https://erxes.io', label: 'Site' }]);

    expect(
      normalizeDataExtensionValue(field('mails', 'emails'), [
        'a@erxes.io',
        'A@erxes.io',
      ]),
    ).toEqual(['a@erxes.io']);

    expect(
      normalizeDataExtensionValue(field('tels', 'phones'), [
        '+976 9911 2233',
        '+97699112233',
      ]),
    ).toEqual(['+976 9911 2233']);

    expect(() =>
      normalizeDataExtensionValue(field('sites', 'links'), [
        { url: 'javascript:alert(1)' },
      ]),
    ).toThrow('http(s) URL');
    expect(() =>
      normalizeDataExtensionValue(
        field('mails', 'emails'),
        Array.from({ length: 21 }, (_, index) => `u${index}@erxes.io`),
      ),
    ).toThrow('at most 20 items');
  });

  it('accepts file URLs and storage keys, never paths or other schemes', () => {
    expect(
      normalizeDataExtensionValue(field('docs', 'files'), [
        { url: '1700000000-contract.pdf', name: 'contract.pdf', size: 2048 },
        { url: 'https://cdn.erxes.io/a.png', name: 'a.png', type: 'image/png' },
      ]),
    ).toEqual([
      { url: '1700000000-contract.pdf', name: 'contract.pdf', size: 2048 },
      { url: 'https://cdn.erxes.io/a.png', name: 'a.png', type: 'image/png' },
    ]);

    for (const url of ['../etc/passwd', '/root/a', 'javascript:alert(1)']) {
      expect(() =>
        normalizeDataExtensionValue(field('docs', 'files'), [
          { url, name: 'x' },
        ]),
      ).toThrow();
    }
  });

  it('stores one member id or a de-duplicated list when multiple', () => {
    expect(normalizeDataExtensionValue(field('owner', 'member'), 'u1')).toBe(
      'u1',
    );
    expect(
      normalizeDataExtensionValue(field('team', 'member', { multiple: true }), [
        'u1',
        'u1',
        'u2',
      ]),
    ).toEqual(['u1', 'u2']);
    expect(() =>
      normalizeDataExtensionValue(field('owner', 'member'), ['u1']),
    ).toThrow('record id');
  });

  it('only stores bounded JSON without Mongo operators', () => {
    expect(
      normalizeDataExtensionValue(field('meta', 'json'), { a: [1, { b: true }] }),
    ).toEqual({ a: [1, { b: true }] });

    expect(() =>
      normalizeDataExtensionValue(field('meta', 'json'), { $where: 'x' }),
    ).toThrow('start with $');
    expect(() =>
      normalizeDataExtensionValue(field('meta', 'json'), { 'a.b': 1 }),
    ).toThrow('contain dots');
    expect(() =>
      normalizeDataExtensionValue(field('meta', 'json'), 'text'),
    ).toThrow('object or list');
    expect(() =>
      normalizeDataExtensionValue(field('meta', 'json'), {
        a: 'x'.repeat(10001),
      }),
    ).toThrow('larger than');

    let deep: Record<string, unknown> = {};
    const root = deep;

    for (let level = 0; level < 8; level++) {
      deep.next = {};
      deep = deep.next as Record<string, unknown>;
    }

    expect(() =>
      normalizeDataExtensionValue(field('meta', 'json'), root),
    ).toThrow('nested too deeply');
  });

  it('applies dateTime, percent and text settings', () => {
    expect(
      normalizeDataExtensionValue(
        field('at', 'dateTime'),
        '2027-06-01T08:30:00.000Z',
      ),
    ).toEqual(new Date('2027-06-01T08:30:00.000Z'));
    expect(() =>
      normalizeDataExtensionValue(field('share', 'percent', { max: 100 }), 120),
    ).toThrow('at most 100');
    expect(() =>
      normalizeDataExtensionValue(field('code', 'text', { maxLength: 4 }), 'ABCDE'),
    ).toThrow('at most 4');
  });
});

describe('field settings', () => {
  it('accepts settings that fit the type and drops unset ones', () => {
    expect(
      validateDataExtensionFieldSettings('number', {
        required: true,
        min: 0,
        max: 10,
        precision: 2,
        group: ' Finance ',
        placeholder: undefined,
      }, undefined),
    ).toEqual({ required: true, min: 0, max: 10, precision: 2, group: 'Finance' });
  });

  it.each([
    ['text', { min: 1 }, 'minimum or maximum'],
    ['number', { maxLength: 5 }, 'maximum length'],
    ['number', { min: 5, max: 1 }, 'not be above'],
    ['longText', { unique: true }, 'can be unique'],
    ['text', { scale: 5 }, 'Only rating'],
    ['currency', { currency: 'mnt' }, 'ISO 4217'],
    ['text', { multiple: true }, 'Only member'],
    ['text', { colour: 'red' }, 'Unknown setting'],
    ['files', { defaultValue: [] }, 'no default value'],
    ['rating', { scale: 11 }, '3 to 10'],
  ] as const)('rejects %s with %j', (type, settings, message) => {
    expect(() =>
      validateDataExtensionFieldSettings(type, settings, undefined),
    ).toThrow(message);
  });

  it('validates the default like a stored value', () => {
    const options = [{ value: 'gold', label: 'Gold' }];

    expect(
      validateDataExtensionFieldSettings('select', { defaultValue: 'gold' }, options),
    ).toEqual({ defaultValue: 'gold' });
    expect(() =>
      validateDataExtensionFieldSettings('select', { defaultValue: 'silver' }, options),
    ).toThrow('one of its options');
    expect(() =>
      validateDataExtensionFieldSettings('number', { defaultValue: 50, max: 10 }, undefined),
    ).toThrow('at most 10');
  });

  it('carries settings and option colours through create', () => {
    const created = validateDataExtensionFieldCreate({
      recordType: 'core:company',
      key: 'tier',
      label: 'Tier',
      type: 'select',
      options: [{ value: 'gold', label: 'Gold', color: 'yellow' }],
      settings: { required: true, defaultValue: 'gold' },
    });

    expect(created.options).toEqual([
      { value: 'gold', label: 'Gold', color: 'yellow' },
    ]);
    expect(created.settings).toEqual({ required: true, defaultValue: 'gold' });

    expect(() =>
      validateDataExtensionFieldCreate({
        recordType: 'core:company',
        key: 'tier',
        label: 'Tier',
        type: 'select',
        options: [{ value: 'gold', label: 'Gold', color: 'neon' as never }],
      }),
    ).toThrow('Unknown option colour');
  });

  it('keeps unique and multiple fixed after creation', () => {
    expect(() =>
      validateDataExtensionFieldEdit(
        { type: 'text', settings: {} },
        { settings: { unique: true } },
      ),
    ).toThrow('only be made unique when it is created');

    expect(
      validateDataExtensionFieldEdit(
        { type: 'text', settings: { unique: true } },
        { settings: { required: true } },
      ).settings,
    ).toEqual({ required: true, unique: true });

    expect(
      validateDataExtensionFieldEdit(
        { type: 'text', settings: { unique: true } },
        { settings: { unique: false } },
      ).settings,
    ).toEqual({ unique: false });

    expect(() =>
      validateDataExtensionFieldEdit(
        { type: 'member', settings: { multiple: true } },
        { settings: { multiple: false } },
      ),
    ).toThrow('fixed once the field is created');
  });
});

describe('required values', () => {
  const fields = [
    field('reference', 'text', { required: true }),
    field('tags', 'emails', { required: true }),
    field('note', 'text'),
  ];

  it('refuses clearing or emptying a required value', () => {
    expect(() => buildDataExtensionPatch(fields, { reference: null })).toThrow(
      'reference is required',
    );
    expect(() => buildDataExtensionPatch(fields, { reference: '  ' })).toThrow(
      'is required',
    );
    expect(() => buildDataExtensionPatch(fields, { tags: [] })).toThrow(
      'is required',
    );
  });

  it('still lets other keys be cleared', () => {
    expect(buildDataExtensionPatch(fields, { note: null }).$unset).toEqual({
      'dataExtensions.note': '',
    });
  });
});
