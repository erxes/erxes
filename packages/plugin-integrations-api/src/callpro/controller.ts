import { generateModels, IModels } from '../connectionResolver';
import { debugCallPro, debugError, debugRequest } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { sendInboxMessage } from '../messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';

export const callproCreateIntegration = async (models: IModels, { integrationId, data }) => {
    const { phoneNumber, recordUrl } = JSON.parse(data || '{}');

    // Check existing Integration
    const integration = await models.Integrations.findOne({
      kind: 'callpro',
      phoneNumber
    }).lean();

    if (integration) {
      const message = `Integration already exists with this phone number: ${phoneNumber}`;

      debugCallPro(message);
      throw new Error(message);
    }

    await models.Integrations.create({
      kind: 'callpro',
      erxesApiId: integrationId,
      phoneNumber,
      recordUrl
    });

    return { status: 'success' };
};

export const callproGetAudio = async (models: IModels, { erxesApiId, integrationId }) => {

  const integration = await models.Integrations.findOne({
    erxesApiId: integrationId
  });

  if (!integration) {
    const message = 'Integration not found';
    debugCallPro(`Failed to get callprop audio: ${message}`);

    throw new Error(message);
  }

  const conversation = await models.CallProConversations.findOne({ erxesApiId });

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

  return { audioSrc };
}

const init = async app => {
  app.post(
    '/callpro-receive',
    routeErrorHandling(async (req, res) => {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      debugRequest(debugCallPro, req);

      const { numberTo, numberFrom, disp, callID, owner } = req.body;

      try {
        await models.Logs.createLog({
          type: 'call-pro',
          value: req.body,
          specialValue: numberFrom || ''
        });
      } catch (e) {
        const message = `Failed creating call pro log. Error: ${e.message}`;

        debugError(message);
        throw new Error(message);
      }

      const integration = await models.Integrations.findOne({
        phoneNumber: numberTo
      }).lean();

      if (!integration) {
        const message = `Integration not found with: ${numberTo}`;

        debugCallPro(message);
        throw new Error(message);
      }

      // get customer
      let customer = await models.CallProCustomers.findOne({ phoneNumber: numberFrom });

      if (!customer) {
        try {
          customer = await models.CallProCustomers.create({
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
          const apiCustomerResponse = await sendInboxMessage({
            subdomain,
            action: 'integrations.receive',
            data: {
              action: 'get-create-update-customer',
              payload: JSON.stringify({
                integrationId: integration.erxesApiId,
                primaryPhone: numberFrom,
                isUser: true,
                phones: [numberFrom]
              })
            },
            isRPC: true
          });

          customer.erxesApiId = apiCustomerResponse._id;
          await customer.save();
        } catch (e) {
          await models.CallProCustomers.deleteOne({ _id: customer._id });

          debugError(
            'Callpro: error occured during create or update customer on api: ',
            e.message
          );
          throw new Error(e);
        }
      }

      // get conversation
      let conversation = await models.CallProConversations.findOne({ callId: callID });

      // create conversation
      if (!conversation) {
        // save on integration db
        try {
          conversation = await models.CallProConversations.create({
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
        await models.CallProConversations.updateOne(
          { callId: callID },
          { $set: { state: disp } }
        );

        try {
          await sendInboxMessage({
            subdomain,
            action: 'integrations.receive',
            data: {
              action: 'create-or-update-conversation',
              payload: JSON.stringify({
                content: disp,
                conversationId: conversation.erxesApiId,
                owner
              })
            },
            isRPC: true
          });
        } catch (e) {
          debugError(e.message);
          throw new Error(e);
        }

        return res.send('success');
      }

      // save on api
      try {
        const apiConversationResponse = await sendInboxMessage({
          subdomain,
          action: 'integrations.receive',
          data: {
            action: 'create-or-update-conversation',
            payload: JSON.stringify({
              customerId: customer.erxesApiId,
              content: disp,
              integrationId: integration.erxesApiId,
              owner
            })
          },
          isRPC: true
        });

        conversation.erxesApiId = apiConversationResponse._id;
        await conversation.save();
      } catch (e) {
        await models.CallProConversations.deleteOne({ _id: conversation._id });

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
