import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IDonate, IDonateDocument } from '../../@types/donate';
import { donateSchema } from '../definitions/donate';

export interface IDonateModel extends Model<IDonateDocument> {
  getDonate(_id: string): Promise<IDonateDocument>;
  getDonates(): Promise<IDonateDocument[]>;
  createDonate(doc: IDonate): Promise<IDonateDocument>;
  updateDonate(_id: string, doc: IDonate): Promise<IDonateDocument>;
  removeDonate(DonateId: string): Promise<{ ok: number }>;
}

export const loadDonateClass = (models: IModels) => {
  class Donate {
    /**
     * Retrieves donate
     */
    public static async getDonate(_id: string) {
      const Donate = await models.Donate.findOne({ _id }).lean();

      if (!Donate) {
        throw new Error('Donate not found');
      }

      return Donate;
    }

    /**
     * Retrieves all donates
     */
    public static async getDonates(): Promise<IDonateDocument[]> {
      return models.Donate.find().lean();
    }

    /**
     * Create a donate
     */
    public static async createDonate(doc: IDonate): Promise<IDonateDocument> {
      return models.Donate.create(doc);
    }

    /*
     * Update donate
     */
    public static async updateDonate(_id: string, doc: IDonate) {
      return await models.Donate.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove donate
     */
    public static async removeDonate(DonateId: string[]) {
      return models.Donate.deleteOne({ _id: { $in: DonateId } });
    }
  }

  donateSchema.loadClass(Donate);

  return donateSchema;
};
