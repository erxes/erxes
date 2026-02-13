import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

interface ITemplateProduct {
  name: string;
  code: string;
  shortName?: string;
  type?: string;
  description?: string;
  unitPrice?: number;
  barcodes?: string[];
  barcodeDescription?: string;
  uom?: string;
  categoryName?: string;
  categoryCode?: string;
  brandNames?: string[];
  brandCodes?: string[];
}

const ensureUomExists = async (models: any, uomCode?: string) => {
  if (!uomCode) return undefined;
  const existing = await models.Uoms.findOne({ code: uomCode }).lean();
  if (!existing) await models.Uoms.createUom({ code: uomCode, name: uomCode });
  return uomCode;
};

const ensureCategoryExists = async (
  models: any,
  categoryName?: string,
  categoryCode?: string,
) => {
  if (!categoryCode && !categoryName) return undefined;

  // Find existing by code or name
  const existing = categoryCode
    ? await models.ProductCategories.findOne({ code: categoryCode }).lean()
    : await models.ProductCategories.findOne({ name: categoryName }).lean();

  if (existing) return existing._id;

  // Create new
  const newCategory = await models.ProductCategories.createProductCategory({
    name: categoryName || categoryCode || 'Default Category',
    code: categoryCode || categoryName || `CAT_${Date.now()}`,
  } as any);

  return newCategory._id;
};

const ensureBrandsExist = async (
  models: any,
  brandNames: string[] = [],
  brandCodes: string[] = [],
): Promise<string[]> => {
  if (!brandNames.length && !brandCodes.length) return [];

  const brandIds: string[] = [];
  const maxLen = Math.max(brandNames.length, brandCodes.length);

  for (let i = 0; i < maxLen; i++) {
    const [name, code] = [brandNames[i], brandCodes[i]];

    // Find by code or name
    const existing = code
      ? await models.Brands.findOne({ code }).lean()
      : name
      ? await models.Brands.findOne({ name }).lean()
      : null;

    if (existing) {
      brandIds.push(existing._id);
      continue;
    }

    // Create new brand
    if (name || code) {
      const newBrand = await models.Brands.createBrand({ name: name || code });
      brandIds.push(newBrand._id);
    }
  }

  return brandIds;
};

// Template-д орох product field-үүд
const PRODUCT_TEMPLATE_FIELDS = [
  'name',
  'code',
  'shortName',
  'type',
  'description',
  'unitPrice',
  'barcodes',
  'barcodeDescription',
  'uom',
] as const;

const pick = <T extends object>(obj: T, keys: readonly (keyof T)[]) =>
  Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

const resolveProductTemplate = async (
  models: any,
  product: any,
): Promise<ITemplateProduct> => {
  // Category resolve
  const category = product.categoryId
    ? await models.ProductCategories.findOne({ _id: product.categoryId }).lean()
    : null;

  // Brands resolve
  const brands = product.scopeBrandIds?.length
    ? await models.Brands.find({ _id: { $in: product.scopeBrandIds } }).lean()
    : [];

  return {
    ...pick(product, PRODUCT_TEMPLATE_FIELDS),
    categoryName: category?.name || '',
    categoryCode: category?.code || '',
    brandNames: brands.map((b: any) => b.name || ''),
    brandCodes: brands.map((b: any) => b.code || ''),
  } as ITemplateProduct;
};

const convertProductsToTemplate = async (
  models: any,
  products: any[],
  templateName: string,
) => {
  const templateProducts: ITemplateProduct[] = [];

  for (const product of products) {
    templateProducts.push(await resolveProductTemplate(models, product));
  }

  return {
    name: templateName,
    content: JSON.stringify(templateProducts),
    contentType: 'core:product',
    pluginType: 'core',
    status: 'active' as const,
  };
};

