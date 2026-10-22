import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IWhatsappConnectionView,
  IWhatsappIntegrationDocument,
} from '@/integrations/whatsapp/@types/integrations';
import { whatsappIntegrationSchema } from '@/integrations/whatsapp/db/definitions/integrations';

export interface IWhatsappIntegrationModel
  extends Model<IWhatsappIntegrationDocument> {
  getConnection(_id: string): Promise<IWhatsappIntegrationDocument>;
  getByIntegrationId(
    integrationId: string,
  ): Promise<IWhatsappIntegrationDocument>;
  markHealth(_id: string, error?: string): Promise<void>;
  toView(connection: IWhatsappIntegrationDocument): IWhatsappConnectionView;
}

/** Binds connection lookups to the tenant collection; tokens are selected explicitly. */
export const loadWhatsappIntegrationClass = (models: IModels) => {
  class WhatsappIntegration {
    /** Loads a connection with its access token for Graph API calls. */
    public static async getConnection(
      _id: string,
    ): Promise<IWhatsappIntegrationDocument> {
      const connection = await models.WhatsappIntegrations.findOne({
        _id,
      }).select('+accessToken');

      if (!connection) {
        throw new Error('WhatsApp connection not found. Connect again.');
      }

      return connection;
    }

    /** Loads the connection attached to an inbox integration, with its token. */
    public static async getByIntegrationId(
      integrationId: string,
    ): Promise<IWhatsappIntegrationDocument> {
      const connection = await models.WhatsappIntegrations.findOne({
        erxesApiId: integrationId,
      }).select('+accessToken');

      if (!connection) {
        throw new Error('WhatsApp integration not found');
      }

      return connection;
    }

    /** Records whether the last provider call succeeded; an error marks it unhealthy. */
    public static async markHealth(_id: string, error?: string): Promise<void> {
      await models.WhatsappIntegrations.updateOne(
        { _id },
        error
          ? { $set: { healthStatus: 'unhealthy', error } }
          : { $set: { healthStatus: 'healthy' }, $unset: { error: '' } },
      );
    }

    /** Public shape without the access token. */
    public static toView(
      connection: IWhatsappIntegrationDocument,
    ): IWhatsappConnectionView {
      return {
        _id: connection._id,
        erxesApiId: connection.erxesApiId,
        wabaId: connection.wabaId,
        phoneNumberId: connection.phoneNumberId,
        displayPhoneNumber: connection.displayPhoneNumber,
        verifiedName: connection.verifiedName,
        phoneStatus: connection.phoneStatus,
        needsRegistration: connection.phoneStatus !== 'CONNECTED',
        healthStatus: connection.healthStatus,
        error: connection.error,
      };
    }
  }

  whatsappIntegrationSchema.loadClass(WhatsappIntegration);

  return whatsappIntegrationSchema;
};
