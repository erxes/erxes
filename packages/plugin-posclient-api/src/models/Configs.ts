import mongoose, { Model, model } from 'mongoose';
import { IConfig, configSchema, IConfigDocument } from './definitions/configs';

export interface IConfigModel extends Model<IConfigDocument> {
  createConfig(token: string): Promise<IConfigDocument>;
  getConfig(query: any): Promise<IConfigDocument>;
  removeConfig(_id: string): Promise<IConfigDocument>;
  updateConfig(_id: string, doc: IConfig): Promise<IConfigDocument>;
}

export const loadClass = () => {
  class Config {
    public static async getConfig(query: any) {
      const pos = await Configs.findOne(query).lean();

      if (!pos) {
        throw new Error('POS config not found');
      }

      return pos;
    }

    public static async createConfig(token: string) {
      try {
        const config = await Configs.findOne({ token });

        if (config) {
          throw new Error(
            `Config already exists with the following token: ${token}`
          );
        }

        return Configs.create({ token });
      } catch (e) {
        throw new Error(`Can not create POS config: ${e.message}`);
      }
    }

    public static async updateConfig(_id: string, doc: IConfig) {
      await Configs.getConfig({ _id });

      await Configs.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Configs.findOne({ _id }).lean();
    }

    public static async removeConfig(_id: string) {
      await Configs.getConfig({ _id });

      return Configs.deleteOne({ _id });
    }
  }

  configSchema.loadClass(Config);
  return configSchema;
};

loadClass();

// tslint:disable-next-line
delete mongoose.connection.models['configs'];

// tslint:disable-next-line
export const Configs = model<IConfigDocument, IConfigModel>(
  'configs',
  configSchema
);
