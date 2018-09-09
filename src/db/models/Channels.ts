import { Model, model } from 'mongoose';
import { channelSchema, IChannel, IChannelDocument } from './definitions/channels';

interface IChannelModel extends Model<IChannelDocument> {
  createChannel(doc: IChannel, userId?: string): IChannelDocument;
  updateChannel(_id: string, doc: IChannel): IChannelDocument;
  updateUserChannels(channelIds: string[], userId: string): IChannelDocument[];
  removeChannel(_id: string): void;
}

class Channel {
  public static createChannel(doc: IChannel, userId?: string) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    return Channels.create({
      ...doc,
      createdAt: new Date(),
      userId
    });
  }

  public static async updateChannel(_id: string, doc: IChannel) {
    await Channels.update({ _id }, { $set: doc }, { runValidators: true });

    return Channels.findOne({ _id });
  }

  public static async updateUserChannels(channelIds: string[], userId: string) {
    // remove from previous channels
    await Channels.update({ memberIds: { $in: [userId] } }, { $pull: { memberIds: userId } }, { multi: true });

    // add to given channels
    await Channels.update({ _id: { $in: channelIds } }, { $push: { memberIds: userId } }, { multi: true });

    return Channels.find({ _id: { $in: channelIds } });
  }

  public static removeChannel(_id: string) {
    return Channels.remove({ _id });
  }
}

channelSchema.loadClass(Channel);

const Channels = model<IChannelDocument, IChannelModel>('channels', channelSchema);

export default Channels;
