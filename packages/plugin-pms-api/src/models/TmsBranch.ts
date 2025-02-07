import {
  tmsBranchSchema,
  ITmsBranchDocument,
  ITmsBranch
} from './definitions/tmsbranch';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ITmsBranchModel extends Model<ITmsBranchDocument> {
  getList(query: any): Promise<ITmsBranchDocument>;
  get(query: any): Promise<ITmsBranchDocument>;
  add(user, doc: ITmsBranch): Promise<ITmsBranchDocument>;
  edit(_id: string, doc: ITmsBranch): Promise<ITmsBranchDocument>;
  remove(_id: string): Promise<ITmsBranchDocument>;
}

export const loadBmsBranchClass = (models: IModels, _subdomain) => {
  class Branch {
    public static async getList(query: any) {
      return models.TmsBranch.find(query).sort({ createdAt: 1 });
    }

    public static async get(query: any) {
      const branch = await models.TmsBranch.findOne(query).lean();

      if (!branch) {
        throw new Error('Bms Branch not found');
      }
      return branch;
    }

    public static generateToken(length: number = 32) {
      const a =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(
          ''
        );
      const b = [] as any;

      for (let i = 0; i < length; i++) {
        const j = (Math.random() * (a.length - 1)).toFixed(0);

        b[i] = a[j];
      }

      return b.join('');
    }

    public static async add(user, doc: ITmsBranch) {
      try {
        return models.TmsBranch.create({
          ...doc,
          userId: user._id,
          createdAt: new Date(),
          token: this.generateToken()
        });
      } catch (e) {
        throw new Error(
          `Can not create bms branch. Error message: ${e.message}`
        );
      }
    }

    public static async edit(_id: string, doc: ITmsBranch) {
      await models.TmsBranch.get({ _id });

      await models.TmsBranch.updateOne(
        { _id },
        { $set: { ...doc } },
        { runValidators: true }
      );

      return models.TmsBranch.findOne({ _id }).lean();
    }

    public static async remove(_id: string) {
      return await models.TmsBranch.findByIdAndDelete({ _id });
    }
  }

  tmsBranchSchema.loadClass(Branch);

  return tmsBranchSchema;
};
