import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IBranch, IBranchDocument } from '../../@types';
import { branchSchema } from '../definitions/branches';

export interface IBranchModel extends Model<IBranchDocument> {
  getBranch(_id: string): Promise<IBranchDocument>;
  createBranch(doc: IBranch): Promise<IBranchDocument>;
  updateBranch(_id: string, doc: IBranch): Promise<IBranchDocument>;
  removeBranches(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadBranchClass = (models: IModels, subdomain: string) => {
  class Branch {
    public static async getBranch(_id: string) {
      const branch = await models.Branches.findOne({ _id });
      if (!branch) throw new Error('Branch not found');
      return branch;
    }

    public static async createBranch(doc: IBranch) {
      return models.Branches.create(doc);
    }

    public static async updateBranch(_id: string, doc: IBranch) {
      await models.Branches.updateOne({ _id }, { $set: doc });
      return models.Branches.getBranch(_id);
    }

    public static async removeBranches(_ids: string[]) {
      return models.Branches.deleteMany({ _id: { $in: _ids } });
    }
  }

  branchSchema.loadClass(Branch);
  return branchSchema;
};
