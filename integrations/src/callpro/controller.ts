import { debugCallPro, debugRequest } from '../debuggers';
import { sendRPCMessage } from '../messageBroker';
import { Integrations } from '../models';
import { Conversations, Customers } from './models';

const init = async app => {
  app.post('/callpro/create-integration', async (req, res, next) => {
    debugRequest(debugCallPro, req);

    const { integrationId, data } = req.body;
    const { phoneNumber, recordUrl } = JSON.parse(data);

    // Check existing Integration
    const integration = await Integrations.findOne({
      kind: 'callpro',
      phoneNumber
    }).lean();

    if (integration) {
      return next(
        `Integration already exists with this phone number: ${phoneNumber}`
      );
    }

    try {
      await Integrations.create({
        kind: 'callpro',
        erxesApiId: integrationId,
        phoneNumber,
        recordUrl
      });
    } catch (e) {
      debugCallPro(`Failed to create integration: ${e}`);
      next(e);
    }

    return res.json({ status: 'ok' });
  });

  app.get('/callpro/get-audio', async (req, res) => {
    debugRequest(debugCallPro, req);

    const { erxesApiId, integrationId } = req.query;

    const integration = await Integrations.findOne({
      erxesApiId: integrationId
    });
    const conversation = await Conversations.findOne({ erxesApiId });

    const { recordUrl } = integration;
    const { callId } = conversation;

    let audioSrc = '';

    if (recordUrl) {
      audioSrc = `${recordUrl}&id=${callId}`;
    }

    return res.json({ audioSrc });
  });

  app.post('/callpro-receive', async (req, res, next) => {
    debugRequest(debugCallPro, req);

    const { numberTo, numberFrom, disp, callID, owner } = req.body;
    const integration = await Integrations.findOne({
      phoneNumber: numberTo
    }).lean();

    if (!integration) {
      debugCallPro(`Integration not found with: ${numberTo}`);
      return next();
    }

    // get customer
    let customer = await Customers.findOne({ phoneNumber: numberFrom });

    if (!customer) {
      try {
        customer = await Customers.create({
          phoneNumber: numberFrom,
          integrationId: integration._id
        });
      } catch (e) {
        throw new Error(
          e.message.includes('duplicate')
            ? 'Concurrent request: customer duplication'
            : e
        );
      }

      // save on api
      try {
        const apiCustomerResponse = await sendRPCMessage({
          action: 'get-create-update-customer',
          payload: JSON.stringify({
            integrationId: integration.erxesApiId,
            primaryPhone: numberFrom,
            isUser: true,
            phones: [numberFrom]
          })
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
          state: disp,
          callId: callID,
          senderPhoneNumber: numberTo,
          recipientPhoneNumber: numberFrom,
          integrationId: integration._id
        });
      } catch (e) {
        throw new Error(
          e.message.includes('duplicate')
            ? 'Concurrent request: conversation duplication'
            : e
        );
      }
    }

    // Check state of call and update
    if (conversation.state !== disp) {
      await Conversations.updateOne(
        { callId: callID },
        { $set: { state: disp } }
      );

      try {
        await sendRPCMessage({
          action: 'create-or-update-conversation',
          payload: JSON.stringify({
            content: disp,
            conversationId: conversation.erxesApiId,
            owner
          })
        });
      } catch (e) {
        throw new Error(e.message);
      }

      return res.send('success');
    }

    // save on api
    try {
      const apiConversationResponse = await sendRPCMessage({
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          content: disp,
          integrationId: integration.erxesApiId,
          owner
        })
      });

      conversation.erxesApiId = apiConversationResponse._id;
      await conversation.save();
    } catch (e) {
      await Conversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }

    res.send('success');
  });
};

export default init;
