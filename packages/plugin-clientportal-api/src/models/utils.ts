import {
  getService,
  getServices,
  isEnabled
} from '@erxes/api-utils/src/serviceDiscovery';
import { IModels } from '../connectionResolver';
import messageBroker, {
  sendCardsMessage,
  sendContactsMessage
} from '../messageBroker';

export interface IContactsParams {
  subdomain: string;
  models: IModels;
  clientPortalId: string;
  document: any;
  password?: string;
}

export const handleContacts = async (args: IContactsParams) => {
  const { subdomain, models, clientPortalId, document, password } = args;
  const { type = 'customer' } = document;

  let qry: any = {};
  let user: any;

  const trimmedMail = (document.email || '').toLowerCase().trim();

  if (document.email) {
    qry = { email: trimmedMail };
  }

  if (document.phone) {
    qry = { phone: document.phone };
  }

  qry.clientPortalId = clientPortalId;

  if (type === 'customer') {
    let customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryEmail: trimmedMail,
        customerPrimaryPhone: document.phone
      },
      isRPC: true
    });

    if (customer) {
      qry = { erxesCustomerId: customer._id, clientPortalId };
    }

    user = await models.ClientPortalUsers.findOne(qry);

    if (user) {
      throw new Error('user is already exists');
    }

    user = await models.ClientPortalUsers.create({
      ...document,
      clientPortalId,
      // hash password
      password:
        password && (await models.ClientPortalUsers.generatePassword(password))
    });

    if (!customer) {
      customer = await sendContactsMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: {
          firstName: document.firstName,
          lastName: document.lastName,
          primaryEmail: trimmedMail,
          primaryPhone: document.phone,
          state: 'lead'
        },
        isRPC: true
      });
    }

    if (customer && customer._id) {
      user.erxesCustomerId = customer._id;
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCustomerId: customer._id } }
      );

      for (const serviceName of await getServices()) {
        const serviceConfig = await getService(serviceName, true);

        if (serviceConfig.config?.meta?.hasOwnProperty('cpCustomerHandle')) {
          if (await isEnabled(serviceName)) {
            messageBroker().sendMessage(`${serviceName}:cpCustomerHandle`, {
              subdomain,
              data: { customer }
            });
          }
        }
      }
    }
  }

  if (type === 'company') {
    let company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: {
        companyPrimaryEmail: trimmedMail,
        companyPrimaryPhone: document.phone,
        companyCode: document.companyRegistrationNumber
      },
      isRPC: true
    });

    if (company) {
      qry = { erxesCompanyId: company._id, clientPortalId };
    }

    user = await models.ClientPortalUsers.findOne(qry);

    if (user && (user.isEmailVerified || user.isPhoneVerified)) {
      throw new Error('user is already exists');
    }

    if (user) {
      return user;
    }

    user = await models.ClientPortalUsers.create({
      ...document,
      clientPortalId,
      // hash password
      password:
        password && (await models.ClientPortalUsers.generatePassword(password))
    });

    if (!company) {
      company = await sendContactsMessage({
        subdomain,
        action: 'companies.createCompany',
        data: {
          primaryName: document.companyName,
          primaryEmail: trimmedMail,
          primaryPhone: document.phone,
          code: document.companyRegistrationNumber
        },
        isRPC: true
      });
    }

    if (company && company._id) {
      user.erxesCompanyId = company._id;
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCompanyId: company._id } }
      );

      for (const serviceName of await getServices()) {
        const serviceConfig = await getService(serviceName, true);

        if (serviceConfig.config?.meta?.hasOwnProperty('cpCustomerHandle')) {
          if (await isEnabled(serviceName)) {
            messageBroker().sendMessage(`${serviceName}:cpCustomerHandle`, {
              subdomain,
              data: { company }
            });
          }
        }
      }
    }
  }

  return user;
};

export const putActivityLog = async user => {
  let contentType = 'contacts:customer';
  let contentId = user.erxesCustomerId;

  if (user.type === 'company') {
    contentType = 'contacts:company';
    contentId = user.erxesCompanyId;
  }

  await messageBroker().sendMessage('putActivityLog', {
    data: {
      action: 'putActivityLog',
      data: {
        contentType,
        contentId,
        createdBy: user.clientPortalId,
        action: 'create'
      }
    }
  });
};

export const handleDeviceToken = async (user, deviceToken) => {
  if (deviceToken) {
    const deviceTokens: string[] = user.deviceTokens || [];

    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);

      await user.update({ $set: { deviceTokens } });
    }
  }
};

export const createCard = async (subdomain, models, cpUser, doc) => {
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      _id: cpUser.erxesCustomerId
    },
    isRPC: true
  });

  if (!customer) {
    throw new Error('Customer not registered');
  }

  const {
    type,
    subject,
    description,
    stageId,
    parentId,
    closeDate,
    startDate,
    customFieldsData,
    attachments,
    labelIds,
    productsData
  } = doc;
  let priority = doc.priority;

  if (['High', 'Critical'].includes(priority)) {
    priority = 'Normal';
  }

  const card = await sendCardsMessage({
    subdomain,
    action: `${type}s.create`,
    data: {
      userId: cpUser._id,
      name: subject,
      description,
      priority,
      stageId,
      status: 'active',
      customerId: customer._id,
      createdAt: new Date(),
      stageChangedDate: null,
      parentId,
      closeDate,
      startDate,
      customFieldsData,
      attachments,
      labelIds,
      productsData
    },
    isRPC: true
  });

  await models.ClientPortalUserCards.createOrUpdateCard({
    contentType: type,
    contentTypeId: card._id,
    cpUserId: cpUser._id
  });

  return card;
};
