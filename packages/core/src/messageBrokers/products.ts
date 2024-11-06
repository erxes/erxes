import { escapeRegExp } from "@erxes/api-utils/src/core";
import { generateModels } from "../connectionResolver";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupProductMessageBroker = async (): Promise<void> => {
  consumeRPCQueue("core:uoms.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await models.Uoms.findOne(data).lean(),
      status: "success"
    };
  });

  consumeRPCQueue(
    "core:uoms.findByProductId",
    async ({ subdomain, data: { productId } }) => {
      const models = await generateModels(subdomain);
      const product = await models.Products.getProduct({ _id: productId });

      if (!product.uom) {
        throw new Error("has not uom");
      }

      return {
        data: await models.Uoms.findOne({ _id: product.uom }).lean(),
        status: "success"
      };
    }
  );

  consumeRPCQueue("core:uoms.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await models.Uoms.find(data).lean(),
      status: "success"
    };
  });

  consumeRPCQueue("core:products.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Products.findOne(data).lean(),
      status: "success"
    };
  });

  consumeRPCQueue(
    "core:categories.find",
    async ({ subdomain, data: { query, sort, regData } }) => {
      const models = await generateModels(subdomain);

      return {
        data: regData
          ? await models.ProductCategories.find({
              ...query,
              order: { $regex: new RegExp(regData) }
            }).sort(sort)
          : await models.ProductCategories.find(query).sort(sort).lean(),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:categories.withChilds",
    async ({ subdomain, data: { _id, ids } }) => {
      const models = await generateModels(subdomain);
      const categoryIds = _id ? [_id] : ids || [];
      if (!categoryIds.length) {
        return {
          data: [],
          status: "success"
        };
      }

      const categories = await models.ProductCategories.find({
        _id: { $in: categoryIds }
      }).lean();

      if (!categories.length) {
        return {
          data: [],
          status: "success"
        };
      }

      const orderQry: any[] = [];
      for (const category of categories) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) }
        });
      }

      return {
        data: await models.ProductCategories.find({
          status: { $nin: ["disabled", "archived"] },
          $or: orderQry
        })
          .sort({ order: 1 })
          .lean(),
        status: "success"
      };
    }
  );

  consumeRPCQueue("core:categories.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await models.ProductCategories.findOne(data).lean(),
      status: "success"
    };
  });

  consumeRPCQueue(
    "core:categories.updateProductCategory",
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.updateProductCategory(_id, doc),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:categories.createProductCategory",
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.createProductCategory(doc),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:categories.removeProductCategory",
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.removeProductCategory(_id),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:products.find",
    async ({
      subdomain,
      data: { query, sort, skip, limit, categoryId, categoryIds, fields }
    }) => {
      const models = await generateModels(subdomain);

      if (!query) {
        query = {};
      }

      if (categoryIds?.length > 0) {
        const categories = await models.ProductCategories.find({
          _id: { $in: categoryIds }
        }).lean();

        const orderQry: any[] = [];

        for (const category of categories) {
          orderQry.push({
            order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) }
          });
        }

        const categoriesWithChildren = await models.ProductCategories.find({
          status: { $nin: ["disabled", "archived"] },
          $or: orderQry
        }).lean();

        query.categoryId = {
          $in: categoriesWithChildren.map(category => category._id)
        };
      }

      if (categoryId) {
        const category = await models.ProductCategories.findOne({
          _id: categoryId
        }).lean();
        if (!category) {
          throw new Error(`ProductCategory ${categoryId} not found`);
        }
        const categories = await models.ProductCategories.find({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) }
        }).lean();

        query.categoryId = { $in: categories.map(c => c._id) };
      }

      return {
        data: await models.Products.find(query, fields || {})
          .sort(sort)
          .skip(skip || 0)
          .limit(limit || 0)
          .lean(),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:products.count",
    async ({ subdomain, data: { query, categoryId } }) => {
      const models = await generateModels(subdomain);

      const filter = { ...(query || {}) };
      if (categoryId) {
        const category = await models.ProductCategories.findOne({
          _id: categoryId
        }).lean();
        if (!category) {
          throw new Error(`ProductCategory ${categoryId} not found`);
        }
        const categories = await models.ProductCategories.find({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) }
        }).lean();

        filter.categoryId = { $in: categories.map(c => c._id) };
      }

      return {
        data: await models.Products.find(filter).countDocuments(),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:categories.count",
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ProductCategories.find(query).countDocuments(),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:products.createProduct",
    async ({ subdomain, data: { doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.createProduct(doc),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:products.updateProduct",
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.updateProduct(_id, doc),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:products.removeProducts",
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.removeProducts(_ids),
        status: "success"
      };
    }
  );

  consumeQueue(
    "core:products.updateProducts",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Products.updateMany(selector, modifier),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "core:productsConfigs.getConfig",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { code, defaultValue } = data;

      return {
        status: "success",
        data: await models.ProductsConfigs.getConfig(code, defaultValue)
      };
    }
  );
};
