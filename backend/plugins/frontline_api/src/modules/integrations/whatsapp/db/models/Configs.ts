import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IWhatsappConfigDocument } from '@/integrations/whatsapp/@types/configs';
import { whatsappConfigSchema } from '@/integrations/whatsapp/db/definitions/configs';

export interface IWhatsappConfigModel extends Model<IWhatsappConfigDocument> {
  getConfigsMap(): Promise<Record<string, string>>;
  updateConfigs(configsMap: Record<string, string>): Promise<void>;
}

/** Binds tenant WhatsApp app settings to the tenant collection. */
export const loadWhatsappConfigClass = (models: IModels) => {
  class WhatsappConfig {
    /** Returns every stored code with its value. */
    public static async getConfigsMap(): Promise<Record<string, string>> {
      const configs = await models.WhatsappConfigs.find({}).lean();

      return Object.fromEntries(
        configs.map(({ code, value }) => [code, value || '']),
      );
    }

    /** Upserts each given code; untouched codes keep their value. */
    public static async updateConfigs(
      configsMap: Record<string, string>,
    ): Promise<void> {
      await Promise.all(
        Object.entries(configsMap).map(([code, value]) =>
          models.WhatsappConfigs.updateOne(
            { code },
            { $set: { value } },
            { upsert: true },
          ),
        ),
      );
    }
  }

  whatsappConfigSchema.loadClass(WhatsappConfig);

  return whatsappConfigSchema;
};
