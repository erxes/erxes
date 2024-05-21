import { getEnv, getSubdomain, paginate } from '@erxes/api-utils/src/core';
import redis from '@erxes/api-utils/src/redis';
import { IAttachment } from '@erxes/api-utils/src/types';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';

import * as tmp from 'tmp';
import * as xlsxPopulate from 'xlsx-populate';
import { sendCommonMessage } from '../../messageBroker';
import { query } from './queries/items';

export const verifyVendor = async (context) => {
  const { subdomain, cpUser } = context;

  const user = await sendCommonMessage({
    subdomain,
    action: 'clientPortalUsers.findOne',
    serviceName: 'clientportal',
    isRPC: true,
    defaultValue: undefined,
    data: {
      _id: cpUser.userId,
    },
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
      _id: user.clientPortalId,
    },
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
      _id: user.erxesCompanyId,
    },
  });

  if (!company) {
    throw new Error("User's company not found");
  }

  return { user, company, clientportal };
};

export const buildFileMain = async (models, subdomain, args) => {
  const {
    searchField,
    searchValue,
    sortField,
    sortDirection,
    categoryId,
    category,
    page,
    perPage,
    startDate,
    endDate,
  } = args;

  const catId = categoryId || category;

  const productIDs = await models.Products.find({
    categoryId: catId,
  }).distinct('_id');

  const qry: any = query(searchField, searchValue);

  qry.productId = { $in: productIDs };

  let sortOrder = 1;

  if (sortDirection === 'DESC') {
    sortOrder = -1;
  }

  const sortQuery = {
    [`searchDictionary.${sortField}`]: sortOrder,
  };

  if (startDate && endDate) {
    qry['searchDictionary.dealCreatedAt'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const items = await paginate(models.Items.find(qry).sort(sortQuery), {
    page,
    perPage,
  });

  const formFields = await sendCommonMessage({
    subdomain,
    action: 'fields.find',
    serviceName: 'forms',
    isRPC: true,
    defaultValue: [],
    data: {
      query: {
        contentType: 'insurance:item',
      },
    },
  });

  const fieldCodes = [
    'archiveNumber',
    'plateNumber',
    'modelName',
    'colorName',
    'buildYear',
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
    'Хамгаалалтын төрөл',
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
      border: true,
    });
  });

  items.forEach((item, index) => {
    const fullName = `${item.searchDictionary.customerLastName || ''} ${
      item.searchDictionary.customerFirstName || ''
    }`;

    const customFieldsData = item.customFieldsData || [];

    const mark = customFieldsData.find(
      (f) => f.field === fieldIdsMap.modelName
    );
    const archiveNumber = customFieldsData.find(
      (f) => f.field === fieldIdsMap.archiveNumber
    );
    const plateNumber = customFieldsData.find(
      (f) => f.field === fieldIdsMap.plateNumber
    );
    const colorName = customFieldsData.find(
      (f) => f.field === fieldIdsMap.colorName
    );
    const buildYear = customFieldsData.find(
      (f) => f.field === fieldIdsMap.buildYear
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
      'premium',
    ];

    row.forEach((value, idx) => {
      ws.cell(index + 2, idx + 1).value(value);
      ws.cell(index + 2, idx + 1).style({
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        wrapText: true,
        border: true,
      });
    });
  });

  const name = `items-${moment().format('YYYY-MM-DD-hh-mm')}.xlsx`;

  return {
    name,
    response: await wb.outputAsync(),
  };
};

