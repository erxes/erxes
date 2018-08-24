import { Model, model } from "mongoose";
import { createdAtModifier } from "../plugins";
import { channelSchema, IChannelDocument } from "./definitions/channels";

interface IChannelInput {
  name: string;
  description?: string;
  memberIds?: string[];
  integrationIds?: string[];
  userId?: string;
}

interface IChannelModel extends Model<IChannelDocument> {
  createChannel(doc: IChannelInput, userId?: string): IChannelDocument;
  updateChannel(_id: string, doc: IChannelInput): IChannelDocument;
  updateUserChannels(channelIds: string[], userId: string): IChannelDocument[];
  removeChannel(_id: string): any;
}

class Channel {
  public static createChannel(doc: IChannelInput, userId?: string) {
    if (!userId) {
      throw new Error("userId must be supplied");
    }

    return Channels.create(doc);
  }
  public static async updateChannel(_id: string, doc: IChannelInput) {
    await Channels.update({ _id }, { $set: doc }, { runValidators: true });

    return Channels.findOne({ _id });
  }

  public static async updateUserChannels(channelIds: string[], userId: string) {
    // remove from previous channels
    await Channels.update(
      { memberIds: { $in: [userId] } },
      { $pull: { memberIds: userId } },
      { multi: true }
    );

    // add to given channels
    await Channels.update(
      { _id: { $in: channelIds } },
      { $push: { memberIds: userId } },
      { multi: true }
    );

    return Channels.find({ _id: { $in: channelIds } });
  }

  public static removeChannel(_id: string) {
    return Channels.remove({ _id });
  }
}

channelSchema.plugin(createdAtModifier);
channelSchema.loadClass(Channel);

const Channels = model<IChannelDocument, IChannelModel>(
  "channels",
  channelSchema
);

export default Channels;
