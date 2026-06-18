import { FilterQuery, Model } from 'mongoose';
import {
  IConfig,
  IConfigDocument,
  IProductsConfig,
  IProductsConfigDocument,
} from '@/posclient/@types/configs';
import type { IModels } from '~/connectionResolvers';
import { productsConfigSchema, configSchema } from '../definitions/configs';

export interface IConfigModel extends Model<IConfigDocument> {
  createConfig(token: string, name: string): Promise<IConfigDocument>;
  getConfig(query: FilterQuery<IConfigDocument>): Promise<IConfigDocument>;
  removeConfig(_id: string): Promise<IConfigDocument>;
  updateConfig(_id: string, doc: IConfig): Promise<IConfigDocument>;
}

const removeConfigRelatedDocuments = async (
  models: IModels,
  config: IConfigDocument,
) => {
  const { _id, token } = config;
  const userIds = [...(config.adminIds || []), ...(config.cashierIds || [])];
  const orderSelector = {
    $or: [{ posToken: token }, { subToken: token }],
  };
  const orders = await models.Orders.find(orderSelector, { _id: 1 }).lean();
  const orderIds = orders.map((order) => order._id);

  await models.PosUsers.updateMany(
    { _id: { $in: userIds }, tokens: token },
    { $pull: { tokens: token } },
  );
  await models.PosUsers.deleteMany({ tokens: { $size: 0 } });

  await models.Covers.deleteMany({ posToken: token });
  await models.PosSlots.deleteMany({ posToken: token });

  await models.ProductCategories.updateMany(
    { tokens: token },
    { $pull: { tokens: token } },
  );
  await models.ProductCategories.deleteMany({ tokens: { $size: 0 } });

  await models.Products.updateMany(
    { tokens: token },
    { $pull: { tokens: token } },
  );
  await models.Products.deleteMany({ tokens: { $size: 0 } });

  await models.PutResponses.deleteMany({
    $or: [{ posToken: token }, { contentId: { $in: orderIds } }],
  });
  await models.OrderItems.deleteMany({ orderId: { $in: orderIds } });
  await models.Orders.deleteMany(orderSelector);

  await models.Configs.deleteOne({ _id });
};

export const loadConfigClass = (models: IModels) => {
  class Config {
    public static async getConfig(query: FilterQuery<IConfigDocument>) {
      const pos = await models.Configs.findOne(query).lean();

      if (!pos) {
        throw new Error('POS config not found');
      }

      return pos;
    }

    public static async createConfig(token: string, name: string) {
      try {
        const config = await models.Configs.findOne({ token });

        if (config) {
          throw new Error(
            `Config already exists with the following token: ${token}`,
          );
        }

        await models.Configs.create({ token, name });
        return await models.Configs.findOne({ token }).lean();
      } catch (e) {
        throw new Error(`Can not create POS config: ${e.message}`);
      }
    }

    public static async updateConfig(_id: string, doc: IConfig) {
      await models.Configs.getConfig({ _id });

      await models.Configs.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true },
      );

      return models.Configs.findOne({ _id }).lean();
    }

    public static async removeConfig(_id: string) {
      const config = await models.Configs.getConfig({ _id });

      await removeConfigRelatedDocuments(models, config);

      return config;
    }
  }

  configSchema.loadClass(Config);
  return configSchema;
};

export interface IProductsConfigModel extends Model<IProductsConfigDocument> {
  getConfig(code: string, defaultValue?: string): Promise<any>;
  createOrUpdateConfig({
    code,
    value,
  }: IProductsConfig): Promise<IProductsConfigDocument>;
  constants();
}

export const loadProductsConfigClass = (models) => {
  class ProductsConfig {
    /*
     * Get a Config
     */
    public static async getConfig(code: string, defaultValue?: any) {
      const config = await models.ProductsConfigs.findOne({ code });

      if (!config) {
        return defaultValue || '';
      }

      return config.value;
    }

    /**
     * Create or update config
     */
    public static async createOrUpdateConfig({
      code,
      value,
    }: {
      code: string;
      value: any;
    }) {
      let obj = await models.ProductsConfigs.findOne({ code });

      if (!obj) {
        await models.ProductsConfigs.create({ code });
        obj = await models.ProductsConfigs.findOne({ code });
      }

      await models.ProductsConfigs.updateOne(
        { _id: obj._id },
        { $set: { value } },
      );

      return models.ProductsConfigs.findOne({ _id: obj._id });
    }

    public static constants() {
      return {};
    }
  }

  productsConfigSchema.loadClass(ProductsConfig);

  return productsConfigSchema;
};
