import { sendRequest } from '@erxes/api-utils/src/requests';
import {
  sendContactsMessage,
  sendNotificationsMessage
} from '../messageBroker';
import { getConfig, toErkhet } from './utils';

export const customerToErkhet = async (subdomain, params, action) => {
  const config = await getConfig(subdomain, 'ERKHET', {});

  const customer = params.updatedDocument || params.object;
  const oldCustomer = params.object;
  let sendData = {};

  let name = customer.primaryName || '';

  name =
    name && customer.firstName
      ? name.concat(' - ').concat(customer.firstName || '')
      : name || customer.firstName || '';
  name =
    name && customer.lastName
      ? name.concat(' - ').concat(customer.lastName || '')
      : name || customer.lastName || '';
  name = name ? name : config.customerDefaultName;

  sendData = {
    action,
    oldCode: oldCustomer.code || customer.code || '',
    object: {
      code: customer.code || '',
      name,
      defaultCategory: config.customerCategoryCode.concat(''),
      email: customer.primaryEmail || '',
      phone: customer.primaryPhone || ''
    }
  };

  toErkhet(config, sendData, 'customer-change');
};

export const validCompanyCode = async (config, companyCode) => {
  let result = false;
  const re = new RegExp('(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)', 'gui');

  if (re.test(companyCode)) {
    const response = await sendRequest({
      url: config.checkCompanyUrl,
      method: 'GET',
      params: { regno: companyCode }
    });

    if (response.found) {
      result = response.name;
    }
  }
  return result;
};

export const companyToErkhet = async (subdomain, params, action, user) => {
  const config = await getConfig(subdomain, 'ERKHET', {});
  const company = params.updatedDocument || params.object;
  const companyName = await validCompanyCode(config, company.code);

  if (companyName) {
    if (company.primaryName !== companyName) {
      company.primaryName = companyName;

      await sendContactsMessage({
        subdomain,
        action: 'companies.updateCompany',
        data: {
          _id: company._id,
          doc: {
            company,
            primaryName: companyName,
            names: [companyName]
          }
        },
        isRPC: true
      });
    }
  } else {
    sendNotificationsMessage({
      subdomain,
      action: 'send',
      data: {
        createdUser: user,
        receivers: [user._id],
        title: 'wrong company code',
        content: `Байгууллагын код буруу бөглөсөн байна. "${company.code}"`,
        notifType: 'companyMention',
        link: `/companies/details/${company._id}`,
        action: 'update',
        contentType: 'company',
        contentTypeId: company._id
      },
      defaultValue: true
    });
  }

  const oldCompany = params.object;

  const sendData = {
    action,
    oldCode: oldCompany.code || company.code || '',
    object: {
      code: company.code || '',
      name: company.primaryName,
      defaultCategory: config.companyCategoryCode,
      email: company.primaryEmail || '',
      phone: company.primaryPhone || ''
    }
  };

  toErkhet(config, sendData, 'customer-change');
};
