import { ICoupon, ICouponDocument } from '@/coupon/@types/coupon';
import { couponSchema } from '@/coupon/db/definitions/coupon';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ICouponModel extends Model<ICouponDocument> {
  getCoupon(_id: string): Promise<ICouponDocument>;
  getCoupons(): Promise<ICouponDocument[]>;
  createCoupon(doc: ICoupon): Promise<ICouponDocument>;
  updateCoupon(_id: string, doc: ICoupon): Promise<ICouponDocument>;
  removeCoupon(couponId: string): Promise<{  ok: number }>;
}

export const loadCouponClass = (models: IModels) => {
  class Coupon {
    /**
     * Retrieves coupon
     */
    public static async getCoupon(_id: string) {
      const coupon = await models.Coupon.findOne({ _id }).lean();

      if (!coupon) {
        throw new Error('coupon not found');
      }

      return coupon;
    }

    /**
     * Retrieves all coupons
     */
    public static async getCoupons(): Promise<ICouponDocument[]> {
      return models.Coupon.find().lean();
    }

    /**
     * Create a coupon
     */
    public static async createCoupon(doc: ICoupon): Promise<ICouponDocument> {
      return models.Coupon.create(doc);
    }

    /*
     * Update coupon
     */
    public static async updateCoupon(_id: string, doc: ICoupon) {
      return await models.Coupon.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove coupon
     */
    public static async removeCoupon(couponId: string[]) {
      return models.Coupon.deleteOne({ _id: { $in: couponId } });
    }
  }

  couponSchema.loadClass(Coupon);

  return couponSchema;
};
