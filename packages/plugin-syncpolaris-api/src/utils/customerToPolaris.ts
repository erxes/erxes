import { getConfig, toPolaris } from './utils';

export const customerToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update'
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const customer = params.updatedDocument || params.object;
  let sendData = {};

  sendData = [
    {
      custSegCode: customer.custSegCode,
      isVatPayer: customer.isVatPayer,
      sexCode: customer.sexCode,
      taxExemption: customer.taxExemption,
      status: customer.status,
      noCompany: customer.noCompany,
      isCompanyCustomer: customer.isCompanyCustomer,
      industryId: customer.industryId,
      birthPlaceId: customer.birthPlaceId,
      dynamicData: customer.dynamicData,
      familyName: customer.familyName,
      familyName2: customer.familyName2,
      lastName: customer.lastName,
      lastName2: customer.lastName2,
      firstName: customer.firstName,
      firstName2: customer.firstName2,
      shortName: customer.shortName,
      shortName2: customer.shortName2,
      registerMaskCode: customer.registerMaskCode,
      registerCode: customer.registerCode,
      birthDate: customer.birthDate,
      mobile: customer.mobile,
      countryCode: customer.countryCode,
      email: customer.email,
      industryName: customer.industryName,
      catId: customer.catId,
      ethnicGroupId: customer.ethnicGroupId,
      langCode: customer.langCode,
      maritalStatus: customer.maritalStatus,
      birthPlaceName: customer.birthPlaceName,
      birthPlaceDetail: customer.birthPlaceDetail,
      phone: customer.phone,
      fax: customer.fax,
      isBl: customer.isBl,
      isPolitical: customer.isPolitical
    }
  ];

  let op = '';
  if (action === 'create') op = '13610313';
  else if (action === 'update') op = '13610315';

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData
  });
};

export const companyToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update'
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});
  const company = params.updatedDocument || params.object;

  const sendData = [
    {
      status: company.status,
      isCompanyCustomer: company.isCompanyCustomer,
      foundedDate: company.foundedDate,
      industryId: company.industryId,
      dynamicData: company.dynamicData,
      custCode: company.custCode,
      name: company.name,
      orgTypeId: company.orgTypeId,
      registerMaskCode: company.registerMaskCode,
      shortName: company.shortName,
      industryName: company.industryName,
      name2: company.name2,
      custSegCode: company.custSegCode,
      registerCode: company.registerCode,
      shortName2: company.shortName2,
      countryCode: company.countryCode,
      phone: company.phone,
      email: company.email,
      createdBy: company.createdBy,
      approvedBy: company.approvedBy
    }
  ];

  let op = '';
  if (action === 'create') op = '13610314';
  else if (action === 'update') op = '13610316';

  toPolaris({
    apiUrl: config.apiUrl,
    company: config.company,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData
  });
};
