import { IBranchDocument, IBranch } from '@/bms/@types/branch';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { branchSchema } from '@/bms/db/definitions/branch';
import { random } from 'erxes-api-shared/utils';
export interface IBranchModel extends Model<IBranchDocument> {
  getList(query: any): Promise<IBranchDocument[]>;
  get(query: any): Promise<IBranchDocument>;
  add(user, doc: IBranch): Promise<IBranchDocument>;
  edit(_id: string, doc: IBranch): Promise<IBranchDocument>;
  remove(_id: string): Promise<IBranchDocument>;
}

export const loadBranchClass = (models: IModels) => {
  class Branch {
    public static async getList(query: any) {
      return models.Branches.find(query).sort({ createdAt: 1 });
    }

    public static async get(query: any) {
      const branch = await models.Branches.findOne(query).lean();

      if (!branch) {
        throw new Error('Bms Branch not found');
      }
      return branch;
    }

    public static async add(user, doc: IBranch) {
      try {
        return models.Branches.create({
          ...doc,
          userId: user._id,
          createdAt: new Date(),
          token: random('aA0', 32),
        });
      } catch (e) {
        throw new Error(
          `Can not create bms branch. Error message: ${e.message}`,
        );
      }
    }

    public static async edit(_id: string, doc: IBranch) {
      await models.Branches.get({ _id });

      await models.Branches.updateOne(
        { _id },
        { $set: { ...doc } },
        { runValidators: true },
      );

      return models.Branches.findOne({ _id }).lean();
    }

    public static async remove(_id: string) {
      return await models.Branches.findByIdAndDelete(_id);
    }
  }

  branchSchema.loadClass(Branch);

  return branchSchema;
};
