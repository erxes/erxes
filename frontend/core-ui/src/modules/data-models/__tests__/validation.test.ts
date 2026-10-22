import {
  dataModelFieldFormSchema,
  dataModelFieldOptions,
  modelApiName,
  relationApiName,
} from '../validation';

it.each([
  ['Office locations', 'officeLocations'],
  ['Café / branches', 'cafeBranches'],
  ['2026 locations', 'relation2026Locations'],
  ['!@#', 'relation'],
  ['', 'relation'],
])('generates a valid API field identity from %s', (label, expected) => {
  expect(relationApiName(label)).toBe(expected);
});

it('keeps generated API identities within the backend name limit', () => {
  expect(relationApiName('a'.repeat(100))).toHaveLength(63);
});

it.each([
  'Office locations',
  'Café / branches',
  '2026 vehicle',
  'Тээврийн хэрэгсэл',
])(
  'generates a valid object API name from %s without technical input',
  (label) => {
    expect(modelApiName(label)).toMatch(/^[a-z][a-z0-9_]{0,62}$/);
  },
);

it('generates option values while retaining the stored identity of renamed options', () => {
  const options = dataModelFieldOptions([
    { value: 'inStock', label: 'Available' },
    { value: '', label: 'In stock' },
    { value: '', label: 'In-stock' },
    { value: '', label: 'true' },
    { value: '', label: 'Бэлэн' },
  ]);
  expect(options).toEqual([
    { value: 'inStock', label: 'Available' },
    { value: 'inStock2', label: 'In stock' },
    { value: 'inStock3', label: 'In-stock' },
    { value: 'true2', label: 'true' },
    { value: 'option', label: 'Бэлэн' },
  ]);
});

it('keeps generated enum values unique when long option names are truncated', () => {
  const options = dataModelFieldOptions([
    { value: '', label: 'a'.repeat(100) },
    { value: '', label: 'a'.repeat(99) + 'b' },
  ]);
  expect(new Set(options.map((option) => option.value)).size).toBe(2);
  for (const option of options)
    expect(option.value).toMatch(/^[A-Za-z][A-Za-z0-9_]{0,62}$/);
});

const choice = {
  name: 'status',
  label: 'Status',
  description: '',
  type: 'select',
  required: false,
  options: [],
  targetModelIds: [],
  multiple: false,
  inverseName: '',
  inverseLabel: '',
};

it('validates option names without requiring users to enter stored values', () => {
  const schema = dataModelFieldFormSchema(false, 'model');
  expect(schema.safeParse(choice).success).toBe(false);
  expect(
    schema.safeParse({ ...choice, options: [{ label: 'Ready', value: '' }] })
      .success,
  ).toBe(true);
  expect(
    schema.safeParse({ ...choice, options: [{ label: '  ', value: '' }] })
      .success,
  ).toBe(false);
  expect(
    schema.safeParse({
      ...choice,
      options: [
        { label: 'Ready', value: '' },
        { label: ' ready ', value: '' },
      ],
    }).success,
  ).toBe(false);
});
