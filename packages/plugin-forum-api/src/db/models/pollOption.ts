import { IUserDocument } from '@erxes/api-utils/src/types';
import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { ICpUser } from '../../graphql';
import { IModels } from './index';
import * as _ from 'lodash';
import { LoginRequiredError } from '../../customErrors';
import { UserTypes } from '../../consts';

interface PollOption {
  _id: any;
  postId: string;
  title: string;
  createdByCpId?: string | null;
  createdById?: string | null;
  createdAt: Date;
}

const pollOptionSchema = new Schema<PollOption>({
  postId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  createdByCpId: String,
  createdById: String,
  createdAt: { type: Date, default: () => new Date() }
});

export type PollOptionDocument = PollOption & Document;

const OMIT_FROM_INPUT = [
  '_id',
  'createdByCpId',
  'createdById',
  'createdAt'
] as const;

type CreateInput = Omit<PollOption, typeof OMIT_FROM_INPUT[number]>;

export interface PollOptionModel extends Model<PollOptionDocument> {
  findOwnedByIdOrThrow(
    _id: string,
    cpUser?: ICpUser
  ): Promise<PollOptionDocument>;
  findByIdOrThrow(_id: string): Promise<PollOptionDocument>;

  // <CLient portal>
  createPollOptionCp(
    input: CreateInput,
    cpUser?: ICpUser
  ): Promise<PollOptionDocument>;
  createPollOptionsCp(
    titles: string[],
    postId: string,
    cpUser?: ICpUser
  ): Promise<PollOptionDocument[]>;
  updateTitleCp(
    _id: string,
    title: string,
    cpUser?: ICpUser
  ): Promise<PollOptionDocument>;
  updateTitlesCp(
    input: { _id: string; title: string }[],
    cpUser?: ICpUser
  ): Promise<void>;
  deletePollOptionCp(
    _id: string,
    cpUser?: ICpUser
  ): Promise<PollOptionDocument>;
  deletePollOptionsByPostIdCp(postId: string, cpUser?: ICpUser): Promise<void>;
  // </CLient portal>

  // <CRM>
  createPollOption(
    input: CreateInput,
    user: IUserDocument
  ): Promise<PollOptionDocument>;
  createPollOptions(
    titles: string[],
    postId: string,
    user: IUserDocument
  ): Promise<PollOptionDocument[]>;
  updateTitle(_id: string, title: string): Promise<PollOptionDocument>;
  updateTitles(input: { _id: string; title: string }[]): Promise<void>;
  deletePollOption(_id: string): Promise<PollOptionDocument>;
  deletePollOptionsByPostId(postId: string): Promise<void>;
  // </CRM>

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

