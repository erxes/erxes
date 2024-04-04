import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { ICpUser } from '../../graphql';
import { IModels } from './index';
import * as _ from 'lodash';
import { LoginRequiredError } from '../../customErrors';
import { UserTypes } from '../../consts';

export interface PollOption {
  _id: any;
  postId: string;
  title: string;
  createdByCpId?: string | null;
  createdById?: string | null;
  createdAt: Date;
  order: number;
}

const pollOptionSchema = new Schema<PollOption>({
  postId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  createdByCpId: String,
  createdById: String,
  createdAt: { type: Date, default: () => new Date() },
  order: { type: Number, default: 0, required: true }
});

export type PollOptionDocument = PollOption & Document;

export interface PollOptionModel extends Model<PollOptionDocument> {
  findOwnedByIdOrThrow(
    _id: string,
    cpUser?: ICpUser
  ): Promise<PollOptionDocument>;
  findByIdOrThrow(_id: string): Promise<PollOptionDocument>;

  handleChanges(
    postId: string,
    options: { _id?: string; title: string }[],
    userType: UserTypes,
    userId: string
  ): Promise<void>;
}

export const generatePollOptionModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class PollOptionStatics {
    public static async findOwnedByIdOrThrow(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PollOptionDocument> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }
      const doc = await models.PollOption.findByIdOrThrow(_id);
      if (doc.createdByCpId !== cpUser.userId) {
        throw new Error('Unauthorized');
      }
      return doc;
    }
    public static async findByIdOrThrow(
      _id: string
    ): Promise<PollOptionDocument> {
      const doc = await models.PollOption.findById(_id);
      if (!doc) {
        throw new Error(`Poll option with id ${_id} not found`);
      }
      return doc;
    }

    public static async handleChanges(
      postId: string,
      options: { _id?: string; title: string; order?: number }[],
      userType: UserTypes,
      userId: string
    ): Promise<void> {
      const optionsToInsert: {
        title: string;
        postId: Types.ObjectId;
        createdById?: string;
        createdByCpId?: string;
        createdAt: Date;
        order?: number;
      }[] = [];
      const patches: { _id: string; title: string; order?: number }[] = [];

      for (const option of options) {
        const { _id, title, order } = option;
        if (_id) {
          patches.push({
            _id,
            title,
            order
          });
        } else {
          const optionToInsert = {
            title,
            order,
            postId: Types.ObjectId(postId.toString()),
            createdAt: new Date()
          };
          optionToInsert[
            userType === 'CRM' ? 'createdBy' : 'createdByCpId'
          ] = userId;
          optionsToInsert.push(optionToInsert);
        }
      }

      const optionsToDelete = await models.PollOption.find({
        postId,
        _id: {
          $nin: patches.map(({ _id }) => _id)
        }
      }).lean();

      if (optionsToInsert.length) {
        await models.PollOption.insertMany(optionsToInsert);
      }
      if (patches.length) {
        await models.PollOption.bulkWrite(
          patches.map(({ _id, title, order }) => ({
            updateOne: {
              filter: { _id },
              update: { $set: { title, order } }
            }
          }))
        );
      }

      const idsToDelete = optionsToDelete.map(({ _id }) => _id);

      await models.PollVote.deleteMany({
        pollOptionId: { $in: idsToDelete }
      });
      await models.PollOption.deleteMany({
        _id: { $in: idsToDelete }
      });
    }
  }

  pollOptionSchema.loadClass(PollOptionStatics);

  models.PollOption = con.model<PollOptionDocument, PollOptionModel>(
    'forum_poll_options',
    pollOptionSchema
  );
};
