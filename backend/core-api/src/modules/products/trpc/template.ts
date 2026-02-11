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

  const existingUom = await models.Uoms.findOne({ code: uomCode }).lean();
  if (existingUom) {
    return uomCode;
  }

  await models.Uoms.createUom({ code: uomCode, name: uomCode });
  return uomCode;
};

const ensureCategoryExists = async (
  models: any,
  categoryName?: string,
  categoryCode?: string,
) => {
  if (!categoryCode && !categoryName) return undefined;

  if (categoryCode) {
    const existingByCode = await models.ProductCategories.findOne({
      code: categoryCode,
    }).lean();
    if (existingByCode) {
      return existingByCode._id;
    }
  }

  if (categoryName) {
    const existingByName = await models.ProductCategories.findOne({
      name: categoryName,
    }).lean();
    if (existingByName) {
      return existingByName._id;
    }
  }

  const newCategory = await models.ProductCategories.createProductCategory({
    name: categoryName || categoryCode || 'Default Category',
    code: categoryCode || categoryName || `CAT_${Date.now()}`,
  } as any);

  return newCategory._id;
};

const ensureBrandsExist = async (
  models: any,
  brandNames?: string[],
  brandCodes?: string[],
) => {
  if (
    (!brandNames || brandNames.length === 0) &&
    (!brandCodes || brandCodes.length === 0)
  ) {
    return [];
  }

  const brandIds: string[] = [];
  const names = brandNames || [];
  const codes = brandCodes || [];

  for (let i = 0; i < Math.max(names.length, codes.length); i++) {
    const name = names[i];
    const code = codes[i];

    if (code) {
      const existingByCode = await models.Brands.findOne({ code }).lean();
      if (existingByCode) {
        brandIds.push(existingByCode._id);
        continue;
      }
    }

    if (name) {
      const existingByName = await models.Brands.findOne({ name }).lean();
      if (existingByName) {
        brandIds.push(existingByName._id);
        continue;
      }
    }

    if (name || code) {
      const newBrand = await models.Brands.createBrand({
        name: name || code || `Brand_${Date.now()}`,
      });
      brandIds.push(newBrand._id);
    }
  }

  return brandIds;
};

const convertProductsToTemplate = async (
  models: any,
  products: any[],
  templateName: string,
) => {
  const templateProducts: ITemplateProduct[] = [];

  for (const product of products) {
    let categoryName = '';
    let categoryCode = '';
    if (product.categoryId) {
      const category = await models.ProductCategories.findOne({
        _id: product.categoryId,
      }).lean();
      if (category) {
        categoryName = category.name || '';
        categoryCode = category.code || '';
      }
    }

    let brandNames: string[] = [];
    let brandCodes: string[] = [];
    if (product.scopeBrandIds && product.scopeBrandIds.length > 0) {
      const brands = await models.Brands.find({
        _id: { $in: product.scopeBrandIds },
      }).lean();
      brandNames = brands.map((b: any) => b.name || '');
      brandCodes = brands.map((b: any) => b.code || '');
    }

    templateProducts.push({
      ...product,
      categoryName,
      categoryCode,
      brandNames,
      brandCodes,
    });
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

const convertCategoriesToTemplate = async (
  models: any,
  categories: any[],
  templateName: string,
) => {
  const templateCategories: ITemplateCategory[] = [];

  for (const category of categories) {
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

  return {
    name: templateName,
    content: JSON.stringify(templateCategories),
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

        const templateData = await convertCategoriesToTemplate(
          models,
          [category],
          name || category.name,
        );

        return {
          status: 'success',
          data: {
            content: templateData.content,
            description: description || category.description,
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

        const templateData = await convertCategoriesToTemplate(
          models,
          categories,
          name || `${categories.length} categories template`,
        );

        return {
          status: 'success',
          data: {
            content: templateData.content,
            description:
              description ||
              `Template with ${categories.length} product categories`,
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

      // Support both direct templateContent and template object from templateUse mutation
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

      // productCategory template -> create categories
      if (type === 'productCategory') {
        try {
          const templateCategories: ITemplateCategory[] = JSON.parse(content);
          const createdCategories: any[] = [];

          for (const catData of templateCategories) {
            let parentId: string | undefined;
            if (catData.parentCode) {
              const parent = await models.ProductCategories.findOne({
                code: catData.parentCode,
              }).lean();
              if (parent) {
                parentId = parent._id;
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

            // Check if category with same code already exists
            const existing = await models.ProductCategories.findOne({
              code: catData.code,
            }).lean();

            if (existing) {
              createdCategories.push(existing);
              continue;
            }

            const newCategory =
              await models.ProductCategories.createProductCategory({
                name: prefix + catData.name,
                code: prefix + catData.code,
                order: catData.order || '',
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

            createdCategories.push(newCategory);
          }

          return {
            status: 'success',
            categories: createdCategories,
            summary: {
              totalCategories: createdCategories.length,
            },
          };
        } catch (error: any) {
          return {
            status: 'error',
            errorMessage:
              error.message || 'Failed to create categories from template',
          };
        }
      }

      // =============================================
      // product template -> create products (commented out)
      // =============================================
      /*
      if (type === 'product' || !type) {
        const templateProducts = parseTemplateToProducts(content);

        const createdProducts: any[] = [];
        const createdRelatedItems = {
          uoms: [] as string[],
          categories: [] as string[],
          brands: [] as string[],
        };

        for (const product of templateProducts) {
          const uom = await ensureUomExists(models, product.uom);
          if (product.uom && !createdRelatedItems.uoms.includes(product.uom)) {
            const existingUom = await models.Uoms.findOne({
              code: product.uom,
            }).lean();
            if (!existingUom) {
              createdRelatedItems.uoms.push(product.uom);
            }
          }

          let productCategoryId = input.categoryId;
          if (!productCategoryId) {
            productCategoryId = await ensureCategoryExists(
              models,
              product.categoryName,
              product.categoryCode,
            );
            if (
              product.categoryName &&
              !createdRelatedItems.categories.includes(product.categoryName)
            ) {
              createdRelatedItems.categories.push(product.categoryName);
            }
          }

          const scopeBrandIds = await ensureBrandsExist(
            models,
            product.brandNames,
            product.brandCodes,
          );
          if (product.brandNames) {
            for (const brandName of product.brandNames) {
              if (!createdRelatedItems.brands.includes(brandName)) {
                createdRelatedItems.brands.push(brandName);
              }
            }
          }

          const newProduct = await models.Products.createProduct({
            name: prefix + product.name,
            code: prefix + product.code,
            shortName: product.shortName ? prefix + product.shortName : undefined,
            type: product.type,
            description: product.description,
            unitPrice: product.unitPrice,
            barcodes: product.barcodes,
            barcodeDescription: product.barcodeDescription,
            uom,
            categoryId: productCategoryId,
            scopeBrandIds: scopeBrandIds.length > 0 ? scopeBrandIds : undefined,
            variants: {},
          });

          createdProducts.push(newProduct);
        }

        return {
          products: createdProducts,
          createdRelatedItems,
          summary: {
            totalProducts: createdProducts.length,
            newUoms: createdRelatedItems.uoms.length,
            newCategories: createdRelatedItems.categories.length,
            newBrands: createdRelatedItems.brands.length,
          },
        };
      }
      */
      return {
        status: 'error',
        errorMessage: `Unsupported content type for useTemplate: ${resolvedContentType}`,
      };
    }),
});
