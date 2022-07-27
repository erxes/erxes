import { Document, Schema, Model, model } from 'mongoose';
import { IModels } from './index';

export interface ITopic {
  name: string;
}

export interface ITopicDocument extends Document, ITopic {}

export interface ITopicModel extends Model<ITopicDocument> {
  createRandom(): Promise<ITopicDocument>;
}

export const topicSchema = new Schema<ITopicDocument>({
  name: { type: String, required: true }
});

export const genTopicModel = (
  models: IModels,
  subdomain: string
): ITopicModel => {
  class TopicModel implements ITopic {
    public name: string;
    async createRandom(): Promise<ITopicDocument> {
      const res = new models.Topic({ name: 'asdfaswdf' });
      return res;
    }
  }
  topicSchema.loadClass(TopicModel);

  const Topic = model<ITopicDocument, ITopicModel>('topics', topicSchema);
  return Topic;
};
