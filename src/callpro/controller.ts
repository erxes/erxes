import { debugCallPro, debugRequest } from '../debuggers';
import { Integrations } from '../models';
import { fetchMainApi } from '../utils';
import { ConversationMessages, Conversations, Customers } from './model';

const init = async app => {
  app.post('/callpro/create-integration', async (req, res, next) => {
    debugRequest(debugCallPro, req);

    const { integrationId, data } = req.body;
    const { phoneNumber } = JSON.parse(data);

    // Check existing Integration
    const integration = await Integrations.findOne({ kind: 'callpro', phoneNumber }).lean();

    if (integration) {
      return next(`Integration already exists with this phone number: ${phoneNumber}`);
    }

    try {
      await Integrations.create({
        kind: 'callpro',
        erxesApiId: integrationId,
        phoneNumber,
      });
    } catch (e) {
      debugCallPro(`Failed to create integration: ${e}`);
      next(e);
    }

    return res.json({ status: 'ok' });
  });

  app.post('/callpro-receive', async (req, res, next) => {
    debugRequest(debugCallPro, req);

    const { numberTo, numberFrom, disp, recordURL, callID, date } = JSON.parse(req.rawBody);
    const integration = await Integrations.findOne({ phoneNumber: numberTo }).lean();

    if (!integration) {
      debugCallPro(`Integrtion not found with: ${numberTo}`);
      return next();
    }

    // get customer
    let customer = await Customers.findOne({ phoneNumber: numberFrom });

    if (!customer) {
      try {
        customer = await Customers.create({ phoneNumber: numberFrom });
      } catch (e) {
        throw new Error(e.message.includes('duplicate') ? 'Concurrent request: customer duplication' : e);
      }

      // save on api
      try {
        const apiCustomerResponse = await fetchMainApi({
          path: '/integrations-api',
          method: 'POST',
          body: {
            action: 'create-customer',
            payload: JSON.stringify({
              integrationId: integration.erxesApiId,
              primaryPhone: numberFrom,
            }),
          },
        });
        customer.erxesApiId = apiCustomerResponse._id;
        await customer.save();
      } catch (e) {
        await Customers.deleteOne({ _id: customer._id });
        throw new Error(e);
      }
    }

    // get conversation
    let conversation = await Conversations.findOne({ callId: callID });

    // create conversation
    if (!conversation) {
      // save on integration db
      try {
        conversation = await Conversations.create({
          timestamp: date,
          state: disp,
          callId: callID,
          senderPhoneNumber: numberTo,
          recipientPhoneNumber: numberFrom,
        });
      } catch (e) {
        throw new Error(e.message.includes('duplicate') ? 'Concurrent request: conversation duplication' : e);
      }
    }

    // save on api
    try {
      const apiConversationResponse = await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-conversation',
          payload: JSON.stringify({
            customerId: customer.erxesApiId,
            content: disp,
            integrationId: integration.erxesApiId,
          }),
        },
      });

      conversation.erxesApiId = apiConversationResponse._id;
      await conversation.save();
    } catch (e) {
      await Conversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }

    // get conversation message
    const conversationMessage = await ConversationMessages.findOne({
      callId: callID,
    });

    if (!conversationMessage) {
      // save on integrations db
      await ConversationMessages.create({
        content: audioElement(recordURL || ''),
        conversationId: conversation._id,
        callId: callID,
      });

      // save message on api
      try {
        await fetchMainApi({
          path: '/integrations-api',
          method: 'POST',
          body: {
            action: 'create-conversation-message',
            payload: JSON.stringify({
              content: audioElement(recordURL || ''),
              conversationId: conversation.erxesApiId,
              customerId: customer.erxesApiId,
            }),
          },
        });
      } catch (e) {
        await ConversationMessages.deleteOne({ callId: callID });
        throw new Error(e);
      }
    }

    res.send('success');
  });
};

const audioElement = (src: string) => {
  return `<audio controls name="media" src="${src}"/>`;
};

export default init;
