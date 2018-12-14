import { Model, model } from 'mongoose';
import { Brands, Forms, Integrations } from '.';
import { IScript, IScriptDocument, scriptSchema } from './definitions/scripts';

interface IScriptModel extends Model<IScriptDocument> {
  createScript(fields: IScript): Promise<IScriptDocument>;
  updateScript(_id: string, fields: IScript): Promise<IScriptDocument>;
  removeScript(_id: string): void;
}

type LeadMaps = Array<{ formCode?: string; brandCode?: string }>;

class Script {
  public static async calculateAutoFields(fields: IScript) {
    const autoFields: { messengerBrandCode?: string; leadMaps?: LeadMaps } = {};

    // generate brandCode
    if (fields.messengerId) {
      const messengerIntegration = await Integrations.findOne({ _id: fields.messengerId });

      if (messengerIntegration) {
        const brand = await Brands.findOne({ _id: messengerIntegration.brandId });

        if (brand) {
          autoFields.messengerBrandCode = brand.code;
        }
      }
    }

    // Generate formCode, brandCode combinations
    if (fields.leadIds) {
      const integrations = await Integrations.find({ _id: { $in: fields.leadIds } });

      const maps: LeadMaps = [];

      if (integrations) {
        for (const integration of integrations) {
          const brand = await Brands.findOne({ _id: integration.brandId });
          const form = await Forms.findOne({ _id: integration.formId });

          if (brand && form) {
            maps.push({
              formCode: form.code,
              brandCode: brand.code,
            });
          }
        }

        autoFields.leadMaps = maps;
      }
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
      ...autoFields,
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

// tslint:disable-next-line
const Scripts = model<IScriptDocument, IScriptModel>('scripts', scriptSchema);

export default Scripts;
