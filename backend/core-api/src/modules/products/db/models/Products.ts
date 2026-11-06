import {
  IProduct,
  IProductCategory,
  IProductDocument,
  IPropertyField,
} from 'erxes-api-shared/core-types';
import { Model, mongo, UpdateQuery } from 'mongoose';
import { nanoid } from 'nanoid';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

import {
  PRODUCT_DURATION_TYPES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
} from '@/products/constants';
import { productSchema } from '@/products/db/definitions/products';
import { refreshProductKnowledge } from '@/products/meta/automations';
import {
  checkCodeMask,
  checkSameMaskConfig,
  initCustomField,
} from '@/products/utils';
import { IModels } from '~/connectionResolvers';
import { generateProductUpdateActivityLogs } from '../../meta/activity-log';

export interface IProductUpsertResult {
  _id?: string;
  error?: string;
}

type ProductWriteDoc = Partial<IProduct> & { _id?: string; createdAt?: Date };

type ProductRefs = {
  uomCodes: Map<string, string>;
  defaultUom: string;
  categories: Map<string, IProductCategory & { _id: string }>;
  vendors: Map<string, { _id: string }>;
};

// A vendor reference may be any of these company fields
const VENDOR_REF_FIELDS = [
  '_id',
  'code',
  'primaryEmail',
  'primaryPhone',
  'primaryName',
] as const;

const uniqueRefs = (values: Array<string | undefined>) => [
  ...new Set(values.filter((value): value is string => !!value)),
];

// Earlier getters win, so an _id never loses to another doc's code or name.
// A ref two docs share at the same level (a repeated name) is left out
// rather than guessed.
const indexByRefs = <T>(docs: T[], refGetters: Array<(doc: T) => unknown>) => {
  const byRef = new Map<string, T>();

  for (const getRef of refGetters) {
    const level = new Map<string, T | null>();

    for (const doc of docs) {
      const value = getRef(doc);
      const ref = value ? String(value) : '';

      if (ref && !byRef.has(ref)) {
        level.set(ref, level.has(ref) ? null : doc);
      }
    }

    for (const [ref, doc] of level) {
      if (doc) {
        byRef.set(ref, doc);
      }
    }
  }

  return byRef;
};

const normalizeNewCode = (code: string) =>
  code.replace(/\*/g, '').replace(/_/g, '').replace(/ /g, '');

export interface IProductModel extends Model<IProductDocument> {
  getProduct(selector: any): Promise<IProductDocument>;
  createProduct(doc: IProduct): Promise<IProductDocument>;
  upsertProductsByCode(
    docs: Partial<IProduct>[],
  ): Promise<IProductUpsertResult[]>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  updateProductFromBulk(
    _id: string,
    doc: IProduct,
  ): Promise<IProductDocument | null>;
  updateProducts(
    query: any,
    doc: Partial<IProduct>,
    modifier?: UpdateQuery<IProductDocument>,
  ): Promise<{ n: number; nModified: number; ok: number }>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeProducts(
    productIds: string[],
    productFields: IProduct,
  ): Promise<IProductDocument>;
  duplicateProduct(_id: string): Promise<IProductDocument>;
}

