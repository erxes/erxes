import { IModels } from '../connectionResolver';
import { sendContactsMessage } from '../messageBroker';

export interface IContactsParams {
  subdomain: string;
  models: IModels;
  clientPortalId: string;
  document: any;
  password?: string;
}

export const handleContacts = async (args: IContactsParams) => {
  const { subdomain, models, clientPortalId, document, password } = args;
  const { type = 'customer', email, phone } = document;

  const tEmail = (email || '').toLowerCase().trim();

  let qry: any = { type };
  let user: any;

  if (email) {
    qry = { email: tEmail };
    document.email = tEmail;
  }

  if (phone) {
    qry = { phone };
    document.phone = phone;
  }

  if (type === 'customer') {
    let customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryEmail: email,
        customerPrimaryPhone: phone
      },
      isRPC: true
    });

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

    if (!customer) {
      customer = await sendContactsMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: {
          firstName: document.firstName,
          lastName: document.lastName,
          primaryEmail: email,
          primaryPhone: phone,
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
        companyPrimaryEmail: email,
        companyPrimaryPhone: phone,
        companyCode: document.companyRegistrationNumber
      },
      isRPC: true
    });

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
          primaryEmail: email,
          primaryPhone: phone,
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
