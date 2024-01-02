// vendorInsuranceItems

import { paginate } from '@erxes/api-utils/src';
import * as xlsxPopulate from 'xlsx-populate';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { verifyVendor } from '../utils';
import * as path from 'path';
import * as moment from 'moment';

const query = (searchField, searchValue) => {
  const qry: any = {};

  if (!searchField) {
    return qry;
  }

  qry[`searchDictionary.${searchField}`] = {
    $regex: searchValue,
    $options: 'i'
  };

  if (
    ['dealCreatedAt', 'dealCloseDate', 'dealStartDate'].includes(searchField)
  ) {
    const dateValue = new Date(searchValue);
    const searchDate = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate()
    );
    const nextDate = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate() + 1
    );

    qry[`searchDictionary.${searchField}`] = {
      $gte: searchDate,
      $lt: nextDate
    };
  }

  if (searchField.includes('item')) {
    qry[`searchDictionary.${searchField}`] = {
      $gte: Number(searchValue)
    };
  }

  return qry;
};

const queries = {
  insuranceItemList: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue,
      searchField
    }: {
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: any;
      searchField:
        | 'dealNumber'
        | 'dealCreatedAt'
        | 'dealCloseDate'
        | 'dealStartDate'
        | 'customerRegister'
        | 'customerFirstName'
        | 'customerLastName'
        | 'itemPrice'
        | 'itemFeePercent'
        | 'itemTotalFee';
    },
    { models, subdomain }: IContext
  ) => {
    const qry: any = query(searchField, searchValue);

    let sortOrder = 1;

    if (sortDirection === 'DESC') {
      sortOrder = -1;
    }

    const sortQuery = {
      [`searchDictionary.${sortField}`]: sortOrder
    };

    return {
      list: paginate(models.Items.find(qry).sort(sortQuery), {
        page,
        perPage
      }),
      totalCount: models.Products.find(qry).count()
    };
  },

  vendorInsuranceItems: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue,
      searchField
    }: {
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: any;
      searchField:
        | 'dealNumber'
        | 'dealCreatedAt'
        | 'dealCloseDate'
        | 'dealStartDate'
        | 'customerRegister'
        | 'customerFirstName'
        | 'customerLastName'
        | 'itemPrice'
        | 'itemFeePercent'
        | 'itemTotalFee';
    },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

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

    const vendorUsers = await sendCommonMessage({
      subdomain,
      action: 'clientPortalUsers.find',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: [],
      data: {
        clientPortalId: user.clientPortalId
      }
    });

    const vendorUserIds = vendorUsers.map((u: any) => u._id);

    const qry: any = query(searchField, searchValue);

    if (vendorUserIds.length > 0) {
      qry.vendorUserId = { $in: vendorUserIds };
    }

    let sortOrder = 1;

    if (sortDirection === 'DESC') {
      sortOrder = -1;
    }

    const sortQuery = {
      [`searchDictionary.${sortField}`]: sortOrder
    };

    return {
      list: paginate(models.Items.find(qry).sort(sortQuery), {
        page,
        perPage
      }),
      totalCount: models.Items.find(qry).count()
    };
  },

  insuranceItems: async (_root, _args, { models }: IContext) => {
    return models.Items.find({});
  },

  vendorInsuranceItem: async (
    _root,
    { _id }: { _id: string },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const { company, clientportal } = await verifyVendor({
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

    const item = await models.Items.findOne({ _id });

    if (!item) {
      throw new Error('Item not found');
    }

    if (!users.map((u: any) => u._id).includes(item.vendorUserId)) {
      throw new Error('Item not found');
    }

    return item;
  },

  vendorInsuranceItemsInfo: async (
    _root,
    _args,
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

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

    const categories = await models.Categories.find({});
    const totalItemsCountOfCompany = await models.Items.find({
      vendorUserId: { $in: userIds }
    }).countDocuments();

    const result: any = [];

    for (const cat of categories) {
      const productIds = await models.Products.find({
        categoryId: cat._id
      }).distinct('_id');

      const items: any = await models.Items.find({
        productId: { $in: productIds },
        vendorUserId: { $in: userIds }
      });

      let totalFee = 0;

      if (items.length !== 0) {
        totalFee = items.reduce(
          (acc, obj) => acc + obj.searchDictionary.itemTotalFee,
          0
        );
      }

      const itemsCount = items.length;

      result.push({
        categoryId: cat._id,
        categoryName: cat.name,
        itemsCount,
        percent: Math.round((itemsCount / totalItemsCountOfCompany) * 100),
        totalFee
      });
    }

    return result;
  },

  vendorItemsExport: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue,
      searchField,
      categoryId
    }: {
      categoryId: string;
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: any;
      searchField:
        | 'dealNumber'
        | 'dealCreatedAt'
        | 'dealCloseDate'
        | 'dealStartDate'
        | 'customerRegister'
        | 'customerFirstName'
        | 'customerLastName'
        | 'itemPrice'
        | 'itemFeePercent'
        | 'itemTotalFee';
    },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }
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
      const mark = item.customFieldsData.find(
        f => f.field === fieldIdsMap.modelName
      );
      const archiveNumber = item.customFieldsData.find(
        f => f.field === fieldIdsMap.archiveNumber
      );
      const plateNumber = item.customFieldsData.find(
        f => f.field === fieldIdsMap.plateNumber
      );
      const colorName = item.customFieldsData.find(
        f => f.field === fieldIdsMap.colorName
      );
      const buildYear = item.customFieldsData.find(
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
    // const filePath = path.join(__dirname, `../../../../public/${name}`);
    const publicDir = path.join('./public');
    const filePath = path.join(publicDir, name);

    await wb.toFileAsync(filePath);

    const domain = process.env.DOMAIN
      ? `${process.env.DOMAIN}/gateway`
      : 'http://localhost:4000';

    return `${domain}/pl:insurance/download?name=${name}`;
  }
};

export default queries;
