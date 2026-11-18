import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { AccountingStatus, IStorageMovementDocument } from '@/storage/@types/storage';
import { movementSchema } from '@/storage/db/definitions/movements';

export interface IMovementModel extends Model<IStorageMovementDocument> {
  setAccountingResult(
    _id: string,
    result: { status: AccountingStatus; message?: string; trId?: string },
  ): Promise<void>;
}

export const loadMovementClass = (_models: IModels, _subdomain: string) => {
  class Movement {
    /** Stores what accounting answered for this movement. */
    public static async setAccountingResult(
      this: IMovementModel,
      _id: string,
      { status, message, trId }: { status: AccountingStatus; message?: string; trId?: string },
    ) {
      await this.updateOne(
        { _id },
        {
          $set: {
            accountingStatus: status,
            accountingResponse: (message || '').slice(0, 1000),
            ...(trId ? { accountingTrId: trId } : {}),
          },
        },
      );
    }
  }

  movementSchema.loadClass(Movement);
  return movementSchema;
};
