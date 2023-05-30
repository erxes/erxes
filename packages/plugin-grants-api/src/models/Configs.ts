import { IModels } from '../connectionResolver';
import {
  IGrantConfigs,
  IGrantConfigsDocument,
  grantConfigsSchema
} from './definitions/grant';
import { Model } from 'mongoose';

export interface IConfigsModel extends Model<IGrantConfigsDocument> {
  addConfig(doc: IGrantConfigs): Promise<IGrantConfigsDocument>;
  editConfig(_id: string, doc: IGrantConfigs): Promise<IGrantConfigsDocument>;
  removeConfig(_id: string): Promise<IGrantConfigsDocument>;
}

const validateConfig = (doc: IGrantConfigs) => {
  if (!doc?.name) {
    throw new Error('Please provide a name');
  }
  if (!doc?.action) {
    throw new Error('Please select an action');
  }
  if (!doc?.params) {
    throw new Error('Please provide a required params');
  }
};

export const loadConfigsClass = (models: IModels, subdomain: string) => {
  class Configs {
    public static async addConfig(doc: IGrantConfigs) {
      try {
        validateConfig(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      return await models.Configs.create(doc);
    }

    public static async editConfig(_id: string, doc: IGrantConfigs) {
      if (!_id) {
        throw new Error('Please provide a id');
      }

      try {
        validateConfig(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      return await models.Configs.updateOne(
        { _id },
        { ...doc, modifiedAt: new Date() }
      );
    }
    public static async removeConfig(_id: string) {
      if (!_id) {
        throw new Error('Please provide a id');
      }
      return await models.Configs.deleteOne({ _id });
    }
  }

  grantConfigsSchema.loadClass(Configs);
  return grantConfigsSchema;
};
