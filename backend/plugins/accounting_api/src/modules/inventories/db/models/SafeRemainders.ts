import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  SAFE_REMAINDER_STATUSES,
} from '../../@types/constants';
import {
  ISafeRemainder,
  ISafeRemainderDocument,
  ISafeRemEditFields,
} from '../../@types/safeRemainders';
import { safeRemainderSchema } from '../definitions/safeRemainders';

export interface ISafeRemainderModel extends Model<ISafeRemainderDocument> {
  getRemainder(_id: string): Promise<ISafeRemainderDocument>;
  createRemainder(
    params: ISafeRemainder,
    userId: string,
  ): Promise<ISafeRemainderDocument>;
  updateRemainder(
    params: ISafeRemEditFields & { _id: string },
    userId: string,
  ): Promise<ISafeRemainderDocument>;
  removeRemainder(_id: string): void;
}

export const loadSafeRemainderClass = (models: IModels, _subdomain: string) => {
  class SafeRemainder {
    /**
     * Get safe remainder
     * @param _id Safe remainder ID
     * @returns Found object
     */
    public static async getRemainder(_id: string) {
      const result: any = await models.SafeRemainders.findOne({ _id }).lean();

      if (!result) throw new Error('Safe remainder not found!');

      return result;
    }

    /**
     * Create safe remainder
     * @param subdomain
     * @param params New data to create
     * @param user Interacted user details
     * @returns Created response
     */
    public static async createRemainder(
      params: ISafeRemainder,
      userId: string,
    ) {
      const {
        branchId,
        departmentId,
        date,
        description,
        productCategoryId,
        attachment,
      } = params;

      // Create new safe remainder
      const safeRemainder: any = await models.SafeRemainders.create({
        date,
        description,
        departmentId,
        branchId,
        productCategoryId,
        attachment,
        status: SAFE_REMAINDER_STATUSES.DRAFT,
        createdAt: new Date(),
        createdBy: userId,
        modifiedAt: new Date(),
        modifiedBy: userId,
      });

      return safeRemainder;
    }

    /**
     * update some fields safe remainder
     * @param allowed fields
     * @returns updated response
     */
    public static async updateRemainder(
      params: ISafeRemEditFields & { _id: string },
      userId: string,
    ) {
      const { _id, description, incomeRule, outRule, saleRule } = params;

      const safeRemainder = await models.SafeRemainders.getRemainder(_id);

      await models.SafeRemainders.updateOne(
        { _id },
        {
          $set: {
            description,
            incomeRule: { ...safeRemainder.incomeRule, ...incomeRule },
            outRule: { ...safeRemainder.outRule, ...outRule },
            saleRule: { ...safeRemainder.saleRule, ...saleRule },
            incomeTrId: params.incomeTrId,
            outTrId: params.outTrId,
            saleTrId: params.saleTrId,
            status: params.status,
            modifiedAt: new Date(),
            modifiedBy: userId,
          },
        },
      );
      return await models.SafeRemainders.getRemainder(_id);
    }

    /**
     * Delete safe remainder
     * @param _id Safe remainder ID
     * @returns Delelted response
     */
    public static async removeRemainder(_id: string) {
      const safeRemainder = await models.SafeRemainders.getRemainder(_id);

      if (safeRemainder.status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
        throw new Error('cant remove: cause submited');
      }

      // Delete safe remainder items by safe remainder id
      await models.SafeRemainderItems.deleteMany({ remainderId: _id });

      return await models.SafeRemainders.deleteOne({ _id });
    }
  }

  safeRemainderSchema.loadClass(SafeRemainder);

  return safeRemainderSchema;
};