export const buildFile = async (models, subdomain, cpUser, args) => {
  const {
    searchField,
    searchValue,
    sortField,
    sortDirection,
    categoryId,
    category,
    page,
    perPage,
    startDate,
    endDate,
  } = args;

  const { company } = await verifyVendor({
    subdomain,
    cpUser,
  });

  const users = await sendCommonMessage({
    subdomain,
    action: 'clientPortalUsers.find',
    serviceName: 'clientportal',
    isRPC: true,
    defaultValue: [],
    data: {
      erxesCompanyId: company._id,
    },
  });

  const userIds = users.map((u: any) => u._id);

  const catId = categoryId || category;

  const productIDs = await models.Products.find({
    categoryId: catId,
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
    [`searchDictionary.${sortField}`]: sortOrder,
  };

  if (startDate && endDate) {
    qry['searchDictionary.dealCreatedAt'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const items = await paginate(models.Items.find(qry).sort(sortQuery), {
    page,
    perPage,
  });

  const formFields = await sendCommonMessage({
    subdomain,
    action: 'fields.find',
    serviceName: 'forms',
    isRPC: true,
    defaultValue: [],
    data: {
      query: {
        contentType: 'insurance:item',
      },
    },
  });

  const fieldCodes = [
    'archiveNumber',
    'plateNumber',
    'modelName',
    'colorName',
    'buildYear',
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
    'Хамгаалалтын төрөл',
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
      border: true,
    });
  });

  items.forEach((item, index) => {
    const fullName = `${item.searchDictionary.customerLastName || ''} ${
      item.searchDictionary.customerFirstName || ''
    }`;

    const customFieldsData = item.customFieldsData || [];

    const mark = customFieldsData.find(
      (f) => f.field === fieldIdsMap.modelName
    );
    const archiveNumber = customFieldsData.find(
      (f) => f.field === fieldIdsMap.archiveNumber
    );
    const plateNumber = customFieldsData.find(
      (f) => f.field === fieldIdsMap.plateNumber
    );
    const colorName = customFieldsData.find(
      (f) => f.field === fieldIdsMap.colorName
    );
    const buildYear = customFieldsData.find(
      (f) => f.field === fieldIdsMap.buildYear
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
      'premium',
    ];

    row.forEach((value, idx) => {
      ws.cell(index + 2, idx + 1).value(value);
      ws.cell(index + 2, idx + 1).style({
        horizontalAlignment: 'center',
        verticalAlignment: 'center',
        wrapText: true,
        border: true,
      });
    });
  });

  const name = `vendor-insurance-items-${moment().format(
    'YYYY-MM-DD-hh-mm'
  )}.xlsx`;

  return {
    name,
    response: await wb.outputAsync(),
  };
};

