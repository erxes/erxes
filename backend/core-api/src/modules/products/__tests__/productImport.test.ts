/**
 * Product import against real MongoDB: an imported row goes through the same
 * rules as createProduct, and its relations resolve from codes and names.
 */
import { DATABASE } from './productImportTestEnv';
import mongoose from 'mongoose';
import { IProduct } from 'erxes-api-shared/core-types';
import { generateModels, IModels } from '~/connectionResolvers';
import { processProductRows } from '@/products/meta/import-export/import/processProductRows';

jest.mock('@/products/meta/automations', () => ({
  ...jest.requireActual('@/products/meta/automations'),
  refreshProductKnowledge: jest.fn().mockResolvedValue(undefined),
}));

jest.setTimeout(30_000);

let models: IModels;

const pickCompared = (doc?: Partial<IProduct> | null) => ({
  name: doc?.name,
  categoryId: doc?.categoryId,
  uom: doc?.uom,
  unitPrice: doc?.unitPrice,
  type: doc?.type,
  vendorId: doc?.vendorId,
});

beforeAll(async () => {
  models = await generateModels('test');
  await mongoose.connection.asPromise();
  // The unique code index must exist before the duplicate-code cases run
  await models.Products.init();
}, 60_000);

beforeEach(async () => {
  await models.ProductCategories.collection.insertMany([
    { _id: 'cat_drinks' as never, code: 'C01', name: 'Drinks' },
    { _id: 'cat_other_1' as never, code: 'C02', name: 'Other' },
    { _id: 'cat_other_2' as never, code: 'C03', name: 'Other' },
  ]);
  await models.Uoms.collection.insertOne({
    _id: 'uom_pcs' as never,
    code: 'pcs',
    name: 'ширхэг',
  });
  await models.Companies.collection.insertOne({
    _id: 'vendor_1' as never,
    code: 'V01',
    primaryName: 'Water LLC',
  });
});

afterEach(async () => {
  await Promise.all([
    models.Products.collection.deleteMany({}),
    models.ProductCategories.collection.deleteMany({}),
    models.Uoms.collection.deleteMany({}),
    models.Companies.collection.deleteMany({}),
    models.Tags.collection.deleteMany({}),
    models.ProductsConfigs.collection.deleteMany({}),
  ]);
});

afterAll(async () => {
  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();
  const cleanup = await mongoose
    .createConnection('mongodb://127.0.0.1:27017/admin?directConnection=true')
    .asPromise();
  await cleanup.useDb(DATABASE).dropDatabase();
  await cleanup.close();
});

