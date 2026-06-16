import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { configSchema } from '@/integrations/whatsapp/db/definitions/config';
import {
  IWhatsappConfig,
  IWhatsappConfigDocument,
} from '@/integrations/whatsapp/@types/config';

export interface IWhatsappConfigModel extends Model<IWhatsappConfigDocument> {
  getConfig(code: string): Promise<Pick<IWhatsappConfig, 'value'>>;
  updateConfigs(configsMap: Record<string, unknown>): Promise<void>;
  createOrUpdateConfig(
    doc: IWhatsappConfig,
  ): Promise<IWhatsappConfigDocument>;
}

export const loadWhatsappConfigClass = (models: IModels) => {
  class Config {
    public static async getConfig(code: string) {
      const config = await models.WhatsappConfigs.findOne({ code });

      if (!config) {
        return { value: '' };
      }

      return config;
    }

    public static async createOrUpdateConfig({
      code,
      value,
    }: IWhatsappConfig) {
      const config = await models.WhatsappConfigs.findOne({ code });

      if (config) {
        await models.WhatsappConfigs.updateOne(
          { _id: config._id },
          { $set: { value } },
        );

        return models.WhatsappConfigs.findOne({ _id: config._id });
      }

      return models.WhatsappConfigs.create({ code, value });
    }

    public static async updateConfigs(configsMap: Record<string, unknown>) {
      const codes = Object.keys(configsMap);

      for (const code of codes) {
        if (!code) {
          continue;
        }

        await models.WhatsappConfigs.createOrUpdateConfig({
          code,
          value: configsMap[code],
        });
      }
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
