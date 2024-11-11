import {
  getService,
  getServices,
  isEnabled,
} from '@erxes/api-utils/src/serviceDiscovery';
import { IModels } from '../connectionResolver';
import {
  sendCoreMessage,
  sendPurchasesMessage,
  sendSalesMessage,
  sendTasksMessage,
  sendTicketsMessage,
} from '../messageBroker';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';

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
    let customer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryEmail: trimmedMail,
        customerPrimaryPhone: document.phone,
      },
      isRPC: true,
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
        password && (await models.ClientPortalUsers.generatePassword(password)),
    });

    if (!customer) {
      customer = await sendCoreMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: {
          firstName: document.firstName,
          lastName: document.lastName,
          primaryEmail: trimmedMail,
          primaryPhone: document.phone,
          state: 'lead',
        },
        isRPC: true,
      });
    }

    if (customer && customer._id) {
      user.erxesCustomerId = customer._id;
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCustomerId: customer._id } }
      );

      for (const serviceName of await getServices()) {
        const serviceConfig = await getService(serviceName);

        if (serviceConfig.config?.meta?.hasOwnProperty('cpCustomerHandle')) {
          if (await isEnabled(serviceName)) {
            sendMessage(`${serviceName}:cpCustomerHandle`, {
              subdomain,
              data: { customer },
            });
          }
        }
      }
    }
  }

  if (type === 'company') {
    let company = await sendCoreMessage({
      subdomain,
      action: 'companies.findOne',
      data: {
        companyPrimaryEmail: trimmedMail,
        companyPrimaryPhone: document.phone,
        companyCode: document.companyRegistrationNumber,
      },
      isRPC: true,
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
        password && (await models.ClientPortalUsers.generatePassword(password)),
    });

    if (!company) {
      company = await sendCoreMessage({
        subdomain,
        action: 'companies.createCompany',
        data: {
          primaryName: document.companyName,
          primaryEmail: trimmedMail,
          primaryPhone: document.phone,
          code: document.companyRegistrationNumber,
        },
        isRPC: true,
      });
    }

    if (company && company._id) {
      user.erxesCompanyId = company._id;
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCompanyId: company._id } }
      );

      for (const serviceName of await getServices()) {
        const serviceConfig = await getService(serviceName);

        if (serviceConfig.config?.meta?.hasOwnProperty('cpCustomerHandle')) {
          if (await isEnabled(serviceName)) {
            sendMessage(`${serviceName}:cpCustomerHandle`, {
              subdomain,
              data: { company },
            });
          }
        }
      }
    }
  }

  return user;
};

export const putActivityLog = async (subdomain, user) => {
  let contentType = 'core:customer';
  let contentId = user.erxesCustomerId;

  if (user.type === 'company') {
    contentType = 'core:company';
    contentId = user.erxesCompanyId;
  }

  await sendMessage('putActivityLog', {
    subdomain,
    data: {
      action: 'putActivityLog',
      data: {
        contentType,
        contentId,
        createdBy: user.clientPortalId,
        action: 'create',
      },
    },
  });
};

export const handleDeviceToken = async (user, deviceToken) => {
  if (deviceToken) {
    const deviceTokens: string[] = user.deviceTokens || [];

    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);

      await user.updateOne({ $set: { deviceTokens } });
    }
  }
};

export const createCard = async (subdomain, models, cpUser, doc) => {
  const customer = await sendCoreMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      _id: cpUser.erxesCustomerId,
    },
    isRPC: true,
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
    productsData,
  } = doc;
  let priority = doc.priority;

  if (['High', 'Critical'].includes(priority)) {
    priority = 'Normal';
  }

  let card = {} as any;

  const data = {
    userId: cpUser.userId,
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
    productsData,
  };

  switch (type) {
    case 'deal':
      card = await sendSalesMessage({
        subdomain,
        action: `${type}s.create`,
        data,
        isRPC: true,
      });
      break;

    case 'ticket':
      card = await sendTicketsMessage({
        subdomain,
        action: `${type}s.create`,
        data,
        isRPC: true,
      });
      break;

    case 'task':
      card = await sendTasksMessage({
        subdomain,
        action: `${type}s.create`,
        data,
        isRPC: true,
      });
      break;

    case 'purchase':
      card = await sendPurchasesMessage({
        subdomain,
        action: `${type}s.create`,
        data,
        isRPC: true,
      });
      break;
  }

  await models.ClientPortalUserCards.createOrUpdateCard({
    contentType: type,
    contentTypeId: card._id,
    cpUserId: cpUser.userId,
  });

  return card;
};

export const participantEditRelation = async (
  subdomain,
  models: IModels,
  type,
  cardId,
  oldCpUserIds,
  cpUserIds
) => {
  const userCards = await models.ClientPortalUserCards.find({
    contentType: type,
    contentTypeId: cardId,
  });
  const newCpUsers = cpUserIds.filter(
    (x) => userCards.findIndex((m) => m.cpUserId === x) === -1
  );

  const excludedCpUsers = oldCpUserIds.filter((m) => !cpUserIds.includes(m));

  if (newCpUsers) {
    const docs = newCpUsers.map((d) => ({
      contentType: type,
      contentTypeId: cardId,
      cpUserId: d,
    }));
    await models.ClientPortalUserCards.insertMany(docs);
  }
  if (excludedCpUsers) {
    await models.ClientPortalUserCards.deleteMany({
      contentType: type,
      contentTypeId: cardId,
      cpUserId: { $in: excludedCpUsers },
    });
  }

  return 'ok';
};
