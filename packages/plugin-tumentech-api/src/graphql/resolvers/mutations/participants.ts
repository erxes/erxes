import { graphqlPubsub } from '../../../configs';
import { IContext } from '../../../connectionResolver';
import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendContactsMessage,
  sendCoreMessage
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

    if (!participant) {
      return null;
    }

    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.getConformities',
      data: {
        mainType: 'deal',
        mainTypeIds: [participant.dealId],
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: participant.dealId
      },
      isRPC: true,
      defaultValue: null
    });

    const stage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: {
        _id: deal.stageId
      },
      isRPC: true,
      defaultValue: {}
    });

    if (stage.code === 'dealsWaitingDriver') {
      return participant;
    }

    graphqlPubsub.publish('participantsChanged', {
      participantsChanged: participant
    });

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        erxesCustomerId: participant.driverId,
        clientPortalId: process.env.MOBILE_CP_ID || ''
      },
      isRPC: true,
      defaultValue: null
    });

    if (cpUser) {
      sendClientPortalMessage({
        subdomain,
        action: 'sendNotification',
        data: {
          title: 'Үнийн санал илгээсэн танд баярлалаа.',
          content: 'Таны үнийн санал амжилттай илгээгдлээ!',
          receivers: [cpUser._id],
          notifType: 'system',
          link: '',
          isMobile: true
        }
      });
    }

    if (conformities.length > 0) {
      for (const conformity of conformities) {
        const customer = await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: {
            _id: conformity.relTypeId
          },
          isRPC: true,
          defaultValue: null
        });

        if (!customer) {
          continue;
        }

        const orderUser = await sendClientPortalMessage({
          subdomain,
          action: 'clientPortalUsers.findOne',
          data: {
            erxesCustomerId: customer._id,
            clientPortalId: process.env.WEB_CP_ID || '4tjtd7Y6yrDuDNiYe'
          },
          isRPC: true,
          defaultValue: null
        });

        if (!orderUser) {
          continue;
        }

        sendClientPortalMessage({
          subdomain,
          action: 'sendNotification',
          data: {
            title: 'Үнийн санал ирлээ.',
            content: `Таны ${deal.name} захиалгад үнийн санал ирлээ.`,
            receivers: [orderUser._id],
            notifType: 'system',
            link: `/shipping/info?deal=${participant.dealId}`,
            isMobile: false
          }
        });
      }
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
    { models, subdomain }: IContext
  ) => {
    const participant = await models.Participants.findOne({ _id });

    if (!participant) {
      return null;
    }

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        erxesCustomerId: participant.driverId,
        clientPortalId: process.env.MOBILE_CP_ID || ''
      },
      isRPC: true,
      defaultValue: []
    });

    if (!cpUser) {
      return models.Participants.removeParticipant(_id);
    }

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: participant.dealId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!deal) {
      return null;
    }

    sendClientPortalMessage({
      subdomain,
      action: 'sendNotification',
      data: {
        title: 'Үнийн санал илгээсэн танд баярлалаа.',
        content: `${deal.name} дугаартай тээврийн ажилд таны мэдээлэл шалгуур хангасангүй.`,
        receivers: [cpUser._id],
        notifType: 'system',
        link: '',
        isMobile: true
      }
    });

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

    const failedDriverIds = await models.Participants.find({
      dealId,
      status: 'lose'
    }).distinct('driverId');

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: dealId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!deal) {
      throw new Error('Deal not found');
    }

    const winner = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        erxesCustomerId: driverId,
        clientPortalId: process.env.MOBILE_CP_ID || ''
      },
      isRPC: true,
      defaultValue: null
    });

    if (winner) {
      const stage = await sendCardsMessage({
        subdomain,
        action: 'stages.findOne',
        data: {
          _id: deal.stageId
        },
        isRPC: true,
        defaultValue: {}
      });

      if (stage.code === 'dealsWaitingDriver') {
        return;
      }

      console.log('winner', winner);
      console.log('deal', deal);
      console.log('stage', stage);

      const data: any = {
        title: 'Баяр хүргэе',
        content: `Таны илгээсэн үнийн санал баталгаажиж,  ${deal.name} дугаартай тээврийн ажилд та сонгогдлоо, та ажлаа баталгаажуулна уу`,
        receivers: [winner._id],
        notifType: 'system',
        link: ``,
        isMobile: true,
        eventData: {
          type: 'deal',
          id: deal._id
        }
      };

      if (stage.code === 'dealsWaitingDriver') {
        data.title = 'Танд ажлын хүсэлт ирлээ';
        data.content = `Та ${deal.name} дугаарт ажилд уригдлаа.`;
      }

      sendClientPortalMessage({
        subdomain,
        action: 'sendNotification',
        data
      });
    }

    if (failedDriverIds && failedDriverIds.length > 0) {
      const cpUsers = await sendClientPortalMessage({
        subdomain,
        action: 'clientPortalUsers.find',
        data: {
          erxesCustomerId: { $in: failedDriverIds },
          clientPortalId: process.env.MOBILE_CP_ID || ''
        },
        isRPC: true,
        defaultValue: []
      });

      if (cpUsers && cpUsers.length > 0) {
        sendClientPortalMessage({
          subdomain,
          action: 'sendNotification',
          data: {
            title: 'Үнийн санал илгээсэн танд баярлалаа.',
            content: `${deal.name} дугаартай тээврийн ажилд өөр тээвэрчин сонгогдсон байна.`,
            receivers: cpUsers.map(u => u._id),
            notifType: 'system',
            link: ``,
            isMobile: true
          }
        });
      }
    }

    return participant;
  }
};

//   requireLogin(participantQueries, 'tagDetail');
//   checkPermission(participantQueries, 'tags', 'showTags', []);

export default participantMutations;
