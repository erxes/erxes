import { NodeVM } from 'vm2';
import { RABBITMQ_QUEUES } from '../data/constants';
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
import messageBroker from '../messageBroker';
import { graphqlPubsub } from '../pubsub';

const checkCompanyFieldsExists = async doc => {
  for (const key in doc) {
    if (key.includes('company')) {
      return true;
    }
  }

  return false;
};

const solveCustomFieldsData = (customFieldsData, prevCustomFieldsData) => {
  prevCustomFieldsData = prevCustomFieldsData || [];

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

  return prevCustomFieldsData;
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
    let trackedData: any;

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
    }

    // prepare customFieldsData and trackedData
    if (params.data) {
      const data = await Fields.generateCustomFieldsData(
        params.data,
        'customer'
      );

      customFieldsData = [
        ...new Set([...(data.customFieldsData || []), ...customFieldsData])
      ];

      trackedData = data.trackedData;
    }

    // collect non empty values
    customFieldsData = customFieldsData.filter(cf => cf);

    // get or create customer
    let customer = await findCustomer(params);

    const doc = {
      state: params.customerState,
      primaryEmail: params.customerPrimaryEmail,
      primaryPhone: params.customerPrimaryPhone,
      code: params.customerCode,
      firstName: params.customerFirstName,
      lastName: params.customerLastName,
      middleName: params.customerMiddleName,
      avatar: params.customerAvatar,
      customFieldsData,
      trackedData
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

      doc.customFieldsData = solveCustomFieldsData(
        customFieldsData,
        customer.customFieldsData
      );

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
    let parentCompany;

    const hasCompanyFields = await checkCompanyFieldsExists(params);

    if (params.parentCompany) {
      parentCompany = await findCompany(params.parentCompany);

      let parentCompanyData: { customFieldsData: any[]; trackedData: any[] } = {
        customFieldsData: [],
        trackedData: []
      };

      if (params.parentCompany.companyData) {
        parentCompanyData = await Fields.generateCustomFieldsData(
          params.parentCompany.companyData,
          'company'
        );
      }

      const parentParams = params.parentCompany;

      const parentCompanyDoc = {
        primaryEmail: parentParams.companyPrimaryEmail,
        primaryPhone: parentParams.companyPrimaryPhone,
        primaryName: parentParams.companyPrimaryName,
        website: parentParams.companyWebsite,
        industry: parentParams.companyIndustry,
        businessType: parentParams.companyBusinessType,
        avatar: parentParams.companyAvatar,
        code: parentParams.companyCode,
        customFieldsData: parentCompanyData.customFieldsData,
        trackedData: parentCompanyData.trackedData
      };

      if (!parentCompany) {
        parentCompany = await Companies.createCompany(parentCompanyDoc);
      } else {
        for (const key of Object.keys(doc)) {
          if (!doc[key]) {
            delete doc[key];
          }
        }

        parentCompanyDoc.customFieldsData = solveCustomFieldsData(
          parentCompanyData.customFieldsData,
          parentCompanyDoc.customFieldsData
        );

        parentCompany = await Companies.updateCompany(
          parentCompany._id,
          parentCompanyDoc
        );
      }
    }

    if (hasCompanyFields) {
      let companyData: { customFieldsData: any[]; trackedData: any[] } = {
        customFieldsData: [],
        trackedData: []
      };

      if (params.companyData) {
        companyData = await Fields.generateCustomFieldsData(
          params.companyData,
          'company'
        );
      }

      const companyDoc = {
        primaryEmail: params.companyPrimaryEmail,
        primaryPhone: params.companyPrimaryPhone,
        primaryName: params.companyPrimaryName,
        website: params.companyWebsite,
        industry: params.companyIndustry,
        businessType: params.companyBusinessType,
        avatar: params.companyAvatar,
        code: params.companyCode,
        customFieldsData: companyData && companyData.customFieldsData,
        trackedData: companyData && companyData.trackedData,
        parentCompanyId: parentCompany ? parentCompany._id : undefined
      };

      if (!company) {
        company = await Companies.createCompany(companyDoc);
      } else {
        company = await Companies.updateCompany(company._id, companyDoc);
      }

      if (!company) {
        company = await Companies.createCompany(companyDoc);
      } else {
        // remove empty values to avoid replacing existing values
        for (const key of Object.keys(doc)) {
          if (!doc[key]) {
            delete doc[key];
          }
        }

        companyDoc.customFieldsData = solveCustomFieldsData(
          companyData.customFieldsData,
          company.customFieldsData
        );

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

    let bulkData: any;

    if (params.customers) {
      bulkData = { type: 'customer', data: params.customers };
    }

    if (params.companies) {
      bulkData = { type: 'company', data: params.companies };
    }

    if (bulkData) {
      await messageBroker().sendRPCMessage(
        RABBITMQ_QUEUES.RPC_API_TO_WEBHOOK_WORKERS,
        bulkData
      );
    }

    return res.send('ok');
  } catch (e) {
    return next(e);
  }
};

export default webhookMiddleware;
