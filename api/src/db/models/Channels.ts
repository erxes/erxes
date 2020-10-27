import { Model, model } from 'mongoose';
import { channelSchema, IChannel, IChannelDocument } from './definitions/channels';

export interface IChannelModel extends Model<IChannelDocument> {
  getChannel(_id: string): Promise<IChannelDocument>;
  createChannel(doc: IChannel, userId?: string): IChannelDocument;
  updateChannel(_id: string, doc: IChannel): IChannelDocument;
  updateUserChannels(channelIds: string[], userId: string): IChannelDocument[];
  removeChannel(_id: string): void;
}

export const loadClass = () => {
  class Channel {
    /*
     * Get a Channel
     */
    public static async getChannel(_id: string) {
      const channel = await Channels.findOne({ _id });

      if (!channel) {
        throw new Error('Channel not found');
      }

      return channel;
    }

    public static createChannel(doc: IChannel, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return Channels.create({
        ...doc,
        createdAt: new Date(),
        userId,
      });
    }

    public static async updateChannel(_id: string, doc: IChannel) {
      await Channels.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Channels.findOne({ _id });
    }

    public static async updateUserChannels(channelIds: string[], userId: string) {
      // remove from previous channels
      await Channels.updateMany({ memberIds: { $in: [userId] } }, { $pull: { memberIds: userId } }, { multi: true });

      // add to given channels
      await Channels.updateMany({ _id: { $in: channelIds } }, { $push: { memberIds: userId } }, { multi: true });

      return Channels.find({ _id: { $in: channelIds } });
    }

    public static removeChannel(_id: string) {
      return Channels.deleteOne({ _id });
    }
  }

  channelSchema.loadClass(Channel);

  return channelSchema;
};

loadClass();

// tslint:disable-next-line
const Channels = model<IChannelDocument, IChannelModel>('channels', channelSchema);

export default Channels;
