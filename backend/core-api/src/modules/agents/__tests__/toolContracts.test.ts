import {
  applyAgentToolContract,
  getAgentToolContract,
  validateAgentToolInput,
} from '@/agents/toolContracts';

const createId = 'core.trpc.products.createProduct';

const validDoc = {
  name: 'Green tea',
  code: 'TEA-1',
  categoryId: 'cat-1',
  uom: 'pc',
};

it('exposes a nested JSON schema without a $schema marker', () => {
  const reviewed = getAgentToolContract(createId);
  expect(reviewed?.inputSchema.$schema).toBeUndefined();
  expect(reviewed?.inputSchema).toMatchObject({
    type: 'object',
    required: ['doc'],
    additionalProperties: false,
  });
  const doc = (reviewed?.inputSchema.properties as { doc?: Record<string, unknown> })
    ?.doc;
  expect(doc).toMatchObject({ type: 'object', required: expect.arrayContaining(['name', 'code', 'uom']) });
});

it('accepts a source-shaped create payload and rejects aliases or missing category', () => {
  expect(validateAgentToolInput(createId, { doc: validDoc })).toEqual({
    doc: validDoc,
  });
  expect(() =>
    validateAgentToolInput(createId, {
      doc: { ...validDoc, sku: 'TEA-1' },
    }),
  ).toThrow(/Invalid tool input/);
  expect(() =>
    validateAgentToolInput(createId, {
      name: validDoc.name,
      code: validDoc.code,
      uom: validDoc.uom,
      categoryId: validDoc.categoryId,
    }),
  ).toThrow(/doc/);
  expect(() =>
    validateAgentToolInput(createId, {
      doc: { name: 'Tea', code: 'T', uom: 'pc' },
    }),
  ).toThrow(/categoryId/);
});

it('requires duration fields only for unique products', () => {
  expect(() =>
    validateAgentToolInput(createId, {
      doc: { ...validDoc, type: 'unique' },
    }),
  ).toThrow(/duration/);
  expect(
    validateAgentToolInput(createId, {
      doc: {
        ...validDoc,
        type: 'unique',
        duration: 30,
        durationType: 'minute',
      },
    }),
  ).toMatchObject({ doc: { type: 'unique', duration: 30 } });
});

it('leaves unreviewed tools unchanged', () => {
  const input = { query: { stage: 'open' } };
  expect(validateAgentToolInput('sales.trpc.deal.count', input)).toBe(input);
  expect(validateAgentToolInput('sales.trpc.deal.count', undefined)).toBeUndefined();
  expect(getAgentToolContract('sales.trpc.deal.count')).toBeUndefined();
});

it('corrects the product-rules finder and overlays discovery text', () => {
  expect(() =>
    validateAgentToolInput('core.trpc.products.rules.find', {
      query: { categoryId: 'x' },
    }),
  ).toThrow(/_ids/);
  const overlaid = applyAgentToolContract({
    id: 'core.trpc.products.rules.find',
    description: 'Search products with a MongoDB-style filter',
  });
  expect(overlaid.description).toMatch(/PRODUCT RULES/);
  expect(overlaid.inputSchema).toBeDefined();
});
