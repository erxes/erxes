import { IContext } from '../../../connectionResolver';
import {
  sendCoreMessage,
  sendContactsMessage,
  sendClientPortalMessage
} from '../../../messageBroker';
import { IParticipant } from './../../../models/definitions/participants';

interface IParticipantEdit extends IParticipant {
  _id: string;
}

const participantMutations = {
  participantsAdd: async (
    _root,
    doc: IParticipant,
    { models, subdomain, docModifier }: IContext
  ) => {
    const participant = await models.Participants.createParticipant(
      docModifier(doc)
    );

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: { _id: participant.driverId },
      isRPC: true,
      defaultValue: null
    });

    if (cpUser && cpUser.deviceTokens && cpUser.deviceTokens.length > 0) {
      sendCoreMessage({
        subdomain: subdomain,
        action: 'sendMobileNotification',
        data: {
          title: 'Баяр хүргэе',
          body: 'Таны үнийн саналыг амжилттай хүлээн авлаа!',
          deviceTokens: cpUser.deviceTokens
        }
      });
    }

    return participant;
  },

  participantsEdit: async (
    _root,
    { _id, ...doc }: IParticipantEdit,
    { models }: IContext
  ) => {
    return models.Participants.updateParticipant(_id, doc);
  },

  participantsRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Participants.removeParticipant(_id);
  },

  participantsRemoveFromDeal: async (
    _root,
    { dealId, customerIds }: { dealId: string; customerIds: string[] },
    { models }: IContext
  ) => {
    return models.Participants.deleteMany({
      dealId,
      customerId: { $in: customerIds }
    });
  },

  selectWinner: async (
    _root,
    { dealId, driverId }: { dealId: string; driverId: string },
    { models, subdomain }: IContext
  ) => {
    const driver = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: driverId },
      isRPC: true,
      defaultValue: null
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    await models.Participants.updateMany(
      {
        dealId
      },
      { $set: { status: 'lose' } }
    );

    await models.Participants.updateOne(
      {
        dealId,
        driverId
      },
      { $set: { status: 'won' } }
    );

    const participant = await models.Participants.getParticipant({
      dealId,
      driverId
    });

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: { erxesCustomerId: driverId },
      isRPC: true,
      defaultValue: null
    });

    if (cpUser && cpUser.deviceTokens && cpUser.deviceTokens.length > 0) {
      sendCoreMessage({
        subdomain: subdomain,
        action: 'sendMobileNotification',
        data: {
          title: 'Баяр хүргэе',
          body: 'Таны илгээсэн үнийн санал баталгаажиж, та сонгогдлоо !',
          deviceTokens: cpUser.deviceTokens
        }
      });
    }

    return participant;
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantMutations;
