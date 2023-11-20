import { sendCommonMessage } from '../../messageBroker';

export const verifyVendor = async context => {
  const { subdomain, cpUser } = context;

  const user = await sendCommonMessage({
    subdomain,
    action: 'clientPortalUsers.findOne',
    serviceName: 'clientportal',
    isRPC: true,
    defaultValue: undefined,
    data: {
      _id: cpUser.userId
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const clientportal = await sendCommonMessage({
    subdomain,
    action: 'clientPortals.findOne',
    serviceName: 'clientportal',
    isRPC: true,
    defaultValue: undefined,
    data: {
      _id: user.clientPortalId
    }
  });

  if (!clientportal) {
    throw new Error("User's clientportal not found");
  }

  if (clientportal.kind !== 'vendor') {
    throw new Error('User is not vendor');
  }

  if (!user.erxesCompanyId) {
    throw new Error('User does not assigned to any company');
  }

  const company = await sendCommonMessage({
    subdomain,
    action: 'companies.findOne',
    serviceName: 'contacts',
    isRPC: true,
    data: {
      _id: user.erxesCompanyId
    }
  });

  if (!company) {
    throw new Error("User's company not found");
  }

  return { user, company, clientportal };
};
