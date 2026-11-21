/**
 * `product_categories`, `uoms` and `products` → `core_product_categories` and `core_products`.
 * Old deleted products (most of them) become archived, so old deals still find them. Prices move
 * to the smallest unit (×100). A unit of measure is kept by name. Codes and barcodes the
 * organisation already uses get a suffix or stay out. Images become files.
 */
import { resolve } from './idMap';
import { attachments, type Attachment, fileIdOf, saveFiles } from './files';
import { idSet, insert, MINE, readAll, type Run, unit } from './run';
import { brandTagId } from './tags';
import {
  amount,
  createdOf,
  idOf,
  ids,
  minor,
  optionalId,
  readOr,
  record,
  text,
  texts,
  when,
} from './values';

const Category = record({ name: text, parentId: optionalId, createdAt: when, updatedAt: when });

export const ProductDocument = record({
  name: text,
  code: text,
  type: text,
  status: text,
  categoryId: optionalId,
  description: text,
  unitPrice: amount,
  uom: text,
  uomId: optionalId,
  currency: text,
  barcodes: texts,
  attachment: attachments,
  attachmentMore: attachments,
  tagIds: ids,
  scopeBrandIds: ids,
  createdAt: when,
  updatedAt: when,
});

/** Old product types → kinds; a subscription is a service that repeats. */
const KINDS: Record<string, 'goods' | 'service'> = {
  product: 'goods',
  service: 'service',
  subscription: 'service',
};

const importCategories = async (run: Run) => {
  const docs = (await readAll(run, 'product_categories')).flatMap((raw) => {
    const doc = readOr(Category, raw);

    return doc ? [doc] : [];
  });

  const byId = new Map(docs.map((doc) => [doc.id, doc]));

  const depth = (id: string, seen = new Set<string>()): number => {
    const parent = byId.get(id)?.parentId;

    return parent && byId.has(parent) && !seen.has(parent)
      ? 1 + depth(parent, new Set([...seen, id]))
      : 0;
  };

  run.report.of('product_categories', 'core_product_categories');
  run.report.seen('product_categories', docs.length);

  const ordered = docs.toSorted((a, b) => depth(a.id) - depth(b.id));

  await unit(run, () =>
    insert(run, {
      collection: 'product_categories',
      table: 'core_product_categories',
      columns: ['id', 'name', 'parent_id', 'created_at', 'updated_at'],
      rows: ordered.map((doc) => [
        doc.id,
        doc.name ?? doc.id,
        doc.parentId && byId.has(doc.parentId) ? doc.parentId : null,
        createdOf(doc.id, doc.createdAt, doc.updatedAt),
        doc.updatedAt ?? createdOf(doc.id, doc.createdAt),
      ]),
      keys: ordered.map((doc) => doc.id),
    }),
  );
};

type Product = NonNullable<ReturnType<typeof ProductDocument.parse>>;

interface Taken {
  codes: Map<string, string>;
  barcodes: Map<string, string>;
}

/** A code no other product has (case-insensitive). */
const uniqueCode = (taken: Taken, product: Product) => {
  if (!product.code) return null;

  const options = [
    product.code,
    `${product.code}-${product.id.slice(-5)}`,
    `${product.code}-${product.id}`,
  ];

  const code =
    options.find((option) => {
      const owner = taken.codes.get(option.toLowerCase());

      return !owner || owner === product.id;
    }) ?? `${product.code}-${product.id}`;

  taken.codes.set(code.toLowerCase(), product.id);

  return code;
};

const COLUMNS = [
  'id',
  'kind',
  'status',
  'name',
  'code',
  'barcode',
  'category_id',
  'description',
  'unit',
  'price',
  'currency',
  'image_ids',
  'created_at',
  'updated_at',
  'archived_at',
];

export const productRow = (
  product: Product,
  context: { currency: string; units: Map<string, string>; categories: Set<string> },
  code: string | null,
  barcode: string | null,
  imageIds: string[],
) => {
  const createdAt = createdOf(product.id, product.createdAt, product.updatedAt);
  const archived = product.status !== 'active';

  return [
    product.id,
    KINDS[product.type ?? 'product'],
    archived ? 'archived' : 'active',
    product.name ?? product.code ?? product.id,
    code,
    barcode,
    product.categoryId && context.categories.has(product.categoryId) ? product.categoryId : null,
    product.description,
    (product.uomId && context.units.get(product.uomId)) ?? product.uom ?? 'pcs',
    Math.max(0, minor(product.unitPrice) ?? 0),
    product.currency ?? context.currency,
    imageIds,
    createdAt,
    product.updatedAt ?? createdAt,
    archived ? (product.updatedAt ?? createdAt) : null,
  ];
};

