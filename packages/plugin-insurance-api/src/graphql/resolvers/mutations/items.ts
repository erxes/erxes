// vendorAddInsuranceItem

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { IRiskDocument } from '../../../models/definitions/risks';
import { verifyVendor } from '../utils';

const mutations = {
  vendorAddInsuranceItem: async (
    _root,
    { doc },
    { models, cpUser, subdomain }: IContext,
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
        stageId: clientportal.dealStageId,
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

    if (customerIds && customerIds.length) {
      const conformities = customerIds.map((customerId) => ({
        mainType: 'deal',
        mainTypeId: deal._id,
        relType: 'customer',
        relTypeId: customerId,
      }));

      await sendCommonMessage({
        serviceName: 'core',
        subdomain,
        action: 'conformities.addConformities',
        data: conformities,
      });
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
      (config) => config.companyId === company._id,
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

    return insuranceItem;
  },

  vendorEditInsuranceItem: async (
    _root,
    { _id, firstName, lastName, customFieldsData },
    { models, cpUser, subdomain }: IContext,
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
};

export default mutations;
