import { IModels } from '../connectionResolver';
import messageBroker, { sendContactsMessage } from '../messageBroker';

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
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCustomerId: customer._id } }
      );
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
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCompanyId: company._id } }
      );
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
