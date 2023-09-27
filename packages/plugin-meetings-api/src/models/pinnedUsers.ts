import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';
import {
  IPinnedUserDocument,
  pinnedUserSchema
} from './definitions/pinnerUser';
import { checkLogin } from '@erxes/api-utils/src';

export interface IPinnedUserModel extends Model<IPinnedUserDocument> {
  updatePinnedUser(
    pinnedUserIds: String[],
    user: IUser
  ): Promise<IPinnedUserDocument>;
}

export const loadPinnedUserClass = (model: IModels) => {
  class PinnedUser {
    // update
    public static async updatePinnedUser(pinnedUserIds, user) {
      const pinnedUsers = await model.PinnedUsers.findOne({ userId: user._id });

      if (pinnedUsers) {
        return await model.PinnedUsers.updateOne(
          { userId: user._id },
          { $set: { pinnedUserIds } }
        ).then(err => console.error(err));
      }
      return await model.PinnedUsers.create({
        pinnedUserIds,
        userId: user._id
      });
    }
  }

  pinnedUserSchema.loadClass(PinnedUser);

  return pinnedUserSchema;
};
