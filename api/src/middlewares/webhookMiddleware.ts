import { NodeVM } from 'vm2';

import {
  ConversationMessages,
  Conversations,
  Customers,
  Fields,
  Integrations
} from '../db/models';
import { ICustomField } from '../db/models/definitions/common';
import { graphqlPubsub } from '../pubsub';

const findCustomer = async doc => {
  let customer;

  if (doc.customerPrimaryEmail) {
    customer = await Customers.findOne({
      primaryEmail: doc.customerPrimaryEmail
    });
  }

  if (!customer && doc.customerPrimaryPhone) {
    customer = await Customers.findOne({
      primaryPhone: doc.customerPrimaryPhone
    });
  }

  if (!customer && doc.customerPrimaryPhone) {
    customer = await Customers.findOne({ code: doc.customerPrimaryPhone });
  }

  return customer;
};

const webhookMiddleware = async (req, res, next) => {
  try {
    const integration = await Integrations.findOne({ _id: req.params.id });

    if (!integration) {
      return next(new Error('Invalid request'));
    }

    const webhookData = integration.webhookData;

    if (
      !webhookData ||
      (!Object.values(req.headers).includes(webhookData.token) &&
        !Object.values(req.headers).includes(webhookData.origin))
    ) {
      return next(new Error('Invalid request'));
    }

    const params = req.body;

    if (webhookData.script) {
      const vm = new NodeVM({
        sandbox: { params }
      });

      vm.run(webhookData.script);
    }

    const customFieldsData: ICustomField[] = [];

    if (params.customFields) {
      params.customFields.forEach(async element => {
        const customField = await Fields.findOne({
          contentType: 'customer',
          text: element.name
        });

        if (customField) {
          let value = element.value;
          if (customField.validation === 'date') {
            value = new Date(element.value);
          }

          const customFieldData = {
            field: customField._id,
            value
          };
          customFieldsData.push(customFieldData);
        }
      });
    }

    // get or create customer
    let customer = await findCustomer(params);

    if (!customer) {
      customer = await Customers.createCustomer({
        primaryEmail: params.customerPrimaryEmail,
        primaryPhone: params.customerPrimaryPhone,
        code: params.customerCode,
        firstName: params.customerFirstName,
        lastName: params.customerLastName,
        avatar: params.customerAvatar,
        customFieldsData
      });
    }

    // get or create conversation
    let conversation = await Conversations.findOne({
      customerId: customer._id,
      integrationId: integration._id
    });

    if (!conversation) {
      conversation = await Conversations.createConversation({
        customerId: customer._id,
        integrationId: integration._id,
        content: params.content
      });
    } else {
      if (conversation.status === 'closed') {
        await Conversations.updateOne(
          { _id: conversation._id },
          { status: 'open' }
        );
      }
    }

    // create conversation message
    const message = await ConversationMessages.createMessage({
      conversationId: conversation._id,
      customerId: customer._id,
      content: params.content,
      attachments: params.attachments
    });

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: message
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message
    });

    return res.send('ok');
  } catch (e) {
    return next(e);
  }
};

export default webhookMiddleware;
