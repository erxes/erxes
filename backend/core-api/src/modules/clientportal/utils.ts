import { random } from 'erxes-api-shared/utils';
import {
  ICPContactsParams,
  ICPUserDocument,
} from '@/clientportal/types/cpUser';
import { getConfig } from '~/modules/organization/settings/utils/configs';

export const handleCPContacts = async (args: ICPContactsParams) => {
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
    let customer = await models.Customers.findOne({
      email: trimmedMail,
      phone,
    });

    if (!customer) {
      customer = await models.Customers.create({
        email: trimmedMail,
        phone,
      });
    }

    qry = { erxesCustomerId: customer._id, clientPortalId };

    user = await models.Users.findOne(qry);
    if (user) {
      throw new Error('user is already exists');
    }

    user = await models.CPUser.create({
      ...document,
      clientPortalId,
      password: password && (await models.CPUser.generatePassword(password)),
    });

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
    let company = await models.Companies.findOne({
      email: trimmedMail,
      phone,
    });

    if (!company) {
      company = await models.Companies.create({
        email: trimmedMail,
        phone,
      });
    }

    qry = { erxesCompanyId: company._id, clientPortalId };
    user = await models.Users.findOne(qry);

    if (user && (user.isEmailVerified || user.isPhoneVerified)) {
      throw new Error('user is already exists');
    }

    if (!user) {
      user = await models.CPUser.create({
        ...document,
        clientPortalId,
        password: password && (await models.CPUser.generatePassword(password)),
      });
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

export const handleCPUserDeviceToken = async (
  cpUser: ICPUserDocument,
  deviceToken: string,
) => {
  if (deviceToken) {
    const deviceTokens: string[] = cpUser.deviceTokens || [];

    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);

      await cpUser.updateOne({ $set: { deviceTokens } });
    }
  }
};
