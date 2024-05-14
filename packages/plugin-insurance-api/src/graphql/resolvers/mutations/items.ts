// vendorAddInsuranceItem

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { IInsuranceItemDocument } from '../../../models/definitions/item';
import { IRiskDocument } from '../../../models/definitions/risks';
import { generateContract, verifyVendor } from '../utils';

const createDealAndItem = async (
  models,
  subdomain,
  doc,
  cpUser,
  company,
  stageId
) => {
  const itemDoc = {
    ...doc,
    vendorUserId: cpUser.userId,
    status: 'active',
  };

  const subject = `Даатгалын гэрээ - ${company.primaryName}`;

  const dealDoc = {
    cpUser,
    doc: {
      type: 'deal',
      subject,
      closeDate: doc.closeDate,
      startDate: doc.startDate,
      customerId: doc.customerId,
      companyId: doc.companyId,
      stageId,
    },
  };

  const deal = await sendCommonMessage({
    subdomain,
    action: 'createCard',
    serviceName: 'clientportal',
    isRPC: true,
    data: dealDoc,
  });

  if (!deal) {
    throw new Error('Deal not created');
  }

  itemDoc.dealId = deal._id;
  itemDoc.feePercent = 0;

  const product = await models.Products.findOne({
    _id: itemDoc.productId,
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const companyProductConfigs = product.companyProductConfigs || [];

  const companyProductConfig = companyProductConfigs.find(
    (config) => config.companyId === company._id
  );

  if (!companyProductConfig) {
    itemDoc.feePercent = product.price;
  } else {
    itemDoc.feePercent = companyProductConfig.specificPrice;
  }

  itemDoc.totalFee = (itemDoc.price / 100) * itemDoc.feePercent;

  const customer = await sendCommonMessage({
    subdomain,
    action: 'customers.findOne',
    serviceName: 'contacts',
    isRPC: true,
    data: { _id: itemDoc.customerId },
    defaultValue: null,
  });

  const searchDictionary = {
    dealNumber: deal.number || '',
    dealCreatedAt: new Date(deal.createdAt),
    dealCloseDate: new Date(deal.closeDate),
    dealStartDate: new Date(deal.startDate),

    customerRegister: (customer && customer.code) || '',
    customerFirstName: (customer && customer.firstName) || '',
    customerLastName: (customer && customer.lastName) || '',

    itemPrice: itemDoc.price,
    itemFeePercent: itemDoc.feePercent,
    itemTotalFee: itemDoc.totalFee,
  };

  itemDoc.searchDictionary = searchDictionary;

  const insuranceItem = await models.Items.createInsuranceItem(itemDoc);

  if (!insuranceItem) {
    throw new Error('Insurance Item not created');
  }

  await generateContract(models, subdomain, insuranceItem, product, company);

  return insuranceItem;
};

const mutations = {
  vendorAddInsuranceItem: async (
    _root,
    { doc },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const { company, clientportal } = await verifyVendor({
      subdomain,
      cpUser,
    });

    const { companyId, customerId, customerIds } = doc;

    if (!companyId && !customerId && (!customerIds || !customerIds.length)) {
      throw new Error('Customer or Company is required');
    }

    if (customerIds && customerIds.length) {
      const items: IInsuranceItemDocument[] = []
      for (const customerId of customerIds) {
        doc.customerId = customerId;
        const item = await createDealAndItem(
          models,
          subdomain,
          doc,
          cpUser,
          company,
          clientportal.dealStageId
        );
        items.push(item);
      }
      return items
    }

    if (customerId) {
      doc.customerId = customerId;
    }

    const item = await createDealAndItem(
      models,
      subdomain,
      doc,
      cpUser,
      company,
      clientportal.dealStageId
    );

    return item;
  },

  vendorEditInsuranceItem: async (
    _root,
    { _id, firstName, lastName, customFieldsData },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    await verifyVendor({
      subdomain,
      cpUser,
    });

    const item: any = await models.Items.findOne({ _id });

    if (!item) {
      throw new Error('Item not found');
    }

    if (firstName || lastName) {
      const customer = await sendCommonMessage({
        subdomain,
        action: 'customers.findOne',
        serviceName: 'contacts',
        isRPC: true,
        data: { _id: item.customerId },
        defaultValue: null,
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const modifier: any = {};

      if (firstName) {
        modifier.firstName = firstName;
      }

      if (lastName) {
        modifier.lastName = lastName;
      }

      await sendCommonMessage({
        subdomain,
        action: 'customers.updateOne',
        serviceName: 'contacts',
        isRPC: true,
        data: {
          selector: { _id: item.customerId },
          modifier,
        },
      });
    }

    const doc: any = {
      _id: item._id,
      searchDictionary: item.searchDictionary || {},
      ...customFieldsData,
    };

    if (firstName) {
      doc.searchDictionary.customerFirstName = firstName;
    }

    if (lastName) {
      doc.searchDictionary.customerLastName = lastName;
    }

    return models.Items.updateInsuranceItem(doc, cpUser.userId);
  },

  insuranceItemEdit: async (
    _root,
    { _id, doc },
    { models, subdomain, user }: IContext
  ) => {
    if (!user) {
      throw new Error('login required');
    }

    let item: any = await models.Items.updateOne({ _id }, doc);

    if (!item) {
      throw new Error('Item not found');
    }

    item = await models.Items.findOne({ _id });

    const product = await models.Products.findOne({
      _id: item.productId,
    });

    console.log('product', product);

    const vendorUser = await sendCommonMessage({
      subdomain,
      action: 'clientportalUsers.findOne',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: null,
      data: { _id: item.vendorUserId },
    });

    const vendor = await sendCommonMessage({
      subdomain,
      action: 'companies.findOne',
      serviceName: 'contacts',
      isRPC: true,
      data: { _id: vendorUser.erxesCompanyId },
      defaultValue: null,
    });

    await generateContract(models, subdomain, item, product, vendor);

    return item;
  },
};

export default mutations;