export const generateContract = async (
  models,
  subdomain,
  item,
  product,
  vendor
) => {
  let document;
  const category = await models.Categories.findOne({ _id: product.categoryId });

  if (!category) {
    throw new Error('Category not found');
  }

  let categoryCode = category.code;
  let printId = categoryCode;

  if (categoryCode === 'vehicle' || categoryCode.includes('vehicle')) {
    categoryCode = 'vehicle';
    printId = 'vehicle';
  }

  if (categoryCode === 'travel' || categoryCode.includes('travel')) {
    categoryCode = 'travel';
    printId = 'travel';
  }

  if (vendor.code || vendor.code.length > 0) {
    printId = `${categoryCode}_${vendor.code}`;
  }

  document = await sendCommonMessage({
    subdomain,
    serviceName: 'documents',
    action: 'findOne',
    isRPC: true,
    data: {
      $or: [{ code: printId }, { code: categoryCode }],
    },
    defaultValue: null,
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const risks = await models.Risks.find({
    _id: { $in: category.riskIds },
  }).lean();

  const deal = await sendCommonMessage({
    serviceName: 'cards',
    subdomain,
    action: 'deals.findOne',
    isRPC: true,
    defaultValue: null,
    data: { _id: item.dealId },
  });

  const customer = await sendCommonMessage({
    serviceName: 'contacts',
    subdomain,
    action: 'customers.findOne',
    isRPC: true,
    defaultValue: null,
    data: { _id: item.customerId },
  });

  const itemFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'insurance:item',
    },
    defaultValue: [],
  });
  //   return fields.map((f) => ({ value: f.name, name: f.label }));

  const productFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'insurance:product',
    },
    defaultValue: [],
  });

  const dealFields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.fieldsCombinedByContentType',
    isRPC: true,
    data: {
      contentType: 'cards:deal',
    },
    defaultValue: [],
  });

  const fields = [...itemFields, ...productFields, ...dealFields].map((f) => ({
    value: f.name,
    name: f.label,
  }));

  fields.push({
    value: 'insuranceProductName',
    name: 'Insurance product Name',
  });
  fields.push({ value: 'insuranceRisks', name: 'Insurance risks' });
  fields.push({ value: 'insuranceCategoryName', name: 'Insurance category' });
  fields.push({ value: 'price', name: 'Price' });
  fields.push({ value: 'feePercent', name: 'Fee percent' });
  fields.push({ value: 'totalFee', name: 'Total fee' });

  fields.push({ value: 'dealNumber', name: 'Deal number' });
  fields.push({ value: 'dealCreatedAt', name: 'Deal created at' });
  fields.push({ value: 'dealStartDate', name: 'Deal start date' });
  fields.push({ value: 'dealCloseDate', name: 'Deal close date' });

  fields.push({ value: 'customers', name: 'Customers' });
  fields.push({ value: 'companies', name: 'Companies' });

  let replacedContent: any = document.content || {};

  ['price', 'feePercent', 'totalFee'].forEach((field) => {
    replacedContent = replacedContent.replace(
      new RegExp(`{{ ${field} }}`, 'g'),
      item[field] || ''
    );
  });

  if (replacedContent.includes(`{{ insuranceProductName }}`)) {
    if (product) {
      replacedContent = replacedContent.replace(
        /{{ insuranceProductName }}/g,
        product.name || 'product name undefined'
      );
    }
  }

  if (replacedContent.includes(`{{ insuranceCategoryName }}`)) {
    if (category) {
      replacedContent = replacedContent.replace(
        /{{ insuranceCategoryName }}/g,
        category.name || 'category name undefined'
      );
    }
  }

  if (replacedContent.includes(`{{ insuranceRisks }}`)) {
    if (risks) {
      replacedContent = replacedContent.replace(
        /{{ insuranceRisks }}/g,
        risks.map((r) => r.name).join(', ')
      );
    }
  }

  // TODO: getCustomers
  // if (replacedContent.includes('{{ customers }}')) {
  //   const customers = await getCustomers(subdomain, item.dealId);

  //   const customerRows: string[] = [];

  //   for (const item of customers) {
  //     const name = await sendCommonMessage({
  //       serviceName: 'contacts',
  //       subdomain,
  //       action: 'customers.getCustomerName',
  //       data: { customer: item },
  //       isRPC: true,
  //       defaultValue: '',
  //     });

  //     customerRows.push(name);
  //   }

  //   replacedContent = replacedContent.replace(
  //     /{{ customers }}/g,
  //     customerRows.join(','),
  //   );
  // }
  // TODO: getCompanies
  // if (replacedContent.includes('{{ companies }}')) {
  //   const companies = await getCompanies(subdomain, item.dealId);

  //   const companyRows: string[] = [];

  //   for (const item of companies) {
  //     const name = await sendCommonMessage({
  //       serviceName: 'contacts',
  //       subdomain,
  //       action: 'companies.getCompanyName',
  //       data: { company: item },
  //       isRPC: true,
  //       defaultValue: '',
  //     });

  //     companyRows.push(name);
  //   }

  //   replacedContent = replacedContent.replace(
  //     /{{ companies }}/g,
  //     companyRows.join(','),
  //   );
  // }

  if (replacedContent.includes('{{ dealNumber }}')) {
    replacedContent = replacedContent.replace(
      /{{ dealNumber }}/g,
      deal.number || ''
    );
  }

  if (replacedContent.includes('{{ dealCreatedAt }}')) {
    replacedContent = replacedContent.replace(
      /{{ dealCreatedAt }}/g,
      deal.createdAt || ''
    );
  }

  if (replacedContent.includes('{{ dealStartDate }}')) {
    replacedContent = replacedContent.replace(
      /{{ dealStartDate }}/g,
      deal.startDate || ''
    );
  }

  if (replacedContent.includes('{{ dealCloseDate }}')) {
    replacedContent = replacedContent.replace(
      /{{ dealCloseDate }}/g,
      deal.closeDate || ''
    );
  }

  if (customer) {
    [
      'customer_primaryPhone',
      'customer_primaryEmail',
      'customer_firstName',
      'customer_lastName',
      'customer_middleName',
      'customer_code',
    ].forEach((field) => {
      const f = field.replace('customer_', '');
      replacedContent = replacedContent.replace(
        new RegExp(`{{ ${field} }}`, 'g'),
        customer[f] || ''
      );
    });
  }

  if (item.customFieldsData) {
    for (const customFieldData of item.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.value
      );
    }
  }

  if (product.customFieldsData) {
    for (const customFieldData of product.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.value
      );
    }
  }

  if (deal.customFieldsData) {
    for (const customFieldData of deal.customFieldsData) {
      replacedContent = replacedContent.replace(
        new RegExp(`{{ customFieldsData.${customFieldData.field} }}`, 'g'),
        customFieldData.stringValue
      );
    }
  }

  for (const field of fields) {
    const propertyNames = field.value.includes('.')
      ? field.value.split('.')
      : [field.value];
    let propertyValue = item;

    for (const propertyName in propertyNames) {
      propertyValue = propertyValue[propertyName] || propertyValue;
    }

    replacedContent = replacedContent.replace(
      new RegExp(` {{ ${field.value} }} `, 'g'),
      propertyValue || ''
    );
  }

  if (replacedContent.includes('{{')) {
    replacedContent = replacedContent.replace(/{{[^}]+}}/g, '');
  }

  const contract: IAttachment | any = await generatePdf(
    subdomain,
    replacedContent,
    deal.number
  );

  // push contract to item.contracts
  await models.Items.updateOne(
    { _id: item._id },
    { $push: { contracts: { ...contract, date: new Date() } } }
  );
};

