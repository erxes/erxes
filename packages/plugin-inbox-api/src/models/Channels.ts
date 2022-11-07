import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  channelSchema,
  IChannel,
  IChannelDocument
} from './definitions/channels';

export interface IChannelModel extends Model<IChannelDocument> {
  getChannel(_id: string): Promise<IChannelDocument>;
  createChannel(doc: IChannel, userId?: string): IChannelDocument;
  updateChannel(_id: string, doc: IChannel): IChannelDocument;
  updateUserChannels(channelIds: string[], userId: string): IChannelDocument[];
  removeChannel(_id: string): void;
}

export const loadClass = (models: IModels) => {
  class Channel {
    /*
     * Get a Channel
     */
    public static async getChannel(_id: string) {
      const channel = await models.Channels.findOne({ _id });

      if (!channel) {
        throw new Error('Channel not found');
      }

      return channel;
    }

    public static createChannel(doc: IChannel, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return models.Channels.create({
        ...doc,
        createdAt: new Date(),
        userId
      });
    }

    public static async updateChannel(_id: string, doc: IChannel) {
      await models.Channels.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.Channels.findOne({ _id });
    }

    public static async updateUserChannels(
      channelIds: string[],
      userId: string
    ) {
      // remove from previous channels
      await models.Channels.updateMany(
        { memberIds: { $in: [userId] } },
        { $pull: { memberIds: userId } },
        { multi: true }
      );

      // add to given channels
      await models.Channels.updateMany(
        { _id: { $in: channelIds } },
        { $push: { memberIds: userId } },
        { multi: true }
      );

      return models.Channels.find({ _id: { $in: channelIds } });
    }

    public static removeChannel(_id: string) {
      return models.Channels.deleteOne({ _id });
    }
  }

  channelSchema.loadClass(Channel);

  return channelSchema;
};
