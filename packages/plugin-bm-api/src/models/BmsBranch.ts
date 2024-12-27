import {
  bmsBranchSchema,
  IBmsBranchDocument,
  IBmsBranch,
} from './definitions/bmsbranch';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IBmsBranchModel extends Model<IBmsBranchDocument> {
  getList(query: any): Promise<IBmsBranchDocument>;
  get(query: any): Promise<IBmsBranchDocument>;
  add(user, doc: IBmsBranch): Promise<IBmsBranchDocument>;
  edit(_id: string, doc: IBmsBranch): Promise<IBmsBranchDocument>;
  remove(_id: string): Promise<IBmsBranchDocument>;
}

export const loadBmsBranchClass = (models: IModels, _subdomain) => {
  class Branch {
    public static async getList(query: any) {
      return models.BmsBranch.find(query).sort({ createdAt: 1 });
    }

    public static async get(query: any) {
      const branch = await models.BmsBranch.findOne(query).lean();

      if (!branch) {
        throw new Error('Bms Branch not found');
      }
      return branch;
    }

    public static generateToken(length: number = 32) {
      const a =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(
          '',
        );
      const b = [] as any;

      for (let i = 0; i < length; i++) {
        const j = (Math.random() * (a.length - 1)).toFixed(0);

        b[i] = a[j];
      }

      return b.join('');
    }

    public static async add(user, doc: IBmsBranch) {
      try {
        return models.BmsBranch.create({
          ...doc,
          userId: user._id,
          createdAt: new Date(),
          token: this.generateToken(),
        });
      } catch (e) {
        throw new Error(
          `Can not create bms branch. Error message: ${e.message}`,
        );
      }
    }

    public static async edit(_id: string, doc: IBmsBranch) {
      await models.BmsBranch.get({ _id });

      await models.BmsBranch.updateOne(
        { _id },
        { $set: { ...doc } },
        { runValidators: true },
      );

      return models.BmsBranch.findOne({ _id }).lean();
    }

    public static async remove(_id: string) {
      return await models.BmsBranch.findByIdAndDelete({ _id });
    }
  }

  bmsBranchSchema.loadClass(Branch);

  return bmsBranchSchema;
};
