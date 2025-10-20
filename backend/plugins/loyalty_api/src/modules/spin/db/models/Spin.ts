import { ISpin, ISpinDocument } from '@/spin/@types/spin';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { spinSchema } from '../definitions/spin';

export interface ISpinModel extends Model<ISpinDocument> {
  getSpin(_id: string): Promise<ISpinDocument>;
  getSpins(): Promise<ISpinDocument[]>;
  createSpin(doc: ISpin): Promise<ISpinDocument>;
  updateSpin(_id: string, doc: ISpin): Promise<ISpinDocument>;
  removeSpin(SpinId: string): Promise<{ ok: number }>;
}

export const loadSpinClass = (models: IModels) => {
  class Spin {
    /**
     * Retrieves spin
     */
    public static async getSpin(_id: string) {
      const Spin = await models.Spin.findOne({ _id }).lean();

      if (!Spin) {
        throw new Error('Spin not found');
      }

      return Spin;
    }

    /**
     * Retrieves all spins
     */
    public static async getSpins(): Promise<ISpinDocument[]> {
      return models.Spin.find().lean();
    }

    /**
     * Create a spin
     */
    public static async createSpin(doc: ISpin): Promise<ISpinDocument> {
      return models.Spin.create(doc);
    }

    /*
     * Update spin
     */
    public static async updateSpin(_id: string, doc: ISpin) {
      return await models.Spin.findOneAndUpdate({ _id }, { $set: { ...doc } });
    }

    /**
     * Remove spin
     */
    public static async removeSpin(SpinId: string[]) {
      return models.Spin.deleteOne({ _id: { $in: SpinId } });
    }
  }

  spinSchema.loadClass(Spin);

  return spinSchema;
};
