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
      lastName: data.lastName ?? null,
      firstName: data.firstName ?? null,

      familyName: data.familyName ?? null,
      custSegCode: data.custSegCode ?? null,
      isVatPayer: data.isVatPayer ?? null,
      sexCode: data.sexCode ?? null,
      taxExemption: data.taxExemption ?? null,
      status: data.status ?? null,
      noCompany: data.noCompany ?? null,
      isCompanyCustomer: data.isCompanyCustomer ?? null,
      industryId: data.industryId ?? null,
      birthPlaceId: data.birthPlaceId ?? null,

      shortName: data.shortName ?? null,
      shortName2: data.shortName2 ?? null,
      registerMaskCode: '3' ?? null,
      registerCode: data.registerCode ?? null,
      birthDate: data.birthDate ?? null,
      mobile: data.mobile ?? null,
      countryCode: data.countryCode ?? null,
      email: data.email ?? null,
      industryName: data.industryName ?? null,
      catId: data.catId ?? null,
      ethnicGroupId: data.ethnicGroupId ?? null,
      langCode: data.langCode ?? null,
      maritalStatus: data.maritalStatus ?? null,
      birthPlaceName: data.birthPlaceName ?? null,
      birthPlaceDetail: data.birthPlaceDetail ?? null,
      phone: data.phone ?? null,
      fax: data.fax ?? null,
      isBl: data.isBl ?? null,
      isPolitical: data.isPolitical ?? null,
    },
  ];

  let op = '13610313';
  // if (action === 'create' || !customerLog) op = '13610313';
  // else if (action === 'update') op = '13610315';

  console.log('sendData', sendData);

  const customerCode = await toPolaris({
    subdomain,
    op: op,
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
    subdomain,
    op: op,
    data: sendData,
  });
};
