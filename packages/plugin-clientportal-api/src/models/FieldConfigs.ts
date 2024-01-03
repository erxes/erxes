import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  fieldConfigSchema,
  IFieldConfig,
  IFieldConfigDocument
} from './definitions/fieldConfigs';

export interface IFieldConfigModel extends Model<IFieldConfigDocument> {
  getConfig(fieldId: string): Promise<IFieldConfigDocument>;
  createConfig(doc: IFieldConfig): Promise<IFieldConfigDocument>;
  createOrUpdate(doc: IFieldConfig): Promise<IFieldConfigDocument>;
  updateConfig(doc: IFieldConfig): Promise<IFieldConfigDocument>;
  deleteConfig(_id: string): void;
}

export const loadFieldConfigClass = (models: IModels) => {
  class FieldConfig {
    public static async getConfig(fieldId: string) {
      const comment = await models.FieldConfigs.findOne({ fieldId });

      if (!comment) {
        throw new Error('FieldConfig not found');
      }

      return comment;
    }

    public static async createConfig(doc: IFieldConfigDocument) {
      return models.FieldConfigs.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateConfig(doc: IFieldConfigDocument) {
      return models.FieldConfigs.create({
        ...doc
      });
    }

    public static async deleteConfig(_id: string) {
      return models.FieldConfigs.deleteOne({ _id });
    }

    public static async createOrUpdate(doc: IFieldConfigDocument) {
      const config = await models.FieldConfigs.findOne({
        fieldId: doc.fieldId
      });

      if (config) {
        await models.FieldConfigs.updateOne(
          { fieldId: doc.fieldId },
          { $set: doc }
        );

        return models.FieldConfigs.findOne({ fieldId: doc.fieldId });
      }

      return models.FieldConfigs.create(doc);
    }
  }

  fieldConfigSchema.loadClass(FieldConfig);

  return fieldConfigSchema;
};
