import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { insuranceSchema } from '@/insurance/db/definitions/insurance';
import { IInsurance, IInsuranceDocument } from '@/insurance/@types/insurance';

export interface IInsuranceModel extends Model<IInsuranceDocument> {
  getInsurance(_id: string): Promise<IInsuranceDocument>;
  getInsurances(): Promise<IInsuranceDocument[]>;
  createInsurance(doc: IInsurance): Promise<IInsuranceDocument>;
  updateInsurance(_id: string, doc: IInsurance): Promise<IInsuranceDocument>;
  removeInsurance(InsuranceId: string): Promise<{  ok: number }>;
}

export const loadInsuranceClass = (models: IModels) => {
  class Insurance {
    /**
     * Retrieves insurance
     */
    public static async getInsurance(_id: string) {
      const Insurance = await models.Insurance.findOne({ _id }).lean();

      if (!Insurance) {
        throw new Error('Insurance not found');
      }

      return Insurance;
    }

    /**
     * Retrieves all insurances
     */
    public static async getInsurances(): Promise<IInsuranceDocument[]> {
      return models.Insurance.find().lean();
    }

    /**
     * Create a insurance
     */
    public static async createInsurance(doc: IInsurance): Promise<IInsuranceDocument> {
      return models.Insurance.create(doc);
    }

    /*
     * Update insurance
     */
    public static async updateInsurance(_id: string, doc: IInsurance) {
      return await models.Insurance.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove insurance
     */
    public static async removeInsurance(InsuranceId: string[]) {
      return models.Insurance.deleteOne({ _id: { $in: InsuranceId } });
    }
  }

  insuranceSchema.loadClass(Insurance);

  return insuranceSchema;
};
