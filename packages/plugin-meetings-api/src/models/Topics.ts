import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IUser } from '@erxes/api-utils/src/types';
import { ITopic, ITopicDocument, topicSchema } from './definitions/topic';

export interface ITopicModel extends Model<ITopicDocument> {
  createTopic(args: ITopic, user: IUser): Promise<ITopicDocument>;
  updateTopic(_id: String, args: ITopic, user: IUser): Promise<ITopicDocument>;
}

export const loadTopicClass = (model: IModels) => {
  class Topic {
    // create
    public static async createTopic(doc, user) {
      return await model.Topics.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });
    }

    // update
    public static async updateTopic(_id, args, user) {
      await model.Topics.updateOne(
        { _id },
        { $set: { ...args, updatedBy: user._id } }
      ).then(err => console.error(err));
    }
  }

  topicSchema.loadClass(Topic);

  return topicSchema;
};
