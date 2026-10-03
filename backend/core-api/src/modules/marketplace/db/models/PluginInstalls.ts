import { Model, Document } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { pluginInstallSchema } from '../definitions/pluginInstalls';

export interface IPluginInstall {
  name: string;
  version?: string;
  description?: string;
  icon?: string;
  source: 'catalog' | 'github';
  repoUrl?: string;
  api?: {
    image?: string;
    address?: string;
    port?: number;
    health?: string;
    env?: string[];
    hasSubscriptions?: boolean;
  };
  ui?: {
    remote: string;
    entry: string;
    exposes?: string[];
  };
  enabled?: boolean;
}

export interface IPluginInstallDocument extends IPluginInstall, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPluginInstallModel extends Model<IPluginInstallDocument> {
  getInstall(_id: string): Promise<IPluginInstallDocument>;
  install(doc: IPluginInstall): Promise<IPluginInstallDocument>;
  setEnabled(
    _id: string,
    enabled: boolean,
  ): Promise<IPluginInstallDocument>;
  uninstall(_id: string): Promise<void>;
}

export const loadPluginInstallClass = (models: IModels) => {
  class PluginInstall {
    public static async getInstall(_id: string) {
      const install = await models.PluginInstalls.findOne({ _id }).lean();

      if (!install) {
        throw new Error('Plugin install not found');
      }

      return install;
    }

    public static async install(doc: IPluginInstall) {
      return await models.PluginInstalls.findOneAndUpdate(
        { name: doc.name },
        { $set: { ...doc, enabled: doc.enabled ?? true } },
        { new: true, upsert: true },
      );
    }

    public static async setEnabled(_id: string, enabled: boolean) {
      return await models.PluginInstalls.findOneAndUpdate(
        { _id },
        { $set: { enabled } },
        { new: true },
      );
    }

    public static async uninstall(_id: string) {
      const result = await models.PluginInstalls.deleteOne({ _id });

      if (!result.deletedCount) {
        throw new Error(`Plugin install not found with id ${_id}`);
      }
    }
  }

  pluginInstallSchema.loadClass(PluginInstall);
  return pluginInstallSchema;
};
