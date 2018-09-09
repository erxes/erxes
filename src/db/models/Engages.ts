import { Model, model } from 'mongoose';
import { ICustomerDocument } from './definitions/customers';
import { engageMessageSchema, IEngageMessage, IEngageMessageDocument } from './definitions/engages';

interface IEngageMessageModel extends Model<IEngageMessageDocument> {
  createEngageMessage(doc: IEngageMessage): Promise<IEngageMessageDocument>;

  updateEngageMessage(_id: string, doc: IEngageMessage): Promise<IEngageMessageDocument>;

  engageMessageSetLive(_id: string): Promise<IEngageMessageDocument>;
  engageMessageSetPause(_id: string): Promise<IEngageMessageDocument>;
  removeEngageMessage(_id: string): void;
  setCustomerIds(_id: string, customers: ICustomerDocument[]): Promise<IEngageMessageDocument>;

  addNewDeliveryReport(_id: string, mailMessageId: string, customerId: string): Promise<IEngageMessageDocument>;

  changeDeliveryReportStatus(_id: string, mailMessageId: string, status: string): Promise<IEngageMessageDocument>;

  changeCustomer(newCustomerId: string, customerIds: string[]): Promise<IEngageMessageDocument>;

  removeCustomerEngages(customerId: string): void;
  updateStats(engageMessageId: string, stat: string): void;
}

class Message {
  /**
   * Create engage message
   */
  public static createEngageMessage(doc: IEngageMessage) {
    return EngageMessages.create({
      ...doc,
      deliveryReports: {},
      createdDate: new Date(),
    });
  }

  /**
   * Update engage message
   */
  public static async updateEngageMessage(_id: string, doc: IEngageMessage) {
    const message = await EngageMessages.findOne({ _id });

    if (message && message.kind === 'manual') {
      throw new Error('Can not update manual message');
    }

    await EngageMessages.update({ _id }, { $set: doc });

    return EngageMessages.findOne({ _id });
  }

  /**
   * Engage message set live
   */
  public static async engageMessageSetLive(_id: string) {
    await EngageMessages.update({ _id }, { $set: { isLive: true, isDraft: false } });

    return EngageMessages.findOne({ _id });
  }

  /**
   * Engage message set pause
   */
  public static async engageMessageSetPause(_id: string) {
    await EngageMessages.update({ _id }, { $set: { isLive: false } });

    return EngageMessages.findOne({ _id });
  }

  /**
   * Remove engage message
   */
  public static async removeEngageMessage(_id: string) {
    const message = await EngageMessages.findOne({ _id });

    if (!message) {
      throw new Error(`Engage message not found with id ${_id}`);
    }

    if (message.kind === 'manual') {
      throw new Error('Can not remove manual message');
    }

    return message.remove();
  }

  /**
   * Save matched customer ids
   */
  public static async setCustomerIds(_id: string, customers: ICustomerDocument[]) {
    await EngageMessages.update({ _id }, { $set: { customerIds: customers.map(customer => customer._id) } });

    return EngageMessages.findOne({ _id });
  }

  /**
   * Add new delivery report
   */
  public static async addNewDeliveryReport(_id: string, mailMessageId: string, customerId: string) {
    await EngageMessages.update(
      { _id },
      {
        $set: {
          [`deliveryReports.${mailMessageId}`]: {
            customerId,
            status: 'pending',
          },
        },
      },
    );

    return EngageMessages.findOne({ _id });
  }

  /**
   * Change delivery report status
   */
  public static async changeDeliveryReportStatus(_id: string, mailMessageId: string, status: string) {
    await EngageMessages.update(
      { _id },
      {
        $set: {
          [`deliveryReports.${mailMessageId}.status`]: status,
        },
      },
    );

    return EngageMessages.findOne({ _id });
  }

  /**
   * Transfers customers' engage messages to another customer
   */
  public static async changeCustomer(newCustomerId: string, customerIds: string[]) {
    for (const customerId of customerIds) {
      // Updating every engage messages of customer
      await EngageMessages.updateMany(
        { customerIds: { $in: [customerId] } },
        { $push: { customerIds: newCustomerId } },
      );

      await EngageMessages.updateMany({ customerIds: { $in: [customerId] } }, { $pull: { customerIds: customerId } });

      // updating every engage messages of customer participated in
      await EngageMessages.updateMany(
        { messengerReceivedCustomerIds: { $in: [customerId] } },
        { $push: { messengerReceivedCustomerIds: newCustomerId } },
      );

      await EngageMessages.updateMany(
        { messengerReceivedCustomerIds: { $in: [customerId] } },
        { $pull: { messengerReceivedCustomerIds: customerId } },
      );
    }

    return EngageMessages.find({ customerIds: newCustomerId });
  }

  /**
   * Removes customer Engages
   */
  public static async removeCustomerEngages(customerId: string) {
    // Removing customer from engage messages
    await EngageMessages.updateMany(
      { messengerReceivedCustomerIds: { $in: [customerId] } },
      { $pull: { messengerReceivedCustomerIds: { $in: [customerId] } } },
    );

    return EngageMessages.updateMany({ customerIds: customerId }, { $pull: { customerIds: customerId } });
  }

  /**
   * Increase engage message stat by 1
   */
  public static async updateStats(engageMessageId: string, stat: string) {
    return EngageMessages.update({ _id: engageMessageId }, { $inc: { [`stats.${stat}`]: 1 } });
  }
}

engageMessageSchema.loadClass(Message);

const EngageMessages = model<IEngageMessageDocument, IEngageMessageModel>('engage_messages', engageMessageSchema);

export default EngageMessages;
