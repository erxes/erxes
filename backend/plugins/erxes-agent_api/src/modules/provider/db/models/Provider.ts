import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { providerSchema } from '@/provider/db/definitions/provider';
import {
  IMastraProvider,
  IMastraProviderDocument,
} from '@/provider/@types/provider';

export interface IMastraProviderModel extends Model<IMastraProviderDocument> {
  getProvider(_id: string): Promise<IMastraProviderDocument>;
  getProviders(): Promise<IMastraProviderDocument[]>;
  saveProvider(doc: IMastraProvider): Promise<IMastraProviderDocument>;
  removeProvider(_id: string): Promise<{ ok: number }>;
}

export const loadProviderClass = (_models: IModels) => {
  class MastraProvider {
    public static async getProvider(_id: string) {
      const p = await _models.MastraProvider.findOne({ _id });
      if (!p) throw new Error('Provider not found');
      return p;
    }

    public static async getProviders() {
      return _models.MastraProvider.find().sort({ provider: 1 });
    }

    public static async saveProvider(doc: IMastraProvider) {
      // If setting as default, clear other defaults first
      if (doc.isDefault) {
        await _models.MastraProvider.updateMany(
          {},
          { $set: { isDefault: false } },
        );
      }

      const existing = await _models.MastraProvider.findOne({
        provider: doc.provider,
      });
      if (existing) {
        return _models.MastraProvider.findOneAndUpdate(
          { provider: doc.provider },
          { $set: doc },
          { new: true },
        );
      }
      return _models.MastraProvider.create(doc);
    }

    public static async removeProvider(_id: string) {
      return _models.MastraProvider.deleteOne({ _id });
    }
  }

  providerSchema.loadClass(MastraProvider);
  return providerSchema;
};
