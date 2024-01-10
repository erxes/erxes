import { paginate } from '@erxes/api-utils/src/core';
import { sendCommonMessage } from '../../messageBroker';
import { query } from './queries/items';

import * as xlsxPopulate from 'xlsx-populate';
import * as moment from 'moment';
import * as path from 'path';

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

export const buildFile = async (models, subdomain, cpUser, args) => {
  const {
    searchField,
    searchValue,
    sortField,
    sortDirection,
    categoryId,
    page,
    perPage
  } = args;

  const { company } = await verifyVendor({
    subdomain,
    cpUser
  });

  const users = await sendCommonMessage({
    subdomain,
    action: 'clientPortalUsers.find',
    serviceName: 'clientportal',
    isRPC: true,
    defaultValue: [],
    data: {
      erxesCompanyId: company._id
    }
  });

  const userIds = users.map((u: any) => u._id);

  const productIDs = await models.Products.find({
    categoryId
  }).distinct('_id');

  const qry: any = query(searchField, searchValue);

  qry.productId = { $in: productIDs };

  if (userIds.length > 0) {
    qry.vendorUserId = { $in: userIds };
  }

  let sortOrder = 1;

  if (sortDirection === 'DESC') {
    sortOrder = -1;
  }

  const sortQuery = {
    [`searchDictionary.${sortField}`]: sortOrder
  };

  const items = await paginate(models.Items.find(qry).sort(sortQuery), {
    page,
    perPage
  });

  const formFields = await sendCommonMessage({
    subdomain,
    action: 'fields.find',
    serviceName: 'forms',
    isRPC: true,
    defaultValue: [],
    data: {
      query: {
        contentType: 'insurance:item'
      }
    }
  });

  const fieldCodes = [
    'archiveNumber',
    'plateNumber',
    'modelName',
    'colorName',
    'buildYear'
    // 'importDate',
  ];

  const fieldIdsMap: any = {};

  formFields.forEach((f: any) => {
    if (fieldCodes.includes(f.code)) {
      fieldIdsMap[f.code] = f._id;
    }
  });

  const wb = await xlsxPopulate.fromBlankAsync();
  const ws = wb.sheet(0);
  ws.name('гэрээний жагсаалт');

  const headers = [
    'Баталгааны дугаар',
    'Регистерийн дугаар',
    'Овог',
    'Нэр',
    'Гэрээний огноо',
    'Да.Эхлэх огноо',
    'Да.Дуусах огноо',
    'Үнэлгээ',
    'Хураамжийн хувь',
    'Нийт хураамж',
    'Тайлбар',
    'Гэрээний дугаар (Хорооны)',
    'Үнэт цаасны №',
    'Даатгуулагчийн овог, нэр',
    'Регистрийн №',
    'Жол.Үнэмлэх №',
    'Утас',
    'И-мэйл',
    'Эзэмшигчийн нэр',
    'Марк',
    'Улсын дугаар',
    'Үйлдвэрлэсэн он',
    'Аралын дугаар',
    'ТХ-ийн гэрчилгээний дугаар',
    'ТХ-ийн өнгө',
    'Хамгаалалтын төрөл'
  ];

  headers.forEach((header, idx) => {
    ws.cell(1, idx + 1).value(header);
    ws.cell(1, idx + 1).style({
      fill: 'F2F2F2',
      fontColor: '000000',
      bold: true,
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      wrapText: true,
      border: true
    });
  });

  items.forEach((item, index) => {
    const fullName = `${item.searchDictionary.customerLastName || ''} ${item
      .searchDictionary.customerFirstName || ''}`;

    const customFieldsData = item.customFieldsData || [];

    const mark = customFieldsData.find(f => f.field === fieldIdsMap.modelName);
    const archiveNumber = customFieldsData.find(
      f => f.field === fieldIdsMap.archiveNumber
    );
    const plateNumber = customFieldsData.find(
      f => f.field === fieldIdsMap.plateNumber
    );
    const colorName = customFieldsData.find(
      f => f.field === fieldIdsMap.colorName
    );
    const buildYear = customFieldsData.find(
      f => f.field === fieldIdsMap.buildYear
    );

    const row = [
      item.searchDictionary.dealNumber,
      item.searchDictionary.customerRegister,
      item.searchDictionary.customerFirstName,
      item.searchDictionary.customerLastName,
      moment(item.searchDictionary.dealCreatedAt).format('YYYY.MM.DD'),
      moment(item.searchDictionary.dealStartDate).format('YYYY.MM.DD'),
      moment(item.searchDictionary.dealCloseDate).format('YYYY.MM.DD'),
      item.searchDictionary.itemPrice,
      item.searchDictionary.itemFeePercent,
      item.searchDictionary.itemTotalFee,
      '',
      item.searchDictionary.dealNumber,
      '',
      fullName,
      item.searchDictionary.customerRegister,
      '',
      'phone',
      'email',
      fullName,
      mark ? mark.value : '-',
      plateNumber ? plateNumber.value : '-',
      buildYear ? buildYear.value : '-',
      archiveNumber ? archiveNumber.value : '-',
      '',
      colorName ? colorName.value : '-',
      'premium'
    ];

    row.forEach((value, idx) => {
      ws.cell(index + 2, idx + 1).value(value);
      ws.cell(index + 2, idx + 1).style({
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        wrapText: true,
        border: true
      });
    });
  });

  const name = `vendor-insurance-items-${moment().format(
    'YYYY-MM-DD-hh-mm'
  )}.xlsx`;

  return {
    name,
    response: await wb.outputAsync()
  };
};
