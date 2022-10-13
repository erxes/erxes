import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels, models } from '../connectionResolver';
import {
  ITemplate,
  ITemplateDocument,
  IType,
  ITypeDocument,
  templateSchema,
  typeSchema
} from './definitions/template';

export interface ITemplateModel extends Model<ITemplateDocument> {
  getTemplate(_id: string): Promise<ITemplateDocument>;
  createTemplate(doc: ITemplate): Promise<ITemplateDocument>;
  updateTemplate(_id: string, doc: ITemplate): Promise<ITemplateDocument>;
  removeTemplate(_id: string): void;
}

export interface ITypeModel extends Model<ITypeDocument> {
  getType(_id: String): Promise<ITypeDocument>;
  createType(doc: IType): Promise<ITypeDocument>;
  updateType(_id: string, doc: IType): Promise<ITypeDocument>;
  removeType(_id: String): void;
}

export const loadTypeClass = (models: IModels) => {
  class Type {
    public static async getType(_id: string) {
      const type = await models.Types.findOne({ _id });

      if (!type) {
        throw new Error('Type not found');
      }

      return type;
    }
    // create type
    public static async createType(doc: IType) {
      return models.Types.create({ ...doc });
    }
    // remove type
    public static async removeType(_id: string) {
      const type = await models?.Types.getType(_id);
      return models.Types.deleteOne({ _id });
    }

    public static async updateType(_id: string, doc: IType) {
      await models.Types.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
  }

  typeSchema.loadClass(Type);
  return typeSchema;
};

export const loadTemplateClass = models => {
  class Template {
    public static async getTemplate(_id: string) {
      const {name} = await models.Templates.findOne({ _id });

      if (!{name}) {
        throw new Error('{Name} not found');
      }

      return {name};
    }

    // create
    public static async createTemplate(doc: ITemplate) {
      return models.Templates.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateTemplate(_id: string, doc: ITemplate) {
      await models.Templates.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeTemplate(_id: string) {
      const {name} = await models.Templates.getTemplate(_id);

      return models.Templates.deleteOne({ _id });
    }
  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
