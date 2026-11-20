import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IPapaConfig, IPapaConfigDocument } from '../../@types/papaConfigs';
import { papaConfigSchema } from '../definitions/papaConfigs';

export interface IPapaConfigModel extends Model<IPapaConfigDocument> {
  getConfig(): Promise<IPapaConfigDocument | null>;
  getConfigOrThrow(): Promise<IPapaConfigDocument>;
  saveCredentials(
    doc: Pick<IPapaConfig, 'apiUrl' | 'clientId'> & { clientSecret?: string },
    userId?: string,
  ): Promise<IPapaConfigDocument>;
  setStaffAndCallback(doc: {
    staffId?: string;
    callbackUrl?: string;
  }): Promise<void>;
}

export const loadPapaConfigClass = (models: IModels) => {
  class PapaConfig {
    public static async getConfig() {
      return models.PapaConfigs.findOne({}).lean();
    }

    public static async getConfigOrThrow() {
      const config = await models.PapaConfigs.findOne({}).lean();

      if (!config?.clientId || !config.clientSecret) {
        throw new Error('Papa delivery is not configured');
      }

      return config;
    }

    public static async saveCredentials(
      doc: Pick<IPapaConfig, 'apiUrl' | 'clientId'> & {
        clientSecret?: string;
      },
      userId?: string,
    ) {
      const current = await models.PapaConfigs.findOne({}).lean();
      const clientSecret = doc.clientSecret || current?.clientSecret;

      if (!clientSecret) {
        throw new Error('Papa client secret is required');
      }

      const update: Partial<IPapaConfig> = {
        apiUrl: doc.apiUrl,
        clientId: doc.clientId,
        clientSecret,
        callbackSecret:
          current?.callbackSecret || randomBytes(24).toString('hex'),
        updatedAt: new Date(),
        updatedBy: userId,
      };

      if (current) {
        await models.PapaConfigs.updateOne(
          { _id: current._id },
          { $set: update },
        );
      } else {
        await models.PapaConfigs.create(update);
      }

      return models.PapaConfigs.getConfigOrThrow();
    }

    /** Records the token's staff id, and the callback URL when Papa accepted it. */
    public static async setStaffAndCallback(doc: {
      staffId?: string;
      callbackUrl?: string;
    }) {
      await models.PapaConfigs.updateOne(
        {},
        doc.callbackUrl
          ? {
              $set: {
                staffId: doc.staffId,
                callbackUrl: doc.callbackUrl,
                callbackRegisteredAt: new Date(),
              },
            }
          : {
              $set: { staffId: doc.staffId },
              $unset: { callbackUrl: '', callbackRegisteredAt: '' },
            },
      );
    }
  }

  papaConfigSchema.loadClass(PapaConfig);
  return papaConfigSchema;
};
