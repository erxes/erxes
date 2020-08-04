import { Model, model } from 'mongoose';
import { configSchema, IConfig, IConfigDocument } from './definitions/configs';
import { COMPANY_INDUSTRY_TYPES, CUSTOMER_SELECT_OPTIONS, SOCIAL_LINKS } from './definitions/constants';

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  createOrUpdateConfig({ code, value }: IConfig): IConfigDocument;
  constants();
}

export const loadClass = () => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await Configs.findOne({ code });

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    /**
     * Create or update config
     */
    public static async createOrUpdateConfig({ code, value }: { code: string; value: string[] }) {
      const obj = await Configs.findOne({ code });

      if (obj) {
        await Configs.updateOne({ _id: obj._id }, { $set: { value } });

        return Configs.findOne({ _id: obj._id });
      }

      return Configs.create({ code, value });
    }

    public static constants() {
      return {
        sex_choices: CUSTOMER_SELECT_OPTIONS.SEX,
        company_industry_types: COMPANY_INDUSTRY_TYPES.map(v => ({ label: v, value: v })),
        social_links: SOCIAL_LINKS,
      };
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};

loadClass();

// tslint:disable-next-line
const Configs = model<IConfigDocument, IConfigModel>('configs', configSchema);

export default Configs;
