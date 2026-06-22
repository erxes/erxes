import { IPmsBranch, IPmsBranchDocument } from '@/pms/@types/branch';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { branchSchema } from '@/pms/db/definitions/branch';
import * as crypto from 'node:crypto';

export interface IPMSBranchModel extends Model<IPmsBranchDocument> {
  getList(query: any): Promise<IPmsBranchDocument[]>;
  get(query: any): Promise<IPmsBranchDocument>;
  add(user, doc: IPmsBranch): Promise<IPmsBranchDocument>;
  edit(_id: string, doc: IPmsBranch): Promise<IPmsBranchDocument>;
  remove(_id: string): Promise<IPmsBranchDocument>;
}

export const loadPmsBranchClass = (models: IModels) => {
  class Branch {
    private static normalizeAppointmentConfig(
      doc: IPmsBranch,
      currentBranch?: IPmsBranchDocument,
    ) {
      const hasAppointment =
        doc.hasAppointment ?? currentBranch?.hasAppointment ?? false;

      doc.hasAppointment = hasAppointment;
    }

    public static async getList(query: any) {
      return models.PmsBranch.find(query).sort({ createdAt: 1 });
    }

    public static async get(query: any) {
      const branch = await models.PmsBranch.findOne(query).lean();

      if (!branch) {
        throw new Error('Pms Branch not found');
      }
      return branch;
    }

    public static async generateToken(length: number = 16): Promise<string> {
      const buffer = await crypto.randomBytes(length);
      const token = buffer.toString('hex');
      return token;
    }

    public static async add(user, doc: IPmsBranchDocument) {
      try {
        this.normalizeAppointmentConfig(doc);

        return models.PmsBranch.create({
          ...doc,
          userId: user._id,
          createdAt: new Date(),
          token: await this.generateToken(),
        });
      } catch (e) {
        throw new Error(
          `Can not create bms branch. Error message: ${e.message}`,
        );
      }
    }

    public static async edit(_id: string, doc: IPmsBranch) {
      const branch = await models.PmsBranch.get({ _id });
      this.normalizeAppointmentConfig(doc, branch);

      await models.PmsBranch.updateOne(
        { _id },
        { $set: { ...doc } },
        { runValidators: true },
      );

      return models.PmsBranch.findOne({ _id }).lean();
    }

    public static async remove(_id: string) {
      return await models.PmsBranch.findByIdAndDelete(_id);
    }
  }

  branchSchema.loadClass(Branch);

  return branchSchema;
};
