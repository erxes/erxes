import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';
import {
  IPinnedUserDocument,
  pinnedUserSchema
} from './definitions/pinnerUser';
import { checkLogin } from '@erxes/api-utils/src';

export interface IPinnedUserModel extends Model<IPinnedUserDocument> {
  createPinnedUser(
    pinnedUserIds: String[],
    user: IUser
  ): Promise<IPinnedUserDocument>;
  updatePinnedUser(
    pinnedUserIds: String[],
    user: IUser
  ): Promise<IPinnedUserDocument>;
}

export const loadPinnedUserClass = (model: IModels) => {
  class PinnedUser {
    // create
    public static async createPinnedUser(pinnedUserIds, user) {
      return await model.PinnedUsers.create({
        pinnedUserIds,
        userId: user._id
      });
    }

    // update
    public static async updatePinnedUser(pinnedUserIds, user) {
      return await model.PinnedUsers.updateOne(
        { userId: user._id },
        { $set: { pinnedUserIds } }
      ).then(err => console.error(err));
    }
  }

  pinnedUserSchema.loadClass(PinnedUser);

  return pinnedUserSchema;
};
