import { NodeVM } from 'vm2';
import { findCompany, findCustomer } from '../data/utils';
import {
  Companies,
  Conformities,
  ConversationMessages,
  Conversations,
  Customers,
  Fields,
  Integrations
} from '../db/models';
import { graphqlPubsub } from '../pubsub';

const checkCompanyFieldsExists = async doc => {
  for (const key in doc) {
    if (key.includes('company')) {
      return true;
    }
  }

  return false;
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

    let customFieldsData: any[] = [];

    if (params.customFields) {
      customFieldsData = await Promise.all(
        params.customFields.map(async element => {
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
              hasMultipleChoice: (customField.options || []).length > 0,
              value
            };

            return customFieldData;
          }
        })
      );

      // collect non empty values
      customFieldsData = customFieldsData.filter(cf => cf);
    }

    // get or create customer
    let customer = await findCustomer(params);

    const doc = {
      primaryEmail: params.customerPrimaryEmail,
      primaryPhone: params.customerPrimaryPhone,
      code: params.customerCode,
      firstName: params.customerFirstName,
      lastName: params.customerLastName,
      middleName: params.customerMiddleName,
      avatar: params.customerAvatar,
      customFieldsData
    };

    if (!customer) {
      customer = await Customers.createCustomer(doc);
    } else {
      // remove empty values to avoid replacing existing values
      for (const key of Object.keys(doc)) {
        if (!doc[key]) {
          delete doc[key];
        }
      }

      const prevCustomFieldsData = customer.customFieldsData || [];

      for (const data of customFieldsData) {
        const prevData = prevCustomFieldsData.find(d => d.field === data.field);

        if (prevData) {
          if (data.hasMultipleChoice) {
            if (!prevData.value.includes(data.value)) {
              prevData.value = `${prevData.value},${data.value}`;
            }
          } else {
            prevData.value = data.value;
          }
        } else {
          prevCustomFieldsData.push(data);
        }
      }

      doc.customFieldsData = prevCustomFieldsData;

      customer = await Customers.updateCustomer(customer._id, doc);
    }

    // get or create conversation
    if (params.content) {
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
    }

    // company
    let company = await findCompany(params);

    const hasCompanyFields = await checkCompanyFieldsExists(params);

    if (hasCompanyFields) {
      const companyDoc = {
        primaryEmail: params.companyPrimaryEmail,
        primaryPhone: params.companyPrimaryPhone,
        primaryName: params.companyPrimaryName,
        website: params.companyWebsite,
        industry: params.companyIndustry,
        businessType: params.companyBusinessType,
        avatar: params.companyAvatar
      };

      if (!company) {
        company = await Companies.createCompany(companyDoc);
      } else {
        company = await Companies.updateCompany(company._id, companyDoc);
      }
    }

    // comformity
    if (company && customer) {
      await Conformities.editConformity({
        ...{
          mainType: 'customer',
          mainTypeId: customer._id,
          relType: 'company',
          relTypeIds: [company._id]
        }
      });
    }
    return res.send('ok');
  } catch (e) {
    return next(e);
  }
};

export default webhookMiddleware;
