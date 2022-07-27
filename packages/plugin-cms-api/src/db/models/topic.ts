import { Document, Schema, Model, Connection } from 'mongoose';
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

export const generateTopicModel = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  class TopicModel implements ITopic {
    public name: string;
    async createRandom(): Promise<ITopicDocument> {
      const res = new models.Topic({ name: `${Date.now()}${Math.random()}` });
      await res.save();
      return res;
    }
  }
  topicSchema.loadClass(TopicModel);

  models.Topic = con.model<ITopicDocument, ITopicModel>(
    'cms-topics',
    topicSchema
  );
};
