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
  /**
   * Create a new channel document
   * @param {Object} doc - Channel object
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {string[]} doc.integrationIds - Integrations that this channel is related with
   * @param {string[]} doc.memberIds - Members assigned to this integration
   * @param {Object|String} userId - The user who is making this action
   * @return {Promise} return channel document promise
   * @throws {Error} throws Error('userId must be supplied') if userId is not supplied
   */
  public static createChannel(doc: IChannelInput, userId?: string) {
    if (!userId) {
      throw new Error("userId must be supplied");
    }

    return Channels.create(doc);
  }

  /**
   * Updates a channel document
   * @param {string} _id - Channel id
   * @param {Object} doc - Channel object
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {string[]} doc.integrationIds - Integration ids related to the channel
   * @param {string} doc.userId - The user id or object that craeted this channel
   * @param {string[]} doc.memberIds - Member ids of the members assigned to this channel
   * @return {Promise} returns Promise resolving updated channel document
   */
  public static async updateChannel(_id: string, doc: IChannelInput) {
    await Channels.update({ _id }, { $set: doc }, { runValidators: true });

    return Channels.findOne({ _id });
  }

  /*
   * Update user's channels
   * @param {[String]} channelIds - User's all involved channels
   * @param {Promise} - Updated channels
   */
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

  /**
   * Removes a channel document
   * @param {string} _id - Channel id
   * @return {Promise} returns null promise
   */
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