export const loadProductClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  type ProductArrayReference = {
    model: keyof Pick<IModels, 'ProductRules' | 'ProductSimilarities'>;
    path: string;
  };

  const replaceArrayReferences = async (
    { model, path }: ProductArrayReference,
    oldIds: string[],
    newId: string,
  ) => {
    await models[model].updateMany(
      { [path]: { $in: oldIds } },
      { $addToSet: { [path]: newId } },
    );

    await models[model].updateMany(
      { [path]: { $in: oldIds } },
      { $pull: { [path]: { $in: oldIds } } },
    );
  };

  const updateProductMergeReferences = async (
    oldProductIds: string[],
    newProductId: string,
  ) => {
    await models.Conformities.changeConformity({
      type: 'product',
      newTypeId: newProductId,
      oldTypeIds: oldProductIds,
    });

    await models.Relations.updateMany(
      {
        entities: {
          $elemMatch: {
            contentType: 'core:product',
            contentId: { $in: oldProductIds },
          },
        },
      },
      {
        $set: {
          'entities.$[entity].contentId': newProductId,
        },
      },
      {
        arrayFilters: [
          {
            'entity.contentType': 'core:product',
            'entity.contentId': { $in: oldProductIds },
          },
        ],
      },
    );

    await replaceArrayReferences(
      { model: 'ProductRules', path: 'productIds' },
      oldProductIds,
      newProductId,
    );
    await replaceArrayReferences(
      { model: 'ProductRules', path: 'excludeProductIds' },
      oldProductIds,
      newProductId,
    );
    await replaceArrayReferences(
      { model: 'ProductSimilarities', path: 'productIds' },
      oldProductIds,
      newProductId,
    );

    await models.ProductSimilarities.updateMany(
      { starProductId: { $in: oldProductIds } },
      { $set: { starProductId: newProductId } },
    );

    await models.BundleRule.updateMany(
      { 'rules.productIds': { $in: oldProductIds } },
      { $addToSet: { 'rules.$[rule].productIds': newProductId } },
      { arrayFilters: [{ 'rule.productIds': { $in: oldProductIds } }] },
    );

    await models.BundleRule.updateMany(
      { 'rules.productIds': { $in: oldProductIds } },
      { $pull: { 'rules.$[rule].productIds': { $in: oldProductIds } } },
      { arrayFilters: [{ 'rule.productIds': { $in: oldProductIds } }] },
    );

    await models.Packages.updateMany(
      { 'products.productId': { $in: oldProductIds } },
      { $set: { 'products.$[product].productId': newProductId } },
      { arrayFilters: [{ 'product.productId': { $in: oldProductIds } }] },
    );
  };

  class Product {
    private static normalizeDuration(
      doc: Partial<IProduct>,
      currentProduct?: IProductDocument,
    ) {
      const type = doc.type || currentProduct?.type || PRODUCT_TYPES.PRODUCT;
      const duration = doc.duration ?? currentProduct?.duration;
      const durationType = doc.durationType ?? currentProduct?.durationType;

      if (type !== PRODUCT_TYPES.UNIQUE) {
        delete doc.duration;
        delete doc.durationType;
        return false;
      }

      if (
        typeof duration !== 'number' ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        throw new Error('Duration must be greater than 0 for unique products');
      }

      if (!durationType || !PRODUCT_DURATION_TYPES.ALL.includes(durationType)) {
        throw new Error(
          'A valid duration type is required for unique products',
        );
      }

      if (doc.duration !== undefined) {
        doc.duration = duration;
      }

      if (doc.durationType !== undefined) {
        doc.durationType = durationType;
      }

      return true;
    }

    // A fixed number of queries, however many docs are passed
    private static async loadRefs(
      docs: ProductWriteDoc[],
    ): Promise<ProductRefs> {
      const categoryRefs = uniqueRefs(
        docs.map((doc) => doc.categoryCode || doc.categoryId),
      );
      const vendorRefs = uniqueRefs(docs.map((doc) => doc.vendorCode));

      const [defaultUomConfig, categories, vendors] = await Promise.all([
        models.ProductsConfigs.getConfig('defaultUOM'),
        categoryRefs.length
          ? models.ProductCategories.find({
              $or: [
                { _id: { $in: categoryRefs } },
                { code: { $in: categoryRefs } },
                { name: { $in: categoryRefs } },
              ],
            }).lean()
          : [],
        vendorRefs.length
          ? models.Companies.find(
              {
                $or: VENDOR_REF_FIELDS.map((field) => ({
                  [field]: { $in: vendorRefs },
                })),
              },
              { code: 1, primaryEmail: 1, primaryPhone: 1, primaryName: 1 },
            ).lean()
          : [],
      ]);

      // getConfig resolves to the stored value despite its declared type
      const defaultUom =
        typeof defaultUomConfig === 'string' ? defaultUomConfig : '';

      const uomCodes = await models.Uoms.resolveCodes([
        defaultUom,
        ...docs.flatMap((doc) => [
          doc.uom,
          ...(doc.subUoms || []).map((subUom) => subUom.uom),
        ]),
      ]);

      return {
        uomCodes,
        defaultUom,
        categories: indexByRefs(categories, [
          (category) => category._id,
          (category) => category.code,
          (category) => category.name,
        ]),
        vendors: indexByRefs(
          vendors,
          VENDOR_REF_FIELDS.map((field) => (vendor) => vendor[field]),
        ),
      };
    }

    // Import onboards whole catalogs: a category the file names but nobody has
    // yet is created at the root, under that name
    private static async createMissingCategories(docs: Partial<IProduct>[]) {
      const refs = uniqueRefs(
        docs.map((doc) => doc.categoryCode || doc.categoryId),
      );

      if (!refs.length) {
        return;
      }

      const existing = await models.ProductCategories.find(
        {
          $or: [
            { _id: { $in: refs } },
            { code: { $in: refs } },
            { name: { $in: refs } },
          ],
        },
        { code: 1, name: 1 },
      ).lean();
      const known = new Set(
        existing.flatMap((category) => [
          category._id,
          category.code,
          category.name,
        ]),
      );

      for (const name of refs.filter((ref) => !known.has(ref))) {
        // A failed create (a concurrent import took the code) surfaces later
        // as the rows' "category not found"
        await models.ProductCategories.createProductCategory({
          name,
          code: name,
          order: '',
        }).catch(() => undefined);
      }
    }

    // Every create rule that needs no query: normalizes the doc in place and
    // returns its category
    private static checkProduct(doc: ProductWriteDoc, refs: ProductRefs) {
      this.normalizeDuration(doc);

      if (!doc.code) {
        throw new Error('code is required');
      }

      // An existing product keeps the code it was saved with
      if (!doc._id) {
        doc.code = normalizeNewCode(doc.code);
      }

      Object.assign(doc, this.fixBarcodes(doc.barcodes, doc.variants));

      const categoryRef = doc.categoryCode || doc.categoryId;
      const category = categoryRef
        ? refs.categories.get(categoryRef)
        : undefined;

      if (!category) {
        throw new Error(
          `Product & service category not found: ${categoryRef || '-'}`,
        );
      }

      if (!checkCodeMask(category, doc.code)) {
        throw new Error('Code does not match the category mask');
      }

      doc.categoryId = category._id;
      delete doc.categoryCode;

      if (doc.vendorCode) {
        doc.vendorId = refs.vendors.get(doc.vendorCode)?._id;

        if (!doc.vendorId) {
          throw new Error(`Vendor not found: ${doc.vendorCode}`);
        }

        delete doc.vendorCode;
      }

      const uom = doc.uom || refs.defaultUom;

      if (!uom) {
        throw new Error('uom is required');
      }

      doc.uom = refs.uomCodes.get(uom) ?? uom;

      if (doc.subUoms) {
        doc.subUoms = doc.subUoms.map((subUom) => ({
          ...subUom,
          uom: subUom.uom
            ? refs.uomCodes.get(subUom.uom) ?? subUom.uom
            : subUom.uom,
        }));
      }

      return category;
    }

    private static async refreshKnowledge(productIds: string[]) {
      try {
        await refreshProductKnowledge({ subdomain, productIds });
      } catch (error) {
        console.error(
          `Failed to refresh product knowledge: ${(error as Error).message}`,
        );
      }
    }

    /**
     * Get Product
     */
    public static async getProduct(selector: any) {
      const product = await models.Products.findOne(selector).lean();

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }

    /**
     * Create a product
     */
    public static async createProduct(doc: IProduct) {
      const refs = await this.loadRefs([doc]);
      const category = this.checkProduct(doc, refs);

      await this.checkCodeDuplication(doc.code);

      doc.sameMasks = await checkSameMaskConfig(models, doc);

      doc.propertiesData = await initCustomField(
        models,
        category,
        doc.code,
        {},
        doc.propertiesData,
      );

      const product = await models.Products.create({
        ...doc,
        createdAt: new Date(),
      });
      sendDbEventLog({
        action: 'create',
        docId: product._id,
        currentDocument: product.toObject(),
      });
      createActivityLog({
        activityType: 'create',
        target: {
          _id: product._id,
        },
        action: {
          type: 'create',
          description: 'Product created',
        },
        changes: {},
      });

      await this.refreshKnowledge([product._id]);

      return product;
    }

    public static async upsertProductsByCode(docs: Partial<IProduct>[]) {
      const codes = uniqueRefs(
        docs.flatMap((doc) =>
          doc.code ? [doc.code, normalizeNewCode(doc.code)] : [],
        ),
      );
      // Deleted products too: the unique index still holds their codes
      const currents = codes.length
        ? await models.Products.find({ code: { $in: codes } }).lean()
        : [];
      const currentByCode = new Map(currents.map((p) => [p.code, p]));

      const items = docs.map((doc) => {
        const current = doc.code
          ? currentByCode.get(doc.code) ??
            currentByCode.get(normalizeNewCode(doc.code))
          : undefined;
        const merged: ProductWriteDoc = current
          ? { ...current, ...doc, code: current.code }
          : { ...doc };

        return { current, doc: merged };
      });

      await this.createMissingCategories(docs);

      const refs = await this.loadRefs(items.map(({ doc }) => doc));
      const results: IProductUpsertResult[] = docs.map(() => ({}));
      const writes: Array<{
        index: number;
        _id: string;
        doc: ProductWriteDoc;
        isInsert: boolean;
      }> = [];
      const insertedCodes = new Set<string>();

      items.forEach(({ current, doc }, index) => {
        try {
          if (current?.status === PRODUCT_STATUSES.DELETED) {
            throw new Error(
              `Code ${current.code} belongs to a deleted product`,
            );
          }

          this.checkProduct(doc, refs);

          const code = doc.code || '';

          if (!current && insertedCodes.has(code)) {
            throw new Error(`Code ${code} repeats an earlier row`);
          }

          const _id = current?._id ?? nanoid();
          doc._id = _id;

          // Validated here so bulkWrite sends every operation and the
          // driver's error indexes stay ours
          const invalid = new models.Products(doc).validateSync();

          if (invalid) {
            throw invalid;
          }

          if (!current) {
            insertedCodes.add(code);
          }

          writes.push({ index, _id, doc, isInsert: !current });
        } catch (e) {
          results[index] = { error: (e as Error).message };
        }
      });

      if (!writes.length) {
        return results;
      }

      const now = new Date();
      const failures = new Map<number, string>();

      try {
        await models.Products.bulkWrite(
          writes.map(({ _id, doc, isInsert }) =>
            isInsert
              ? {
                  insertOne: {
                    document: { ...doc, createdAt: now, updatedAt: now },
                  },
                }
              : {
                  replaceOne: {
                    filter: { _id },
                    replacement: {
                      ...doc,
                      createdAt: doc.createdAt ?? now,
                      updatedAt: now,
                    },
                  },
                },
          ),
          // unordered so one refused row does not abandon the rest
          { ordered: false },
        );
      } catch (error) {
        // Thrown only after every other operation has run
        if (!(error instanceof mongo.MongoBulkWriteError)) {
          throw error;
        }

        for (const writeError of [error.writeErrors].flat()) {
          failures.set(
            writeError.index,
            writeError.errmsg || 'Failed to save row',
          );
        }
      }

      const insertedIds: string[] = [];
      const updatedIds: string[] = [];

      writes.forEach(({ index, _id, isInsert }, operationIndex) => {
        const error = failures.get(operationIndex);

        if (error) {
          results[index] = { error };
          return;
        }

        if (isInsert) {
          insertedIds.push(_id);
        } else {
          updatedIds.push(_id);
        }

        results[index] = { _id };
      });

      if (insertedIds.length || updatedIds.length) {
        sendDbEventLog({
          action: 'bulkWrite',
          docIds: [...insertedIds, ...updatedIds],
          updateDescription: { insertedIds, updatedIds },
        });
      }

      return results;
    }

    public static async updateProduct(_id: string, doc: IProduct) {
      const existing = await models.Products.findOne(
        { _id },
        { similarityId: 1 },
      );

      if (existing?.similarityId) {
        const { code, propertiesData, ...rest } = doc;

        return this.updateProductFromBulk(_id, rest as IProduct);
      }

      return this.updateProductFromBulk(_id, doc);
    }

    public static async updateProductFromBulk(_id: string, doc: IProduct) {
      const product = await models.Products.getProduct({ _id });
      const keepsDuration = this.normalizeDuration(doc, product);

      const category = await models.ProductCategories.getProductCategory({
        _id: doc.categoryId || product.categoryId,
      });

      if (doc.code) {
        doc.code = doc.code.replace(/\*/g, '');
        doc.uom = await models.Uoms.checkUOM(doc);
        doc = { ...doc, ...this.fixBarcodes(doc.barcodes, doc.variants) };

        if (product.code !== doc.code) {
          await this.checkCodeDuplication(doc.code);
        }

        if (!checkCodeMask(category, doc.code)) {
          throw new Error('Code does not match the category mask');
        }
      }

      doc.propertiesData = await initCustomField(
        models,
        category,
        doc.code || product.code,
        product.propertiesData,
        doc.propertiesData,
      );

      doc.sameMasks = await checkSameMaskConfig(models, {
        ...product,
        ...doc,
      });

      await models.Products.updateOne(
        { _id },
        keepsDuration
          ? { $set: doc }
          : {
              $set: doc,
              $unset: { duration: 1, durationType: 1 },
            },
      );

      const updatedProduct = await models.Products.findOne({ _id }).lean();
      if (updatedProduct) {
        sendDbEventLog({
          action: 'update',
          docId: updatedProduct._id,
          currentDocument: updatedProduct,
          prevDocument: product,
        });
        generateProductUpdateActivityLogs(
          product,
          updatedProduct,
          models,
          createActivityLog,
        );

        await this.refreshKnowledge([updatedProduct._id]);
      }

      return updatedProduct;
    }

    // modifier replaces the plain $set when the change is not a set (e.g. $addToSet).
    public static async updateProducts(
      query: any,
      doc: Partial<IProduct>,
      modifier?: UpdateQuery<IProductDocument>,
    ) {
      const products = await models.Products.find(query).lean();

      const result = await models.Products.updateMany(
        query,
        modifier || { $set: doc },
      );

      const updatedProducts = await models.Products.find({
        _id: { $in: products.map((product) => product._id) },
      }).lean();
      const updatedById = new Map(
        updatedProducts.map((product) => [product._id, product]),
      );

      const isDeleting = doc.status === PRODUCT_STATUSES.DELETED;

      sendDbEventLog({
        action: 'updateMany',
        docIds: products.map((product) => product._id),
        updateDescription: doc,
      });

      for (const product of products) {
        const updatedProduct = updatedById.get(product._id);

        if (!updatedProduct) {
          continue;
        }

        if (isDeleting) {
          if (product.status === PRODUCT_STATUSES.DELETED) {
            createActivityLog({
              activityType: 'delete',
              target: {
                _id: product._id,
              },
              action: {
                type: 'delete',
                description: 'Product deleted',
              },
              changes: {},
            });
          }
          continue;
        }

        generateProductUpdateActivityLogs(
          product,
          updatedProduct,
          models,
          createActivityLog,
        );
      }

      await this.refreshKnowledge(products.map((product) => product._id));

      return result;
    }

    public static async removeProducts(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      // Fetch existing product IDs
      const existingProducts = await models.Products.find(
        { _id: { $in: _ids } },
        { _id: 1 },
      );

      const existingIds = new Set(
        existingProducts.map((product) => product._id.toString()),
      );

      for (const id of _ids) {
        if (existingIds.has(id)) {
          usedIds.push(id);
        } else {
          unUsedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        const toUpdate = await models.Products.find({ _id: { $in: usedIds } });
        await models.Products.updateMany(
          { _id: { $in: usedIds } },
          { $set: { status: PRODUCT_STATUSES.DELETED } },
        );
        const updated = await models.Products.find({ _id: { $in: usedIds } });
        sendDbEventLog({
          action: 'updateMany',
          docIds: updated.map((d) => d._id),
          updateDescription: { status: PRODUCT_STATUSES.DELETED },
        });
        for (const product of toUpdate) {
          if (product.status !== PRODUCT_STATUSES.DELETED) {
            createActivityLog({
              activityType: 'delete',
              target: {
                _id: product._id,
              },
              action: {
                type: 'delete',
                description: 'Product deleted',
              },
              changes: {},
            });
          }
        }
        response = 'updated';
      }

      if (unUsedIds.length > 0) {
        const toDelete = await models.Products.find({
          _id: { $in: unUsedIds },
        });
        await models.Products.deleteMany({ _id: { $in: unUsedIds } });
        if (toDelete.length > 0) {
          sendDbEventLog({
            action: 'deleteMany',
            docIds: toDelete.map((d) => d._id),
          });
          for (const product of toDelete) {
            createActivityLog({
              activityType: 'delete',
              target: {
                _id: product._id,
              },
              action: {
                type: 'delete',
                description: 'Product deleted',
              },
              changes: {},
            });
          }
        }
      }

      await this.refreshKnowledge(_ids);

      return response;
    }

    public static async mergeProducts(
      productIds: string[],
      productFields: IProduct,
    ) {
      const fields = ['name', 'code', 'unitPrice', 'categoryId', 'type'];

      for (const field of fields) {
        const value = productFields[field];
        // unitPrice may legitimately be 0 (e.g. services), so only treat
        // null/undefined/empty as missing for it
        const isMissing =
          field === 'unitPrice'
            ? value === undefined || value === null || (value as any) === ''
            : !value;

        if (isMissing) {
          throw new Error(
            `Can not merge products. Must choose ${field} field.`,
          );
        }
      }

      let propertiesData: IPropertyField = {};
      let tagIds: string[] = [];
      let barcodes: string[] = [];
      const name: string = productFields.name || '';
      const shortName: string = productFields.shortName || '';
      const type: string = productFields.type || '';
      const description: string = productFields.description || '';
      const barcodeDescription: string = productFields.barcodeDescription || '';
      const categoryId: string = productFields.categoryId || '';
      const vendorId: string = productFields.vendorId || '';

      for (const productId of productIds) {
        const productObj = await models.Products.getProduct({ _id: productId });

        const productTags = productObj.tagIds || [];

        const productBarcodes = productObj.barcodes || [];

        propertiesData = {
          ...propertiesData,
          ...(productObj.propertiesData || {}),
        };

        tagIds = tagIds.concat(productTags);

        barcodes = barcodes.concat(productBarcodes);

        const oldProduct = await models.Products.findById(productId);
        await models.Products.findByIdAndUpdate(productId, {
          $set: {
            status: PRODUCT_STATUSES.DELETED,
            code: Math.random().toString().concat('^', productObj.code),
          },
        });
        const updatedProduct = await models.Products.findById(productId);
        if (updatedProduct && oldProduct) {
          sendDbEventLog({
            action: 'update',
            docId: updatedProduct._id,
            currentDocument: updatedProduct.toObject(),
            prevDocument: oldProduct.toObject(),
          });
        }
      }

      tagIds = Array.from(new Set(tagIds));

      barcodes = Array.from(new Set(barcodes));

      const product = await models.Products.createProduct({
        ...productFields,
        propertiesData,
        tagIds,
        barcodes,
        barcodeDescription,
        mergedIds: productIds,
        name,
        shortName,
        type,
        uom: await models.Uoms.checkUOM({ ...productFields }),
        description,
        categoryId,
        vendorId,
      });

      await updateProductMergeReferences(productIds, product._id);
      await this.refreshKnowledge(productIds);

      return product;
    }

    public static async duplicateProduct(productId: string) {
      const product = await models.Products.findOne({ _id: productId }).lean();

      if (!product) throw new Error('Product not found');

      const { code, ...productData } = product;

      const newCode = await this.generateCode();

      const newProduct = await models.Products.createProduct({
        ...productData,
        code: `${code}-${newCode}`,
        name: `${product.name} duplicated`,
      });

      return newProduct;
    }

    static async checkCodeDuplication(code: string) {
      const product = await models.Products.findOne({
        code,
        status: { $ne: PRODUCT_STATUSES.DELETED },
      });

      if (product) {
        throw new Error('Code must be unique');
      }
    }

    public static async generateCode(maxAttempts = 10) {
      let attempts = 0;

      while (attempts < maxAttempts) {
        const code = nanoid(6);
        const foundProduct = await models.Products.findOne({
          code,
          status: { $ne: PRODUCT_STATUSES.DELETED },
        });

        if (!foundProduct) {
          return code;
        }

        attempts++;
      }

      throw new Error(
        'Unable to generate unique product code after multiple attempts',
      );
    }

    static fixBarcodes(barcodes?, variants?) {
      if (barcodes?.length) {
        barcodes = barcodes
          .filter((bc) => bc)
          .map((bc) => bc.replace(/\s/g, '').replace(/_/g, ''));

        if (variants) {
          const undefinedVariantCodes = Object.keys(variants).filter(
            (key) => !(barcodes || []).includes(key),
          );
          if (undefinedVariantCodes.length) {
            for (const unDefCode of undefinedVariantCodes) {
              delete variants[unDefCode];
            }
          }
        }
      }

      return { barcodes, variants };
    }
  }

  productSchema.loadClass(Product);

  return productSchema;
};
