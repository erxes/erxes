import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCoreMessage, sendFormsMessage } from '../messageBroker';
import { IScript, IScriptDocument, scriptSchema } from './definitions/scripts';

export interface IScriptModel extends Model<IScriptDocument> {
  getScript(_id: string): Promise<IScriptDocument>;
  createScript(fields: IScript): Promise<IScriptDocument>;
  updateScript(_id: string, fields: IScript): Promise<IScriptDocument>;
  removeScript(_id: string): void;
}

type LeadMaps = Array<{ formCode?: string; brandCode?: string }>;

export const loadClass = (models: IModels, subdomain: string) => {
  class Script {
    /*
     * Get a script
     */
    public static async getScript(_id: string) {
      const script = await models.Scripts.findOne({ _id });

      if (!script) {
        throw new Error('Script not found');
      }

      return script;
    }

    public static async calculateAutoFields(fields: IScript) {
      const autoFields: {
        messengerBrandCode?: string;
        leadMaps?: LeadMaps;
      } = {};

      // generate brandCode
      if (fields.messengerId) {
        const messengerIntegration = await models.Integrations.getIntegration({
          _id: fields.messengerId
        });

        const brand = await sendCoreMessage({
          subdomain,
          action: 'brands.findOne',
          data: {
            query: {
              _id: messengerIntegration.brandId || ''
            }
          },
          isRPC: true
        });

        autoFields.messengerBrandCode = brand.code;
      }

      // Generate leadCode, brandCode combinations
      if (fields.leadIds) {
        const integrations = await models.Integrations.findIntegrations({
          _id: { $in: fields.leadIds }
        });

        const maps: LeadMaps = [];

        for (const integration of integrations) {
          const brand = await sendCoreMessage({
            subdomain,
            action: 'brands.findOne',
            data: {
              query: {
                _id: integration.brandId
              }
            },
            isRPC: true
          });

          const form = await sendFormsMessage({
            subdomain,
            action: 'findOne',
            data: {
              _id: integration.formId
            },
            isRPC: true
          });

          if (!form) {
            throw new Error('Form not found');
          }

          maps.push({
            formCode: form.code,
            brandCode: brand.code
          });
        }

        autoFields.leadMaps = maps;
      }

      return autoFields;
    }

    /**
     * Create script
     */
    public static async createScript(fields: IScript) {
      const autoFields = await Script.calculateAutoFields(fields);

      return models.Scripts.create({
        ...fields,
        ...autoFields
      });
    }

    /**
     * Update script
     */
    public static async updateScript(_id: string, fields: IScript) {
      const autoFields = await Script.calculateAutoFields(fields);

      await models.Scripts.updateOne({ _id }, { $set: { ...fields, ...autoFields } });

      return models.Scripts.findOne({ _id });
    }

    /**
     * Delete script
     */
    public static async removeScript(_id: string) {
      const scriptObj = await models.Scripts.findOne({ _id });

      if (!scriptObj) {
        throw new Error(`Script not found with id ${_id}`);
      }

      return scriptObj.remove();
    }
  }

  scriptSchema.loadClass(Script);

  return scriptSchema;
};
