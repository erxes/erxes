import { IContactsParams } from '@/portal/@types/user';
import { random } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const handleContacts = async (args: IContactsParams) => {
  const {
    models,
    clientPortalId,
    document,
    password = random('Aa0!', 8),
  } = args;
  const { type = 'customer' } = document;
  const trimmedMail = (document.email || '').toLowerCase().trim();
  const phone = document.phone;

  let qry: any = {
    clientPortalId,
    ...(phone ? { phone } : {}),
    ...(document.email && !phone ? { email: trimmedMail } : {}),
  };

  let user: any;

  if (type === 'customer') {
    const customer = await findOrCreateCustomer(trimmedMail, phone, document);
    qry = { erxesCustomerId: customer._id, clientPortalId };

    user = await models.Users.findOne(qry);
    if (user) {
      throw new Error('user is already exists');
    }

    user = await createUser(models, document, password, clientPortalId);
    await linkCustomerToUser(models, user._id, customer._id);

    // TODO: fix
    // for (const serviceName of await getServices()) {
    //   const serviceConfig = await getService(serviceName);

    //   if (serviceConfig.config?.meta?.hasOwnProperty('cpCustomerHandle')) {
    //     if (await isEnabled(serviceName)) {
    //       sendMessage(`${serviceName}:cpCustomerHandle`, {
    //         subdomain,
    //         data: { customer },
    //       });
    //     }
    //   }
    // }
  }

  if (type === 'company') {
    const company = await findOrCreateCompany(trimmedMail, phone, document);

    qry = { erxesCompanyId: company._id, clientPortalId };
    user = await models.Users.findOne(qry);

    if (user && (user.isEmailVerified || user.isPhoneVerified)) {
      throw new Error('user is already exists');
    }

    if (!user) {
      user = await createUser(models, document, password, clientPortalId);
    }

    await linkCompanyToUser(models, user._id, company._id);

    // TODO: fix
    // for (const serviceName of await getServices()) {
    //   const serviceConfig = await getService(serviceName);

    //   if (serviceConfig.config?.meta?.hasOwnProperty('cpCustomerHandle')) {
    //     if (await isEnabled(serviceName)) {
    //       sendMessage(`${serviceName}:cpCustomerHandle`, {
    //         subdomain,
    //         data: { company },
    //       });
    //     }
    //   }
    // }
  }

  return user;
};

// Helpers

const findOrCreateCustomer = async (email: string, phone: string, doc: any) => {
  let customer = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: {
      $or: [{ customerPrimaryEmail: email }, { customerPrimaryPhone: phone }],
    },
  });

  if (!customer) {
    customer = await sendTRPCMessage({
      pluginName: 'core',
      method: 'mutation',
      module: 'customers',
      action: 'createCustomer',
      input: {
        firstName: doc.firstName,
        lastName: doc.lastName,
        primaryEmail: email,
        primaryPhone: phone,
        state: 'lead',
      },
    });
  }

  return customer;
};

const findOrCreateCompany = async (email: string, phone: string, doc: any) => {
  let company = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'companies',
    action: 'findOne',
    input: {
      $or: [{ primaryEmail: email }, { primaryPhone: phone }],
    },
  });

  if (!company) {
    company = await sendTRPCMessage({
      pluginName: 'core',
      method: 'mutation',
      module: 'companies',
      action: 'createCompany',
      input: {
        primaryName: doc.companyName,
        primaryEmail: email,
        primaryPhone: phone,
        code: doc.companyRegistrationNumber,
      },
    });
  }

  return company;
};

const createUser = async (
  models: any,
  doc: any,
  password: string,
  clientPortalId: string,
) => {
  return await models.Users.create({
    ...doc,
    clientPortalId,
    password: password && (await models.Users.generatePassword(password)),
  });
};

const linkCustomerToUser = async (
  models: any,
  userId: string,
  customerId: string,
) => {
  await models.Users.updateOne(
    { _id: userId },
    { $set: { erxesCustomerId: customerId } },
  );
};

const linkCompanyToUser = async (
  models: any,
  userId: string,
  companyId: string,
) => {
  await models.Users.updateOne(
    { _id: userId },
    { $set: { erxesCompanyId: companyId } },
  );
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
