import { debugError } from '@erxes/api-utils/src/debuggers';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';

import { ISalary, ISalaryDocument, salarySchema } from './definitions/salary';

export interface ISalaryModel extends Model<ISalaryDocument> {
  getSalary(doc: any): ISalaryDocument;
  createSalary(doc: ISalary): Promise<ISalaryDocument>;
  updateSalary(_id: string, doc: any): Promise<ISalaryDocument>;
  removeSalary(_id: string): Promise<string>;
}

export const loadSalaryClass = (models: IModels) => {
  class Salaries {
    public static async getSalary(doc: any) {
      const invoice = await models.Salaries.findOne(doc);

      if (!invoice) {
        throw new Error('Salary not found');
      }

      return invoice;
    }

    public static async createSalary(doc: ISalary) {
      try {
        const invoice = await models.Salaries.create(doc);

        return invoice;
      } catch (e) {
        debugError(e.message);
        throw e;
      }
    }

    public static async updateSalary(_id: string, doc: ISalary) {
      await models.Salaries.updateOne({ _id }, { $set: { ...doc } });

      return Salaries.getSalary({ _id });
    }

    public static async removeSalary(_id: string) {
      await models.Salaries.deleteOne({ _id });

      return 'removed';
    }
  }
  salarySchema.loadClass(Salaries);
  return salarySchema;
};