const generatePdf = async (subdomain, content, dealNumber) => {
  const injectedHtml = content.replace(
    /<head>/i,
    `<head>\n<meta charset="UTF-8">`
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    // executablePath:
    //   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=mn-MN,mn'],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'mn',
  });

  await page.setContent(injectedHtml, { waitUntil: 'domcontentloaded' });
  await page.emulateMediaType('screen');

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();

  // const buffer:any = await createPdfBuffer(content);
  // const buffer: any = await HTMLtoDOCX(content)

  const DOMAIN = getEnv({
    name: 'DOMAIN',
    subdomain,
    defaultValue: 'http://localhost:4000',
  });

  const uploadUrl = DOMAIN.includes('https')
    ? `${DOMAIN}/gateway/pl:core/upload-file`
    : `${DOMAIN}/pl:core/upload-file`;

  const form = new FormData();

  const tmpFile = tmp.fileSync({
    postfix: '.pdf',
    name: `${dealNumber}.pdf`,
  });
  fs.writeFileSync(tmpFile.name, pdf);

  const fileStream = fs.createReadStream(tmpFile.name);
  const fileSize = fs.statSync(tmpFile.name).size;
  form.append('file', fileStream);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
  });

  const result = await response.text();

  tmp.setGracefulCleanup();
  fs.unlinkSync(tmpFile.name);

  return {
    url: result,
    size: fileSize,
    type: 'application/pdf',
    name: `${dealNumber}.pdf`,
  };
};

export default async function userMiddleware(req: any, _res: any, next: any) {
  const subdomain = getSubdomain(req);

  if (!req.cookies) {
    return next();
  }

  const token = req.cookies['auth-token'];

  if (!token) {
    return next();
  }

  try {
    // verify user token and retrieve stored user information
    const { user }: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET || '');

    const userDoc = await sendCommonMessage({
      serviceName: 'core',
      subdomain,
      action: 'users.findOne',
      data: {
        _id: user._id,
      },
      isRPC: true,
    });

    if (!userDoc) {
      return next();
    }

    const validatedToken = await redis.get(`user_token_${user._id}_${token}`);

    // invalid token access.
    if (!validatedToken) {
      return next();
    }

    // save user in request
    req.user = user;
    req.user.loginToken = token;
    req.user.sessionCode = req.headers.sessioncode || '';
  } catch (e) {
    console.error(e);
  }

  return next();
}
