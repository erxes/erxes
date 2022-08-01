import { IModels } from '../connectionResolver';
import { sendContactsMessage } from '../messageBroker';

export interface IContactsParams {
  subdomain: string;
  models: IModels;
  clientPortalId: string;
  document: any;
  password?: string;
  customerState?: string;
}

export const handleContacts = async (args: IContactsParams) => {
  const {
    subdomain,
    models,
    clientPortalId,
    document,
    password,
    customerState
  } = args;
  const { type = 'customer' } = document;

  console.log('customerState: ', customerState);

  const tEmail = (document.email || '').toLowerCase().trim();

  let qry: any = { type };
  let user: any;

  if (document.email) {
    qry = { email: tEmail };
    document.email = tEmail;
  }

  if (document.phone) {
    qry = { phone: document.phone };
    document.phone = document.phone;
  }

  if (type === 'customer') {
    let customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryEmail: document.email,
        customerPrimaryPhone: document.phone
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
          primaryEmail: document.email,
          primaryPhone: document.phone,
          state: customerState || 'lead'
        },
        isRPC: true
      });
    }

    if (customer && customer._id) {
      if (customer.state !== customerState) {
        await sendContactsMessage({
          subdomain,
          action: 'customers.updateCustomer',
          data: {
            _id: customer._id,
            doc: { state: customerState }
          },
          isRPC: true
        });
      }

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
        companyPrimaryEmail: document.email,
        companyPrimaryPhone: document.phone,
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
          primaryEmail: document.email,
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