    // <CLient portal>
    public static async createPollOptionCp(
      input: CreateInput,
      cpUser?: ICpUser
    ): Promise<PollOptionDocument> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }
      await models.Post.findByIdOrThrowCp(input.postId, cpUser);
      const doc = await models.PollOption.create({
        ...input,
        createdByCpId: cpUser.userId
      });
      return doc;
    }
    public static async createPollOptionsCp(
      titles: string[],
      postId: string,
      cpUser?: ICpUser
    ): Promise<PollOptionDocument[]> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }
      await models.Post.findByIdOrThrowCp(postId, cpUser);
      const docs = await models.PollOption.insertMany(
        titles.map(title => ({
          title,
          postId,
          createdByCpId: cpUser.userId
        }))
      );
      return docs;
    }
    public static async updateTitleCp(
      _id: string,
      title: string,
      cpUser?: ICpUser
    ): Promise<PollOptionDocument> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }
      const doc = await models.PollOption.findOwnedByIdOrThrow(_id, cpUser);
      doc.title = title;
      await doc.save();
      return doc;
    }
    public static async updateTitlesCp(
      input: { _id: string; title: string }[],
      cpUser?: ICpUser
    ): Promise<void> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }

      await models.PollOption.bulkWrite(
        input.map(({ _id, title }) => ({
          updateOne: {
            filter: {
              _id: Types.ObjectId(_id.toString()),
              createdByCpId: cpUser.userId
            },
            update: { $set: { title } }
          }
        }))
      );
    }
    public static async deletePollOptionCp(
      _id: string,
      cpUser?: ICpUser
    ): Promise<PollOptionDocument> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }
      const doc = await models.PollOption.findOwnedByIdOrThrow(_id, cpUser);
      await doc.remove();
      return doc;
    }
    public static async deletePollOptionsByPostIdCp(
      postId: string,
      cpUser?: ICpUser
    ): Promise<void> {
      if (!cpUser) {
        throw new LoginRequiredError();
      }
      await models.Post.findByIdOrThrowCp(postId, cpUser);
      await models.PollOption.deleteMany({ postId });
    }
    // </CLient portal>

    // <CRM>
    public static async createPollOption(
      input: CreateInput,
      user: IUserDocument
    ): Promise<PollOptionDocument> {
      await models.Post.findByIdOrThrow(input.postId);
      const doc = await models.PollOption.create({
        ...input,
        createdBy: user._id
      });
      return doc;
    }
    public static async createPollOptions(
      titles: string[],
      postId: string,
      user: IUserDocument
    ): Promise<PollOptionDocument[]> {
      await models.Post.findByIdOrThrow(postId);
      const docs = await models.PollOption.insertMany(
        titles.map(title => ({
          title,
          postId,
          createdBy: user._id
        }))
      );
      return docs;
    }
    public static async updateTitle(
      _id: string,
      title: string
    ): Promise<PollOptionDocument> {
      const doc = await models.PollOption.findByIdOrThrow(_id);
      doc.title = title;
      await doc.save();
      return doc;
    }
    public static async updateTitles(
      input: { _id: string; title: string }[]
    ): Promise<void> {
      await models.PollOption.bulkWrite(
        input.map(({ _id, title }) => ({
          updateOne: {
            filter: { _id: Types.ObjectId(_id.toString()) },
            update: { $set: { title } }
          }
        }))
      );
    }
    public static async deletePollOption(
      _id: string
    ): Promise<PollOptionDocument> {
      const doc = await models.PollOption.findByIdOrThrow(_id);
      await doc.remove();
      return doc;
    }
    public static async deletePollOptionsByPostId(
      postId: string
    ): Promise<void> {
      await models.Post.findByIdOrThrow(postId);
      await models.PollOption.deleteMany({ postId });
    }
    // </CRM>

    public static async handleChanges(
      postId: string,
      options: { _id?: string; title: string }[],
      userType: UserTypes,
      userId: string
    ): Promise<void> {
      const optionsToInsert: {
        title: string;
        postId: Types.ObjectId;
        createdById?: string;
        createdByCpId?: string;
        createdAt: Date;
      }[] = [];
      const optionsToUpdate: { _id: string; title: string }[] = [];

      for (const option of options) {
        if (option._id) {
          optionsToUpdate.push({
            _id: option._id,
            title: option.title
          });
        } else {
          const optionToInsert = {
            ...option,
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
        _id: { $nin: optionsToUpdate.map(({ _id }) => Types.ObjectId(_id)) }
      }).lean();

      await models.PollOption.insertMany(optionsToInsert);
      await models.PollOption.bulkWrite(
        optionsToUpdate.map(({ _id, title }) => ({
          updateOne: {
            filter: { _id: Types.ObjectId(_id.toString()) },
            update: { $set: { title } }
          }
        }))
      );
      await models.PollOption.deleteMany({
        _id: { $in: optionsToDelete.map(({ _id }) => _id) }
      });
    }
  }

  pollOptionSchema.loadClass(PollOptionStatics);

  models.PollOption = con.model<PollOptionDocument, PollOptionModel>(
    'forum_poll_options',
    pollOptionSchema
  );
};