const writeProducts = async (run: Run, products: Product[], taken: Taken) => {
  const { rows } = await run.pg.query<{ currency: string }>(
    "SELECT currency FROM core_organizations WHERE id = current_setting('app.org_id')",
  );

  const units = new Map(
    (await readAll(run, 'uoms')).flatMap((raw) => {
      const uom = readOr(record({ name: text, code: text }), raw);

      return uom ? [[uom.id, uom.name ?? uom.code ?? uom.id]] : [];
    }),
  );

  const context = {
    currency: rows[0]?.currency ?? 'MNT',
    units,
    categories: await idSet(run, 'core_product_categories'),
  };

  run.report.of('uoms', 'core_products.unit');
  run.report.seen('uoms', units.size);
  run.report.copied('uoms', units.size);

  const images = products.flatMap((product) =>
    [...product.attachment, ...product.attachmentMore].map((attachment: Attachment) => ({
      attachment,
      actorId: null,
      at: createdOf(product.id, product.createdAt, product.updatedAt),
    })),
  );

  await saveFiles(run, 'products (files)', images);

  const built = products.map((product) => {
    const code = uniqueCode(taken, product);
    const [first, ...rest] = product.barcodes;
    const barcodeOwner = first ? taken.barcodes.get(first) : undefined;
    const barcode = first && (!barcodeOwner || barcodeOwner === product.id) ? first : null;

    if (barcode) taken.barcodes.set(barcode, product.id);

    if (code !== product.code) run.report.note('products', 'code taken; made unique', product.id);

    if (first && !barcode) {
      run.report.note('products', 'barcode taken by another product; left out', product.id);
    }

    if (rest.length)
      run.report.note('products', 'more than one barcode; the first kept', product.id);

    const imageIds = [...product.attachment, ...product.attachmentMore].flatMap((image) =>
      image.url ? [fileIdOf(image.url)] : [],
    );

    return productRow(product, context, code, barcode, imageIds);
  });

  await insert(run, {
    collection: 'products',
    table: 'core_products',
    columns: COLUMNS,
    rows: built,
    keys: products.map((product) => product.id),
  });
};

/** Categories, then products and their tags. */
export const importProducts = async (run: Run) => {
  await importCategories(run);

  const docs = await readAll(run, 'products');

  const products = docs.flatMap((raw) => {
    const product = readOr(ProductDocument, raw);

    if (!product) run.report.skip('products', 'unreadable _id', idOf(raw));
    else if (!KINDS[product.type ?? 'product']) {
      run.report.skip('products', `unknown type ${product.type ?? ''}`, product.id);

      return [];
    }

    return product ? [product] : [];
  });

  run.report.of('products', 'core_products');
  run.report.seen('products', docs.length);

  const { rows } = await run.pg.query<{ id: string; code: string | null; barcode: string | null }>(
    `SELECT id, lower(code) AS code, barcode FROM core_products WHERE ${MINE}`,
  );

  const taken: Taken = {
    codes: new Map(rows.flatMap((row) => (row.code ? [[row.code, row.id]] : []))),
    barcodes: new Map(rows.flatMap((row) => (row.barcode ? [[row.barcode, row.id]] : []))),
  };

  await unit(run, async () => {
    await writeProducts(run, products, taken);
    await productTags(run, products);
  });
};

const productTags = async (run: Run, products: Product[]) => {
  const { rows } = await run.pg.query<{ id: string }>(
    `SELECT id FROM core_tags WHERE type = 'product' AND ${MINE}`,
  );

  const tags = new Set(rows.map((row) => row.id));
  const pairs = new Map<string, [string, string]>();

  for (const product of products) {
    const wanted = [
      ...product.tagIds.map((id) => resolve('tag', id)),
      ...product.scopeBrandIds.map((id) => brandTagId(id, 'product')),
    ];

    for (const tagId of wanted) {
      if (tags.has(tagId)) pairs.set(`${product.id}:${tagId}`, [product.id, tagId]);
      else run.report.skip('products (tags)', 'tag missing', `${product.id}:${tagId}`);
    }
  }

  run.report.of('products (tags)', 'core_product_tags');
  run.report.seen('products (tags)', pairs.size);

  await insert(run, {
    collection: 'products (tags)',
    table: 'core_product_tags',
    columns: ['product_id', 'tag_id'],
    rows: [...pairs.values()],
    keys: [...pairs.keys()],
  });
};
