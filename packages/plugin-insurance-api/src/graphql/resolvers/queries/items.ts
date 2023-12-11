// vendorInsuranceItems

import { paginate } from '@erxes/api-utils/src';
import * as xlsxPopulate from 'xlsx-populate';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { verifyVendor } from '../utils';

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
    await verifyVendor({
      subdomain,
      cpUser
    });

    const qry: any = query(searchField, searchValue);

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

    const wb = await xlsxPopulate.fromBlankAsync();
    const ws = wb.addSheet('Insurance Items');
    const header = [
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
  }
};

export default queries;