describe('upsertProductsByCode', () => {
  it('stores the same product as createProduct', async () => {
    const input = {
      name: 'Water',
      categoryCode: 'C01',
      uom: 'ширхэг',
      unitPrice: 1000,
      vendorCode: 'V01',
    };

    const created = await models.Products.createProduct({
      ...input,
      code: 'A_1',
      variants: {},
    });
    const [result] = await models.Products.upsertProductsByCode([
      { ...input, code: 'B_1' },
    ]);
    const imported = await models.Products.findById(result._id).lean();

    expect(result.error).toBeUndefined();
    expect(imported?.code).toBe('B1');
    expect(pickCompared(imported)).toEqual(pickCompared(created.toObject()));
    expect(pickCompared(imported)).toMatchObject({
      categoryId: 'cat_drinks',
      uom: 'pcs',
      vendorId: 'vendor_1',
    });
  });

  it('creates a missing uom and resolves a category by name', async () => {
    const [result] = await models.Products.upsertProductsByCode([
      { code: 'K1', name: 'Rice', categoryId: 'Drinks', uom: 'кг' },
    ]);
    const product = await models.Products.findById(result._id).lean();

    expect(product?.categoryId).toBe('cat_drinks');
    expect(product?.uom).toBe('кг');
    expect(await models.Uoms.countDocuments({ code: 'кг' })).toBe(1);
  });

  it('refuses unresolved relations per row and saves the rest', async () => {
    const results = await models.Products.upsertProductsByCode([
      { code: 'X1', name: 'No category', categoryId: 'missing', uom: 'pcs' },
      { code: 'X2', name: 'Shared name', categoryId: 'Other', uom: 'pcs' },
      {
        code: 'X3',
        name: 'No vendor',
        categoryId: 'C01',
        uom: 'pcs',
        vendorCode: 'V99',
      },
      { code: 'X4', name: 'Fine', categoryId: 'C01', uom: 'pcs' },
    ]);

    expect(results[0].error).toMatch(/category not found: missing/);
    expect(results[1].error).toMatch(/category not found: Other/);
    expect(results[2].error).toMatch(/Vendor not found: V99/);
    expect(results[3]._id).toBeDefined();
    expect(await models.Products.countDocuments({})).toBe(1);
  });

  it('updates only what the row carries, matching a legacy raw code', async () => {
    await models.Products.collection.insertOne({
      _id: 'legacy_1' as never,
      code: 'L_1',
      name: 'Legacy',
      categoryId: 'cat_drinks',
      uom: 'pcs',
      unitPrice: 500,
      status: 'active',
    });

    const [result] = await models.Products.upsertProductsByCode([
      { code: 'L_1', unitPrice: 700 },
    ]);
    const product = await models.Products.findById('legacy_1').lean();

    expect(result._id).toBe('legacy_1');
    expect(product).toMatchObject({
      code: 'L_1',
      name: 'Legacy',
      categoryId: 'cat_drinks',
      uom: 'pcs',
      unitPrice: 700,
    });
    expect(await models.Products.countDocuments({})).toBe(1);
  });

  it('neither revives nor shadows a deleted product holding the code', async () => {
    await models.Products.collection.insertOne({
      _id: 'deleted_1' as never,
      code: 'D1',
      name: 'Gone',
      categoryId: 'cat_drinks',
      uom: 'pcs',
      status: 'deleted',
    });

    const [result] = await models.Products.upsertProductsByCode([
      { code: 'D1', name: 'Back', categoryId: 'C01', uom: 'pcs' },
    ]);
    const product = await models.Products.findById('deleted_1').lean();

    expect(result.error).toBe('Code D1 belongs to a deleted product');
    expect(product).toMatchObject({ name: 'Gone', status: 'deleted' });
  });

  it('refuses a code repeated in the batch and a schema-invalid row', async () => {
    const results = await models.Products.upsertProductsByCode([
      { code: 'R1', name: 'First', categoryId: 'C01', uom: 'pcs' },
      { code: 'R_1', name: 'Second', categoryId: 'C01', uom: 'pcs' },
      {
        code: 'S1',
        name: 'Bad status',
        categoryId: 'C01',
        uom: 'pcs',
        status: 'Active',
      },
      { code: 'S2', name: 'Fine', categoryId: 'C01', uom: 'pcs' },
    ]);

    expect(results[0]._id).toBeDefined();
    expect(results[1].error).toBe('Code R1 repeats an earlier row');
    expect(results[2].error).toMatch(/status/);
    expect(results[3]._id).toBeDefined();
    expect(await models.Products.countDocuments({})).toBe(2);
  });

  it('fails only the row a concurrent write took the code from', async () => {
    await models.Products.collection.insertOne({
      _id: 'raced_1' as never,
      code: 'T1',
      name: 'Saved meanwhile',
      categoryId: 'cat_drinks',
      uom: 'pcs',
    });
    // The lookup misses it, as if it was saved after the import read
    jest
      .spyOn(models.Products, 'find')
      .mockReturnValueOnce({ lean: async () => [] } as never);

    const results = await models.Products.upsertProductsByCode([
      { code: 'T1', name: 'Raced', categoryId: 'C01', uom: 'pcs' },
      { code: 'T2', name: 'Fine', categoryId: 'C01', uom: 'pcs' },
    ]);

    expect(results[0].error).toMatch(/duplicate key/);
    expect(results[1]._id).toBeDefined();
    expect(await models.Products.findById(results[1]._id).lean()).toMatchObject(
      { code: 'T2' },
    );
  });

  it('falls back to the configured default uom', async () => {
    await models.ProductsConfigs.collection.insertOne({
      code: 'defaultUOM',
      value: 'ширхэг',
    });

    const [result] = await models.Products.upsertProductsByCode([
      { code: 'U1', name: 'No uom', categoryId: 'C01' },
    ]);
    const product = await models.Products.findById(result._id).lean();

    expect(product?.uom).toBe('pcs');
  });
});

describe('processProductRows', () => {
  it('parses cells, resolves tags once and reports bad rows', async () => {
    const { successRows, errorRows } = await processProductRows(models, [
      {
        code: 'P1',
        name: 'Tea',
        categoryId: 'C01',
        uom: 'pcs',
        tags: 'Hot, New',
        unitPrice: '1200',
      },
      {
        code: 'P2',
        name: 'Coffee',
        categoryId: 'C01',
        uom: 'pcs',
        tags: 'Hot',
      },
      {
        code: 'P3',
        name: 'Bad price',
        categoryId: 'C01',
        uom: 'pcs',
        unitPrice: 'abc',
      },
      {
        code: 'P4',
        name: 'Unique',
        categoryId: 'C01',
        uom: 'pcs',
        type: 'unique',
      },
    ]);

    expect(successRows.map((row) => row.code)).toEqual(['P1', 'P2']);
    expect(errorRows.map((row) => [row.code, row.error])).toEqual([
      ['P3', 'unitPrice must be a number'],
      ['P4', 'Duration must be greater than 0 for unique products'],
    ]);

    const tea = await models.Products.findOne({ code: 'P1' }).lean();
    const coffee = await models.Products.findOne({ code: 'P2' }).lean();

    expect(tea?.unitPrice).toBe(1200);
    expect(tea?.tagIds).toHaveLength(2);
    expect(coffee?.tagIds).toEqual([tea?.tagIds?.[0]]);
    expect(await models.Tags.countDocuments({})).toBe(2);
  });
});
