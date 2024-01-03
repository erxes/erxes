import { getSubdomain } from '@erxes/api-utils/src/core';
import { NodeVM } from 'vm2';
import { graphqlPubsub } from '../configs';
import { generateModels } from '../connectionResolver';
import { pConversationClientMessageInserted } from '../graphql/resolvers/widgetMutations';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage
} from '../messageBroker';

const checkCompanyFieldsExists = async doc => {
  for (const key in doc) {
    if (key.includes('company')) {
      return true;
    }
  }

  return false;
};

const createCustomer = (subdomain, data) => {
  return sendContactsMessage({
    subdomain,
    action: 'customers.createCustomer',
    isRPC: true,
    data
  });
};

const updateCustomer = ({
  subdomain,
  _id,
  doc
}: {
  subdomain: string;
  _id: string;
  doc;
}) => {
  return sendContactsMessage({
    subdomain,
    action: 'customers.updateCustomer',
    isRPC: true,
    data: {
      _id,
      doc
    }
  });
};

const findCustomer = (subdomain, data) => {
  return sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    isRPC: true,
    data
  });
};

const createCompany = (subdomain, data) => {
  return sendContactsMessage({
    subdomain,
    action: 'companies.createCompany',
    isRPC: true,
    data
  });
};

const updateCompany = ({
  subdomain,
  _id,
  doc
}: {
  subdomain: string;
  _id: string;
  doc;
}) => {
  return sendContactsMessage({
    subdomain,
    action: 'companies.updateCompany',
    isRPC: true,
    data: {
      _id,
      doc
    }
  });
};

const findCompany = (subdomain, data) => {
  return sendContactsMessage({
    subdomain,
    action: 'companies.findOne',
    isRPC: true,
    data
  });
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
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  try {
    const integration = await models.Integrations.findOne({
      _id: req.params.id
    });

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
          const customField = await sendFormsMessage({
            subdomain,
            action: 'fields.findOne',
            data: {
              query: {
                contentType: 'contacts:customer',
                text: element.name
              }
            },
            isRPC: true
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
      const data = await sendFormsMessage({
        subdomain,
        action: 'fields.generateCustomFieldsData',
        data: {
          customData: params.data,
          contentType: 'contacts:customer'
        },
        isRPC: true
      });

      customFieldsData = [
        ...new Set([...(data.customFieldsData || []), ...customFieldsData])
      ];

      trackedData = data.trackedData;
    }

    // collect non empty values
    customFieldsData = customFieldsData.filter(cf => cf);

    // get or create customer
    let customer = await findCustomer(subdomain, params);

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
      customer = await createCustomer(subdomain, doc);
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

      customer = await updateCustomer({ subdomain, _id: customer._id, doc });
    }

    // get or create conversation
    if (params.content) {
      let conversation = await models.Conversations.findOne({
        customerId: customer._id,
        integrationId: integration._id
      });

      if (!conversation) {
        conversation = await models.Conversations.createConversation({
          customerId: customer._id,
          integrationId: integration._id,
          content: params.content
        });
      } else {
        if (conversation.status === 'closed') {
          await models.Conversations.updateOne(
            { _id: conversation._id },
            { status: 'open' }
          );
        }
      }

      // create conversation message
      const messageDoc: any = {
        conversationId: conversation._id,
        customerId: customer._id,
        content: params.content,
        attachments: params.attachments
      };

      if (params.formContent) {
        messageDoc.formWidgetData = params.formContent;
      }

      const message = await models.ConversationMessages.createMessage(
        messageDoc
      );

      await pConversationClientMessageInserted(models, subdomain, message);

      graphqlPubsub.publish('conversationMessageInserted', {
        conversationMessageInserted: message
      });
    }

    // company
    let company = await findCompany(subdomain, params);

    let parentCompany;

    const hasCompanyFields = await checkCompanyFieldsExists(params);

    if (params.parentCompany) {
      parentCompany = await findCompany(subdomain, params.parentCompany);

      let parentCompanyData: { customFieldsData: any[]; trackedData: any[] } = {
        customFieldsData: [],
        trackedData: []
      };

      if (params.parentCompany.companyData) {
        parentCompanyData = await sendFormsMessage({
          subdomain,
          action: 'fields.generateCustomFieldsData',
          data: {
            customData: params.parentCompany.companyData,
            contentType: 'contacts:company'
          },
          isRPC: true
        });
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
        parentCompany = await createCompany(subdomain, parentCompanyDoc);
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

        parentCompany = await updateCompany({
          subdomain,
          _id: parentCompany._id,
          doc: parentCompanyDoc
        });
      }
    }

    if (hasCompanyFields) {
      let companyData: { customFieldsData: any[]; trackedData: any[] } = {
        customFieldsData: [],
        trackedData: []
      };

      if (params.companyData) {
        companyData = await sendFormsMessage({
          subdomain,
          action: 'fields.generateCustomFieldsData',
          data: {
            customData: params.companyData,
            contentType: 'contacts:company'
          },
          isRPC: true
        });
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
        company = await createCompany(subdomain, companyDoc);
      } else {
        company = await updateCompany({
          subdomain,
          _id: company._id,
          doc: companyDoc
        });
      }

      if (!company) {
        company = await createCompany(subdomain, companyDoc);
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

        company = await updateCompany({
          subdomain,
          _id: company._id,
          doc: companyDoc
        });
      }
    }

    // comformity
    if (company && customer) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.editConformity',
        data: {
          mainType: 'customer',
          mainTypeId: customer._id,
          relType: 'company',
          relTypeIds: [company._id]
        },
        isRPC: true,
        defaultValue: []
      });
    }

    return res.send('ok');
  } catch (e) {
    return next(e);
  }
};

export default webhookMiddleware;
