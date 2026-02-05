import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITopic, ITopicDocument } from "../../@types/topic";
import { topicSchema } from "../definitions/topic";


export interface ITopicModel extends Model<ITopicDocument> {
  getTopic(_id: string): Promise<ITopicDocument>;
  createDoc(docFields: ITopic, userId?: string): Promise<ITopicDocument>;
  updateDoc(
    _id: string,
    docFields: ITopic,
    userId?: string
  ): Promise<ITopicDocument>;
  removeDoc(_id: string): void;
}

export const loadTopicClass = (models: IModels) => {
  class Topic {
    public static async getTopic(_id: string) {
      const topic = await models.Topic.findOne({ _id });

      if (!topic) {
        throw new Error('Knowledge base topic not found');
      }

      return topic;
    }

    public static createDoc(docFields: ITopic, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return models.Topic.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });
    }

    public static async updateDoc(
      _id: string,
      docFields: ITopic,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await models.Topic.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      return models.Topic.findOne({ _id });
    }

    public static async removeDoc(_id: string) {
      const topic = await models.Topic.findOne({ _id });

      if (!topic) {
        throw new Error('Topic not found');
      }

      const categories = await models.Topic.find({
        topicId: _id
      });

      for (const category of categories) {
        await models.Topic.removeDoc(category._id);
      }

      return models.Topic.deleteOne({ _id });
    }
  }

  topicSchema.loadClass(Topic);

  return topicSchema;
};