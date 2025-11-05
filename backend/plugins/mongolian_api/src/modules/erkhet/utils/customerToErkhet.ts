import { getCompanyInfo, toErkhet } from './utils';

export const customerToErkhet = async (
  models,
  mainConfig,
  syncLog,
  params,
  action,
) => {
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
  name = name ? name : mainConfig.customerDefaultName;

  sendData = {
    action,
    oldCode: oldCustomer.code || customer.code || '',
    object: {
      code: customer.code || '',
      name,
      defaultCategory: (mainConfig.customerCategoryCode || '').toString(),
      email: customer.primaryEmail || '',
      phone: customer.primaryPhone || '',
    },
  };

  toErkhet(models, syncLog, mainConfig, sendData, 'customer-change');
};

export const validCompanyCode = async (config, companyCode) => {
  let result = '';
  if (
    !config ||
    !config.checkCompanyUrl ||
    !config.checkCompanyUrl.includes('http')
  ) {
    return result;
  }

  const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)|(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/gui;

  if (re.test(companyCode)) {
    const response = await getCompanyInfo({checkTaxpayerUrl: config.checkCompanyUrl, no: companyCode})

    if (response.status === 'checked' && response.tin) {
      result = response.result?.data?.name;
    }
  }
  return result;
};

export const companyToErkhet = async (
  models,
  mainConfig,
  syncLog,
  params,
  action,
) => {
  const company = params.updatedDocument || params.object;

  const oldCompany = params.object;

  const sendData = {
    action,
    oldCode: oldCompany.code || company.code || '',
    object: {
      code: company.code || '',
      name: company.primaryName,
      defaultCategory: mainConfig.companyCategoryCode,
      email: company.primaryEmail || '',
      phone: company.primaryPhone || '',
    },
  };

  toErkhet(models, syncLog, mainConfig, sendData, 'customer-change');
};
