import { Model, model } from 'mongoose';
import { Brands, Forms, Integrations } from '.';
import { IScript, IScriptDocument, scriptSchema } from './definitions/scripts';

export interface IScriptModel extends Model<IScriptDocument> {
  getScript(_id: string): Promise<IScriptDocument>;
  createScript(fields: IScript): Promise<IScriptDocument>;
  updateScript(_id: string, fields: IScript): Promise<IScriptDocument>;
  removeScript(_id: string): void;
}

type LeadMaps = Array<{ formCode?: string; brandCode?: string }>;

export const loadClass = () => {
  class Script {
    /*
     * Get a script
     */
    public static async getScript(_id: string) {
      const script = await Scripts.findOne({ _id });

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
        const messengerIntegration = await Integrations.getIntegration({
          _id: fields.messengerId
        });

        const brand = await Brands.getBrand({
          _id: messengerIntegration.brandId || ''
        });

        autoFields.messengerBrandCode = brand.code;
      }

      // Generate leadCode, brandCode combinations
      if (fields.leadIds) {
        const integrations = await Integrations.findIntegrations({
          _id: { $in: fields.leadIds }
        });

        const maps: LeadMaps = [];

        for (const integration of integrations) {
          const brand = await Brands.getBrand({
            _id: integration.brandId || ''
          });
          const form = await Forms.getForm(integration.formId || '');

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

      return Scripts.create({
        ...fields,
        ...autoFields
      });
    }

    /**
     * Update script
     */
    public static async updateScript(_id: string, fields: IScript) {
      const autoFields = await Script.calculateAutoFields(fields);

      await Scripts.updateOne({ _id }, { $set: { ...fields, ...autoFields } });

      return Scripts.findOne({ _id });
    }

    /**
     * Delete script
     */
    public static async removeScript(_id: string) {
      const scriptObj = await Scripts.findOne({ _id });

      if (!scriptObj) {
        throw new Error(`Script not found with id ${_id}`);
      }

      return scriptObj.remove();
    }
  }

  scriptSchema.loadClass(Script);

  return scriptSchema;
};

loadClass();

// tslint:disable-next-line
const Scripts = model<IScriptDocument, IScriptModel>('scripts', scriptSchema);

export default Scripts;
