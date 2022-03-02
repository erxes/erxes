import { debugCallPro, debugError, debugRequest } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { sendRPCMessage } from '../messageBroker';
import { Integrations, Logs } from '../models';
import { Conversations, Customers } from './models';

const init = async app => {
  app.post(
    '/callpro/create-integration',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugCallPro, req);

      const { integrationId, data } = req.body;
      const { phoneNumber, recordUrl } = JSON.parse(data || '{}');

      // Check existing Integration
      const integration = await Integrations.findOne({
        kind: 'callpro',
        phoneNumber
      }).lean();

      if (integration) {
        const message = `Integration already exists with this phone number: ${phoneNumber}`;

        debugCallPro(message);
        throw new Error(message);
      }

      await Integrations.create({
        kind: 'callpro',
        erxesApiId: integrationId,
        phoneNumber,
        recordUrl
      });

      return res.json({ status: 'ok' });
    })
  );

  app.get(
    '/callpro/get-audio',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugCallPro, req);

      const { erxesApiId, integrationId } = req.query;

      const integration = await Integrations.findOne({
        erxesApiId: integrationId
      });

      if (!integration) {
        const message = 'Integration not found';
        debugCallPro(`Failed to get callprop audio: ${message}`);

        throw new Error(message);
      }

      const conversation = await Conversations.findOne({ erxesApiId });

      if (!conversation) {
        const message = 'Conversation not found';

        debugCallPro(`Failed to get callprop audio: ${message}`);
        throw new Error(message);
      }

      const { recordUrl } = integration;
      const { callId } = conversation;

      let audioSrc = '';

      if (recordUrl) {
        audioSrc = `${recordUrl}&id=${callId}`;
      }

      return res.json({ audioSrc });
    })
  );

  app.post(
    '/callpro-receive',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugCallPro, req);

      const { numberTo, numberFrom, disp, callID, owner } = req.body;

      try {
        await Logs.createLog({
          type: 'call-pro',
          value: req.body,
          specialValue: numberFrom || ''
        });
      } catch (e) {
        const message = `Failed creating call pro log. Error: ${e.message}`;

        debugError(message);
        throw new Error(message);
      }

      const integration = await Integrations.findOne({
        phoneNumber: numberTo
      }).lean();

      if (!integration) {
        const message = `Integration not found with: ${numberTo}`;

        debugCallPro(message);
        throw new Error(message);
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
          const message = e.message.includes('duplicate')
            ? 'Concurrent request: customer duplication'
            : e.message;

          debugError(message);
          throw new Error(message);
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

          debugError(
            'Callpro: error occured during create or update customer on api: ',
            e.message
          );
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
          const message = e.message.includes('duplicate')
            ? 'Concurrent request: conversation duplication'
            : e.message;

          debugError(message);
          throw new Error(message);
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
          debugError(e.message);
          throw new Error(e);
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

        debugError(
          'Callpro: error occured during create or update conversation on api: ',
          e.message
        );
        throw new Error(e);
      }

      res.send('success');
    })
  );
};

export default init;