interface ITemplateCategory {
  name: string;
  code: string;
  order?: string;
  description?: string;
  meta?: string;
  parentName?: string;
  parentCode?: string;
  status?: string;
  maskType?: string;
  mask?: any;
  isSimilarity?: boolean;
  similarities?: {
    id: string;
    groupId: string;
    fieldId: string;
    title: string;
  }[];
  attachment?: any;
  scopeBrandIds?: string[];
}

interface ITemplateCategoryNode {
  _id: string;
  name: string;
  code: string;
  parentId?: string;
  order?: string;
  isLeaf: boolean;
  products: ITemplateProduct[];
  children: ITemplateCategoryNode[];
}

const getCategoryLevel = async (
  models: any,
  category: any,
): Promise<'root' | 'mid' | 'leaf'> => {
  const hasParent = !!category.parentId;
  const childrenCount = await models.ProductCategories.countDocuments({
    parentId: category._id,
    status: { $nin: ['disabled', 'archived'] },
  });
  const hasChildren = childrenCount > 0;

  if (!hasParent && hasChildren) return 'root';
  if (hasParent && hasChildren) return 'mid';
  return 'leaf';
};

const buildCategoryTreeWithProducts = async (
  models: any,
  categories: any[],
  allProducts: any[],
): Promise<ITemplateCategoryNode[]> => {
  const productsByCategory: Record<string, ITemplateProduct[]> = {};

  for (const product of allProducts) {
    if (product.categoryId) {
      if (!productsByCategory[product.categoryId]) {
        productsByCategory[product.categoryId] = [];
      }
      productsByCategory[product.categoryId].push(
        await resolveProductTemplate(models, product),
      );
    }
  }

  const categoryNodes: Record<string, ITemplateCategoryNode> = {};
  const rootNodes: ITemplateCategoryNode[] = [];

  for (const category of categories) {
    const hasChildren = categories.some((c) => c.parentId === category._id);

    categoryNodes[category._id] = {
      _id: category._id,
      name: category.name,
      code: category.code,
      parentId: category.parentId,
      order: category.order,
      isLeaf: !hasChildren,
      products: productsByCategory[category._id] || [],
      children: [],
    };
  }

  for (const category of categories) {
    const node = categoryNodes[category._id];

    if (category.parentId && categoryNodes[category.parentId]) {
      categoryNodes[category.parentId].children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  const sortChildren = (nodes: ITemplateCategoryNode[]) => {
    nodes.sort((a, b) => (a.order || '').localeCompare(b.order || ''));
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    }
  };

  sortChildren(rootNodes);

  return rootNodes;
};

const getChildCategoriesRecursive = async (
  models: any,
  categoryIds: string[],
): Promise<any[]> => {
  if (!categoryIds.length) return [];

  const categories = await models.ProductCategories.find({
    _id: { $in: categoryIds },
  }).lean();

  if (!categories.length) return [];

  const orderQry: any[] = [];
  for (const category of categories) {
    if (category.order) {
      orderQry.push({
        order: {
          $regex: new RegExp(
            `^${category.order.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          ),
        },
      });
    }
  }

  if (!orderQry.length) return categories;

  return models.ProductCategories.find({
    status: { $nin: ['disabled', 'archived'] },
    $or: orderQry,
  })
    .sort({ order: 1 })
    .lean();
};

const getProductsByCategoryIds = async (
  models: any,
  categoryIds: string[],
): Promise<any[]> => {
  if (!categoryIds.length) return [];

  return models.Products.find({
    categoryId: { $in: categoryIds },
    status: { $nin: ['deleted', 'archived'] },
  }).lean();
};

const convertCategoriesToTemplate = async (
  models: any,
  categories: any[],
  templateName: string,
  includeChildren: boolean = true,
) => {
  let allCategories = categories;
  if (includeChildren) {
    const categoryIds = categories.map((c: any) => c._id);
    allCategories = await getChildCategoriesRecursive(models, categoryIds);

    const seen = new Set<string>();
    allCategories = allCategories.filter((c: any) => {
      if (seen.has(c._id)) return false;
      seen.add(c._id);
      return true;
    });
  }

  // Step 2: Convert categories
  const templateCategories: ITemplateCategory[] = [];

  for (const category of allCategories) {
    let parentName = '';
    let parentCode = '';
    if (category.parentId) {
      const parent = await models.ProductCategories.findOne({
        _id: category.parentId,
      }).lean();
      if (parent) {
        parentName = parent.name || '';
        parentCode = parent.code || '';
      }
    }

    const { _id, createdAt, updatedAt, __v, productCount, ...categoryData } =
      category;

    templateCategories.push({
      ...categoryData,
      parentName,
      parentCode,
    });
  }

  const allCategoryIds = allCategories.map((c: any) => c._id);
  const products = await getProductsByCategoryIds(models, allCategoryIds);

  const templateProducts: ITemplateProduct[] = [];
  const productsByCategory: Record<string, ITemplateProduct[]> = {};

  for (const product of products) {
    const templateProduct = await resolveProductTemplate(models, product);
    templateProducts.push(templateProduct);

    if (product.categoryId) {
      if (!productsByCategory[product.categoryId]) {
        productsByCategory[product.categoryId] = [];
      }

      productsByCategory[product.categoryId].push(templateProduct);
    }
  }

  // Build hierarchical tree structure using helper function
  const categoryTree = await buildCategoryTreeWithProducts(
    models,
    allCategories,
    products,
  );

  const templateContent = {
    categories: templateCategories,
    products: templateProducts,
    categoryTree,
  };

  return {
    name: templateName,
    content: JSON.stringify(templateContent),
    contentType: 'core:productCategory',
    pluginType: 'core',
    status: 'active' as const,
  };
};

const parseTemplateToProducts = (
  templateContent: string,
): ITemplateProduct[] => {
  try {
    return JSON.parse(templateContent);
  } catch (error) {
    throw new Error('Invalid template content');
  }
};

const resolveCategoryId = async (
  models: any,
  product: ITemplateProduct,
  prefix: string,
  categoryId?: string,
  codeToIdMap?: Record<string, string>,
): Promise<string | undefined> => {
  if (categoryId) return categoryId;

  // By code from map or DB
  if (product.categoryCode) {
    if (codeToIdMap?.[product.categoryCode])
      return codeToIdMap[product.categoryCode];
    const cat = await models.ProductCategories.findOne({
      code: prefix + product.categoryCode,
    }).lean();
    if (cat) return cat._id;
  }

  // By name
  if (product.categoryName) {
    const cat = await models.ProductCategories.findOne({
      name: product.categoryName,
    }).lean();
    if (cat) return cat._id;
  }

  // Create new if needed
  return ensureCategoryExists(
    models,
    product.categoryName,
    product.categoryCode,
  );
};

const createProductFromTemplate = async (
  models: any,
  product: ITemplateProduct,
  prefix: string,
  categoryId?: string,
  codeToIdMap?: Record<string, string>,
) => {
  const newCode = prefix + product.code;

  // Check existing
  const existing = await models.Products.findOne({ code: newCode }).lean();
  if (existing) return existing;

  // Resolve dependencies
  const [uom, productCategoryId, scopeBrandIds] = await Promise.all([
    ensureUomExists(models, product.uom),
    resolveCategoryId(models, product, prefix, categoryId, codeToIdMap),
    ensureBrandsExist(models, product.brandNames, product.brandCodes),
  ]);

  // Create product with template fields + resolved refs
  const {
    categoryName,
    categoryCode,
    brandNames,
    brandCodes,
    code,
    ...templateFields
  } = product;

  const newProduct = await models.Products.createProduct({
    ...templateFields,
    code: newCode,
    uom,
    categoryId: productCategoryId,
    scopeBrandIds: scopeBrandIds.length ? scopeBrandIds : undefined,
    variants: {},
  });

  return newProduct.toObject?.() ?? newProduct;
};

export const templatesRouter = router({
  saveAsTemplate: publicProcedure
    .input(z.any())
    .mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { sourceId, contentType, name, description } = input;

      if (!contentType || !contentType.includes(':')) {
        return {
          status: 'error',
          errorMessage: 'Invalid contentType format',
        };
      }

      const [, type] = contentType.split(':');

      if (type === 'productCategory') {
        const category = await models.ProductCategories.findOne({
          _id: sourceId,
        }).lean();

        if (!category) {
          return {
            status: 'error',
            errorMessage: 'Product category not found',
          };
        }

        // Determine category level (root/mid/leaf) for template structure
        const categoryLevel = await getCategoryLevel(models, category);

        // Recursively include child categories and their products
        const templateData = await convertCategoriesToTemplate(
          models,
          [category],
          name || category.name,
          true, // includeChildren = true
        );

        const parsedContent = JSON.parse(templateData.content);

        return {
          status: 'success',
          data: {
            content: templateData.content,
            categoryLevel, // 'root' | 'mid' | 'leaf'
            categoryId: category._id,
            categoryName: category.name,
            categoryCode: category.code,
            description:
              description ||
              `${category.name} - ${
                parsedContent.categories?.length || 0
              } categories, ${parsedContent.products?.length || 0} products`,
          },
        };
      }

      if (type !== 'product') {
        return {
          status: 'error',
          errorMessage: `Unsupported content type: ${type}`,
        };
      }

      const product = await models.Products.findOne({ _id: sourceId }).lean();

      if (!product) {
        return {
          status: 'error',
          errorMessage: 'Product not found',
        };
      }

      const templateData = await convertProductsToTemplate(
        models,
        [product],
        name || product.name,
      );

      return {
        status: 'success',
        data: {
          content: templateData.content,
          description: description || product.description,
        },
      };
    }),

  saveAsTemplateMulti: publicProcedure
    .input(z.any())
    .mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { sourceIds, contentType, name, description } = input;

      if (!contentType || !contentType.includes(':')) {
        return {
          status: 'error',
          errorMessage: 'Invalid contentType format',
        };
      }

      const [, type] = contentType.split(':');

      if (!sourceIds || sourceIds.length === 0) {
        return {
          status: 'error',
          errorMessage: 'sourceIds is required',
        };
      }

      if (type === 'productCategory') {
        const categories = await models.ProductCategories.find({
          _id: { $in: sourceIds },
        }).lean();

        if (!categories.length) {
          return {
            status: 'error',
            errorMessage: 'Product categories not found',
          };
        }

        // Recursively include child categories and their products
        const templateData = await convertCategoriesToTemplate(
          models,
          categories,
          name || `${categories.length} categories template`,
          true, // includeChildren = true
        );

        const parsedContent = JSON.parse(templateData.content);

        return {
          status: 'success',
          data: {
            content: templateData.content,
            description:
              description ||
              `Template with ${
                parsedContent.categories?.length || 0
              } categories and ${parsedContent.products?.length || 0} products`,
          },
        };
      }

      if (type !== 'product') {
        return {
          status: 'error',
          errorMessage: `Unsupported content type: ${type}`,
        };
      }

      const products = await models.Products.find({
        _id: { $in: sourceIds },
      }).lean();

      if (!products.length) {
        return {
          status: 'error',
          errorMessage: 'Products not found',
        };
      }

      const templateData = await convertProductsToTemplate(
        models,
        products,
        name || `${products.length} products template`,
      );

      return {
        status: 'success',
        data: {
          content: templateData.content,
          description:
            description || `Template with ${products.length} products`,
        },
      };
    }),

  useTemplate: publicProcedure
    .input(
      z.object({
        template: z
          .object({
            content: z.string(),
            contentType: z.string().optional(),
            description: z.string().optional(),
          })
          .optional(),
        templateContent: z.string().optional(),
        contentType: z.string().optional(),
        currentUser: z
          .object({
            _id: z.string(),
          })
          .optional(),
        categoryId: z.string().optional(),
        prefix: z.string().optional(),
        relTypeId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { models } = ctx;

      const content = input.templateContent || input.template?.content || '';
      const resolvedContentType =
        input.contentType || input.template?.contentType || '';
      const prefix = input.prefix || '';

      if (!content) {
        return {
          status: 'error',
          errorMessage: 'No template content provided',
        };
      }

      const [, type] = resolvedContentType.includes(':')
        ? resolvedContentType.split(':')
        : ['', ''];

      if (type === 'productCategory') {
        try {
          const parsed = JSON.parse(content);

          let templateCategories: ITemplateCategory[] = [];
          let templateProducts: ITemplateProduct[] = [];

          if (Array.isArray(parsed)) {
            templateCategories = parsed;
          } else {
            templateCategories = parsed.categories || [];
            templateProducts = parsed.products || [];
          }

          const createdCategories: any[] = [];
          const codeToIdMap: Record<string, string> = {};

          templateCategories.sort((a, b) =>
            (a.order || '').localeCompare(b.order || ''),
          );

          for (const catData of templateCategories) {
            const newCode = prefix + catData.code;

            const existing = await models.ProductCategories.findOne({
              code: newCode,
            }).lean();

            if (existing) {
              createdCategories.push(existing);
              codeToIdMap[catData.code] = existing._id;
              continue;
            }

            let parentId: string | undefined;

            if (catData.parentCode) {
              if (codeToIdMap[catData.parentCode]) {
                parentId = codeToIdMap[catData.parentCode];
              } else {
                const parent = await models.ProductCategories.findOne({
                  code: prefix + catData.parentCode,
                }).lean();
                if (parent) {
                  parentId = parent._id;
                  codeToIdMap[catData.parentCode] = parent._id;
                }
              }
            }

            if (!parentId && catData.parentName) {
              const parent = await models.ProductCategories.findOne({
                name: catData.parentName,
              }).lean();
              if (parent) {
                parentId = parent._id;
              }
            }

            const newCategory =
              await models.ProductCategories.createProductCategory({
                name: catData.name,
                code: newCode,
                description: catData.description,
                meta: catData.meta,
                parentId,
                status: catData.status || 'active',
                maskType: catData.maskType,
                mask: catData.mask,
                isSimilarity: catData.isSimilarity,
                similarities: catData.similarities,
                attachment: catData.attachment,
                scopeBrandIds: catData.scopeBrandIds,
              } as any);

            const categoryObj = newCategory.toObject
              ? newCategory.toObject()
              : newCategory;
            createdCategories.push(categoryObj);
            codeToIdMap[catData.code] = categoryObj._id;
          }

          const createdProducts: any[] = [];

          for (const product of templateProducts) {
            const created = await createProductFromTemplate(
              models,
              product,
              prefix,
              undefined,
              codeToIdMap,
            );
            createdProducts.push(created);
          }

          return {
            status: 'success',
            categories: createdCategories,
            products: createdProducts,
            summary: {
              totalCategories: createdCategories.length,
              totalProducts: createdProducts.length,
            },
          };
        } catch (error: any) {
          console.error(
            'useTemplate productCategory error:',
            error.message,
            error.stack,
          );
          return {
            status: 'error',
            errorMessage:
              error.message ||
              'Failed to create categories and products from template',
          };
        }
      }

      if (type === 'product') {
        try {
          const templateProducts = parseTemplateToProducts(content);
          const createdProducts: any[] = [];

          for (const product of templateProducts) {
            const created = await createProductFromTemplate(
              models,
              product,
              prefix,
              input.categoryId,
            );
            createdProducts.push(created);
          }

          return {
            status: 'success',
            products: createdProducts,
            summary: {
              totalProducts: createdProducts.length,
            },
          };
        } catch (error: any) {
          console.error(
            'useTemplate product error:',
            error.message,
            error.stack,
          );
          return {
            status: 'error',
            errorMessage:
              error.message || 'Failed to create products from template',
          };
        }
      }

      return {
        status: 'error',
        errorMessage: `Unsupported content type for useTemplate: ${resolvedContentType}`,
      };
    }),
});
