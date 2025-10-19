import { IVoucher, IVoucherDocument } from '@/voucher/@types/voucher';
import { voucherSchema } from '@/voucher/db/definitions/voucher';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IVoucherModel extends Model<IVoucherDocument> {
  getVoucher(_id: string): Promise<IVoucherDocument>;
  getVouchers(): Promise<IVoucherDocument[]>;
  createVoucher(doc: IVoucher): Promise<IVoucherDocument>;
  updateVoucher(_id: string, doc: IVoucher): Promise<IVoucherDocument>;
  removeVoucher(voucherId: string): Promise<{  ok: number }>;
}

export const loadVoucherClass = (models: IModels) => {
  class Voucher {
    /**
     * Retrieves voucher
     */
    public static async getVoucher(_id: string) {
      const voucher = await models.Voucher.findOne({ _id }).lean();

      if (!voucher) {
        throw new Error('voucher not found');
      }

      return voucher;
    }

    /**
     * Retrieves all vouchers
     */
    public static async getVouchers(): Promise<IVoucherDocument[]> {
      return models.Voucher.find().lean();
    }

    /**
     * Create a voucher
     */
    public static async createVoucher(doc: IVoucher): Promise<IVoucherDocument> {
      return models.Voucher.create(doc);
    }

    /*
     * Update voucher
     */
    public static async updateVoucher(_id: string, doc: IVoucher) {
      return await models.Voucher.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove voucher
     */
    public static async removeVoucher(voucherId: string[]) {
      return models.Voucher.deleteOne({ _id: { $in: voucherId } });
    }
  }

  voucherSchema.loadClass(Voucher);

  return voucherSchema;
};
