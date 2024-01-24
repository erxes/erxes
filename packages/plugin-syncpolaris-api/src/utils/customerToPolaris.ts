import { IModels } from '../connectionResolver';
import { sendCommonMessage } from '../messageBroker';
import {
  customFieldToObject,
  getConfig,
  setCustomerCode,
  toPolaris,
} from './utils';

export const customerToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update',
  models: IModels,
) => {
  const config = await getConfig(subdomain, 'POLARIS', {});

  const customer = params.updatedDocument || params.object;
  const customerLog = await models.SyncLogs.findOne({
    contentId: customer._id,
    error: { $exists: false },
  });

  let sendData = {};

  const data = await customFieldToObject(
    subdomain,
    'contacts:customer',
    customer,
  );

  sendData = [
    {
      //main fields
      lastName: data.lastName,
      firstName: data.firstName,

      familyName: data.familyName,
      custSegCode: data.custSegCode,
      isVatPayer: data.isVatPayer,
      sexCode: data.sexCode,
      taxExemption: data.taxExemption,
      status: data.status,
      noCompany: data.noCompany,
      isCompanyCustomer: data.isCompanyCustomer,
      industryId: data.industryId,
      birthPlaceId: data.birthPlaceId,

      shortName: data.shortName,
      shortName2: data.shortName2,
      registerMaskCode: '3',
      registerCode: data.registerCode,
      birthDate: data.birthDate,
      mobile: data.mobile,
      countryCode: data.countryCode,
      email: data.email,
      industryName: data.industryName,
      catId: data.catId,
      ethnicGroupId: data.ethnicGroupId,
      langCode: data.langCode,
      maritalStatus: data.maritalStatus,
      birthPlaceName: data.birthPlaceName,
      birthPlaceDetail: data.birthPlaceDetail,
      phone: data.phone,
      fax: data.fax,
      isBl: data.isBl,
      isPolitical: data.isPolitical,
    },
  ];

  let op = '13610313';
  // if (action === 'create' || !customerLog) op = '13610313';
  // else if (action === 'update') op = '13610315';

  const customerCode = await toPolaris({
    apiUrl: config.apiUrl,
    company: config.companyCode,
    op: op,
    role: config.role,
    token: config.token,
    data: sendData,
  });

  console.log('customerCode', customerCode);

  if (typeof customerCode === 'string') {
    await setCustomerCode(subdomain, customer._id, customerCode);
  }
};

export const companyToPolaris = async (
  subdomain,
  params,
  action: 'create' | 'update',
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
      approvedBy: company.approvedBy,
    },
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
    data: sendData,
  });
};
